'use strict';

const {Contract} = require('fabric-contract-api');

class CertnetContract extends Contract {
	
	constructor() {
		// Provide a custom name to refer to this smart contract
		super('org.certification-network.certnet');
	}
	
	/* ****** All custom functions are defined below ***** */
	
	// This is a basic user defined function used at the time of instantiating the smart contract
	// to print the success message on console
	async instantiate(ctx) {
		console.log('Certnet Smart Contract Instantiated');
	}
	
	/**
	 * Create a new student account on the network
	 * @param ctx - The transaction context object
	 * @param studentId - ID to be used for creating a new student account
	 * @param name - Name of the student
	 * @param email - Email ID of the student
	 * @returns
	 */
	async createStudent(ctx, studentId, name, email) {
		// Create a new composite key for the new student account
		const studentKey = ctx.stub.createCompositeKey('org.certification-network.certnet.student', [studentId]);
		
		// Create a student object to be stored in blockchain
		let newStudentObject = {
			docType: 'student',
			studentId: studentId,
			name: name,
			email: email,
			school: ctx.clientIdentity.getID(),
			createdAt: new Date(),
			updatedAt: new Date(),
		};
		
		// Convert the JSON object to a buffer and send it to blockchain for storage
		let dataBuffer = Buffer.from(JSON.stringify(newStudentObject));
		await ctx.stub.putState(studentKey, dataBuffer);
		// Return value of new student account created to user
		return newStudentObject;
	}
	
	/**
	 * Get a student account's details from the blockchain
	 * @param ctx - The transaction context
	 * @param studentId - Student ID for which to fetch details
	 * @returns
	 */
	async getStudent(ctx, studentId) {
		// Create the composite key required to fetch record from blockchain
		const studentKey = ctx.stub.createCompositeKey('org.certification-network.certnet.student', [studentId]);
		
		// Return value of student account from blockchain
		let studentBuffer = await ctx.stub
				.getState(studentKey)
				.catch(err => console.log(err));
		return JSON.parse(studentBuffer.toString());
	}
	
	/**
	 * Get a range of student's account details from the blockchain
	 * @param ctx - The transaction context
	 * @param studentIdStart - Starting student ID for which to fetch details
	 * @param studentIdEnd - Ending student ID for which to fetch details
	 * @returns
	 */
	async getStudentsByRange(ctx, studentIdStart, studentIdEnd) {
		// Create the composite key required to fetch record from blockchain
		const studentStartKey = ctx.stub.createCompositeKey('org.certification-network.certnet.student', [studentIdStart]);
		const studentEndKey = ctx.stub.createCompositeKey('org.certification-network.certnet.student', [studentIdEnd]);
		
		// Return value of range of student accounts from blockchain
		let studentResultIterator = await ctx.stub
				.getStateByRange(studentStartKey, studentEndKey)
				.catch(err => console.log(err));
		return await this.iterateResults(studentResultIterator);
	}
	
	/**
	 * Get a list of student accounts linked to a school from the blockchain
	 * @param ctx - The transaction context
	 * @param school - School name for which student accounts need to be fetched
	 * @returns
	 */
	async getStudentsBySchool(ctx, school) {
		let query = {
			selector: {
				docType: 'student',
				school: school
			}
		};
		let queryString = JSON.stringify(query);
		console.info('- getStudentsBySchool queryString:\n' + queryString);
		let studentResultIterator = await ctx.stub
				.getQueryResult(queryString)
				.catch(err => console.log(err));
		
		return await this.iterateResults(studentResultIterator);
	}
	
	/**
	 * Get history of a key from database
	 * @param ctx - The transaction context
	 * @param key - Key for which history is to be fetched
	 * @returns
	 */
	async getHistoryForKey(ctx, key) {
		
		const studentKey = ctx.stub.createCompositeKey('org.certification-network.certnet.student', [key]);
		let historyResultIterator = await ctx.stub
				.getHistoryForKey(studentKey)
				.catch(err => console.log(err));
		
		return await this.iterateResults(historyResultIterator);
	}
	
	/**
	 * Issue a certificate to the student after completing the course
	 * @param ctx
	 * @param studentId
	 * @param courseId
	 * @param gradeReceived
	 * @param originalHash
	 * @returns {Object}
	 */
	async issueCertificate(ctx, studentId, courseId, gradeReceived, originalHash) {
		let msgSender = ctx.clientIdentity.getID();
		let certificateKey = ctx.stub.createCompositeKey('org.certification-network.certnet.certificate',[courseId + '-' + studentId]);
		let studentKey = ctx.stub.createCompositeKey('org.certification-network.certnet.student', [studentId]);
		
		// Fetch student with given ID from blockchain
		let student = await ctx.stub
				.getState(studentKey)
				.catch(err => console.log(err));
		
		// Fetch certificate with given ID from blockchain
		let certificate = await ctx.stub
				.getState(certificateKey)
				.catch(err => console.log(err));
		
		// Make sure that student already exists and certificate with given ID does not exist.
		if (student.length === 0 || certificate.length !== 0) {
			throw new Error('Invalid Student ID: ' + studentId + ' or Course ID: ' + courseId + '. Either student does not exist or certificate already exists.');
		} else {
			let certificateObject = {
				docType: 'certificate',
				studentId: studentId,
				courseId: courseId,
				teacher: msgSender,
				certId: courseId + '-' + studentId,
				originalHash: originalHash,
				grade: gradeReceived,
				createdAt: new Date(),
				updatedAt: new Date(),
			};
			// Convert the JSON object to a buffer and send it to blockchain for storage
			let dataBuffer = Buffer.from(JSON.stringify(certificateObject));
			await ctx.stub.putState(certificateKey, dataBuffer);
			// Return value of new certificate issued to student
			return certificateObject;
		}
	}
	
	/**
	 *
	 * @param ctx
	 * @param studentId
	 * @param courseId
	 * @param currentHash
	 * @returns {Object}
	 */
	async verifyCertificate(ctx, studentId, courseId, currentHash) {
		let verifier = ctx.clientIdentity.getID();
		let certificateKey = ctx.stub.createCompositeKey('org.certification-network.certnet.certificate', [courseId + '-' + studentId]);
		
		// Fetch certificate with given ID from blockchain
		let certificateBuffer = await ctx.stub
				.getState(certificateKey)
				.catch(err => console.log(err));
		
		// Convert the received certificate buffer to a JSON object
		const certificate = JSON.parse(certificateBuffer.toString());
		
		// Check if original certificate hash matches the current hash provided for certificate
		if (certificate === undefined || certificate.originalHash !== currentHash) {
			// Certificate is not valid, issue event notifying the student application
			let verificationResult = {
				certificate: courseId + '-' + studentId,
				student: studentId,
				verifier: verifier,
				result: 'xxx - INVALID',
				verifiedOn: new Date()
			};
			ctx.stub.setEvent('verifyCertificate', Buffer.from(JSON.stringify(verificationResult)));
			return verificationResult;
		} else {
			// Certificate is valid, issue event notifying the student application
			let verificationResult = {
				certificate: courseId + '-' + studentId,
				student: studentId,
				verifier: verifier,
				result: '*** - VALID',
				verifiedOn: new Date()
			};
			ctx.stub.setEvent('verifyCertificate', Buffer.from(JSON.stringify(verificationResult)));
			return verificationResult;
		}
	}
	
	
	/**
	 * Iterate through the StateQueryIterator object and return an array of all values contained in it
	 * @param iterator
	 * @returns {Promise<[JSON]>}
	 * [] {Key:, Value:} [{}], {Key:, Value:} [{},{}]
	 */
	async iterateResults(iterator) {
		let allResults = [];
		while (true) {
			let res = await iterator.next();
			
			if (res.value && res.value.value.toString()) {
				let jsonRes = {};
				console.log(res.value.value.toString());
				jsonRes.Key = res.value.key;
				try {
					jsonRes.Record = JSON.parse(res.value.value.toString());
				} catch (err) {
					console.log(err);
					jsonRes.Record = res.value.value.toString();
				}
				allResults.push(jsonRes);
			}
			if (res.done) {
				console.log('end of data');
				await iterator.close();
				console.info(allResults);
				return allResults;
			}
		}
	}
	
}

module.exports = CertnetContract;