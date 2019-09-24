'use strict';

const {Contract, Context} = require('fabric-contract-api');

// Fetch asset & participant classes
const Student = require('./models/student.js');
const StudentList = require('./lists/studentlist.js');
const Certificate = require('./models/certificate');
const CertificateList = require('./lists/certificatelist');

class CertnetContext extends Context {
	constructor() {
		super();
		// Add various legder lists to the custom context
		this.studentList = new StudentList(this);
		this.certificateList = new CertificateList(this);
	}
}

class CertnetContract extends Contract {
	
	constructor() {
		// Provide a custom name to refer to this smart contract
		super('org.certification-network.certnet');
	}
	
	// Built in method used to build and return the context for this smart contract
	createContext() {
		return new CertnetContext();
	}
	
	/* ****** All custom functions are defined below ***** */
	
	// This is a basic user defined function used at the time of instantiating the smart contract
	// to print the success message on console
	async instantiate(ctx) {
		console.log('Certnet Smart Contract Instantiated');
	}
	
	
	/**
	 * Create a new student account on the network
	 * @param ctx
	 * @param studentId
	 * @param name
	 * @param email
	 * @returns {Object}
	 */
	async createStudent(ctx, studentId, name, email) {
		let msgSender = ctx.clientIdentity.getID();
		let studentKey = Student.makeKey([studentId]);
		
		// Fetch student with given ID from blockchain
		let student = await ctx.studentList
				.getStudent(studentKey)
				.catch(err => console.log('Provided studentId is unique!'));
		
		// Make sure student does not already exist.
		if (student !== undefined) {
			throw new Error('Invalid Student ID: ' + studentId + '. A student with this ID already exists.');
		} else {
			let studentObject = {
				studentId: studentId,
				name: name,
				email: email,
				school: msgSender,
				createdAt: new Date(),
				updatedAt: new Date(),
			};
			// Create a new instance of student model and save it to blockchain
			let newStudentObject = Student.createInstance(studentObject);
			newStudentObject.setCurrentState('CREATED');
			await ctx.studentList.addStudent(newStudentObject);
			// Return value of new student account created
			return newStudentObject;
		}
	}
	
	
	/**
	 * Get a student account's details from the blockchain
	 * @param ctx - The transaction context
	 * @param studentId - Student ID for which to fetch details
	 * @returns {Object}
	 */
	async getStudent(ctx, studentId) {
		// Create the composite key required to fetch record from blockchain
		const studentKey = Student.makeKey([studentId]);
		
		// Return value of student account from blockchain
		return await ctx.studentList
				.getStudent(studentKey)
				.catch(err => console.log(err));
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
		let certificateKey = Certificate.makeKey([courseId + '-' + studentId]);
		let studentKey = Student.makeKey([studentId]);
		
		// Fetch student with given ID from blockchain
		let student = await ctx.studentList
				.getStudent(studentKey)
				.catch(err => console.log(err));
		
		// Fetch certificate with given ID from blockchain
		let certificate = await ctx.certificateList
				.getCertificate(certificateKey)
				.catch(err => console.log(err));
		
		// Make sure that student already exists and certificate with given ID does not exist.
		if (student === undefined || certificate !== undefined) {
			throw new Error('Invalid Student ID: ' + studentId + ' or Course ID: ' + courseId + '. Either student does not exist or certificate already exists.');
		} else {
			let certificateObject = {
				studentId: studentId,
				courseId: courseId,
				teacher: msgSender,
				certId: courseId + '-' + studentId,
				originalHash: originalHash,
				grade: gradeReceived,
				createdAt: new Date(),
				updatedAt: new Date(),
			};
			// Create a new instance of certificate model and save it to blockchain
			let newCertificateObject = Certificate.createInstance(certificateObject);
			newCertificateObject.setCurrentState('CREATED');
			await ctx.certificateList.addCertificate(newCertificateObject);
			// Return value of new certificate issued to student
			return newCertificateObject;
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
		let certificateKey = Certificate.makeKey([courseId + '-' + studentId]);
		
		// Fetch certificate with given ID from blockchain
		let certificate = await ctx.certificateList
				.getCertificate(certificateKey)
				.catch(err => console.log(err));
		
		// Check validity of certificate
		if (certificate === undefined || certificate.originalHash !== currentHash) {
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
			return "VALID CERTIFICATE!";
		}
	}
}

module.exports = CertnetContract;