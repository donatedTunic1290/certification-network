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
	 * @param grade
	 * @returns {Promise<Buffer>}
	 */
	async createStudent(ctx, studentId, name, email, grade) {
		let msgSender = ctx.clientIdentity.getID();
		let studentKey = Student.makeKey([studentId]);
		
		// Fetch student with given ID from blockchain
		let student = await ctx.studentList
				.getStudent(studentKey)
				.catch(err => console.log(err));
		
		// Make sure student does not already exist.
		if (student !== undefined) {
			throw new Error('Invalid Student ID: ' + studentId + '. A student with this ID already exists.');
		} else {
			let studentObject = {
				studentId: studentId,
				name: name,
				email: email,
				grade: grade,
				owner: msgSender,
				createdAt: new Date(),
				updatedAt: new Date(),
			};
			// Create a new instance of student model and save it to blockchain
			let newStudent = Student.createInstance(studentObject);
			newStudent.setCurrentState('CREATED');
			await ctx.studentList.addStudent(newStudent);
			// Return value of new student account created
			return newStudent.toBuffer();
		}
	}
	
	/**
	 * Issue a certificate to the student after completing the course
	 * @param ctx
	 * @param studentId
	 * @param courseId
	 * @param certId
	 * @param originalHash
	 * @param grade
	 * @returns {Promise<Buffer>}
	 */
	async issueCertificate(ctx, studentId, courseId, certId, originalHash, grade) {
		let msgSender = ctx.clientIdentity.getID();
		let certificateKey = Certificate.makeKey([certId]);
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
			throw new Error('Invalid Student ID: ' + studentId + ' or Certificate ID: ' + certId + '. Either student does not exist or certificate already exists.');
		} else {
			let certificateObject = {
				studentId: studentId,
				courseId: courseId,
				teacher: msgSender,
				certId: certId,
				originalHash: originalHash,
				grade: grade,
				createdAt: new Date(),
				updatedAt: new Date(),
			};
			// Create a new instance of certificate model and save it to blockchain
			let newCertificate = Certificate.createInstance(certificateObject);
			newCertificate.setCurrentState('CREATED');
			await ctx.certificateList.addCertificate(newCertificate);
			// Return value of new certificate issued to student
			return newCertificate.toBuffer();
		}
	}
	
	/**
	 *
	 * @param ctx
	 * @param certId
	 * @param currentHash
	 * @returns {Promise<string>}
	 */
	async verifyCertificate(ctx, certId, currentHash) {
		let certificateKey = Certificate.makeKey([certId]);
		
		// Fetch certificate with given ID from blockchain
		let certificate = await ctx.certificateList
				.getCertificate(certificateKey)
				.catch(err => console.log(err));
		
		// Check validity of certificate
		if (certificate === undefined || certificate.originalHash !== currentHash) {
			return "INVALID CERTIFICATE!";
		} else {
			return "VALID CERTIFICATE!";
		}
	}
}

module.exports = CertnetContract;