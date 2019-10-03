'use strict';

const {Contract, Context} = require('fabric-contract-api');

const Student = require('./lib/models/student.js');
const Certificate = require('./lib/models/certificate.js');

const StudentList = require('./lib/lists/studentlist.js');
const CertificateList = require('./lib/lists/certificatelist.js');

class CertnetContext extends Context {
	constructor() {
		super();
		// Add various model lists to the context class object
		// this : the context instance
		this.studentList = new StudentList(this);
		this.certificateList = new CertificateList(this);
	}
}

class CertnetContract extends Contract {
	
	constructor() {
		// Provide a custom name to refer to this smart contract
		super('org.certification-network.certnet');
	}
	
	// Built in method used to build and return the context for this smart contract on every transaction invoke
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
	 * @param ctx - The transaction context object
	 * @param studentId - ID to be used for creating a new student account
	 * @param name - Name of the student
	 * @param email - Email ID of the student
	 * @returns
	 */
	async createStudent(ctx, studentId, name, email) {
		// Create a new composite key for the new student account
		const studentKey = Student.makeKey([studentId]);
		
		// Fetch student with given ID from blockchain
		let existingStudent = await ctx.studentList
				.getStudent(studentKey)
				.catch(err => console.log('Provided studentId is unique!'));
		
		// Make sure student does not already exist.
		if (existingStudent !== undefined) {
			throw new Error('Invalid Student ID: ' + studentId + '. A student with this ID already exists.');
		} else {
			// Create a student object to be stored in blockchain
			let studentObject = {
				studentId: studentId,
				name: name,
				email: email,
				school: ctx.clientIdentity.getID(),
				createdAt: new Date(),
				updatedAt: new Date(),
			};
			
			// Create a new instance of student model and save it to blockchain
			let newStudentObject = Student.createInstance(studentObject);
			await ctx.studentList.addStudent(newStudentObject);
			// Return value of new student account created to user
			return newStudentObject;
		}
	}
	
	/**
	 * Get a student account's details from the blockchain
	 * @param ctx - The transaction context
	 * @param studentId - Student ID for which to fetch details
	 * @returns
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
}

module.exports = CertnetContract;