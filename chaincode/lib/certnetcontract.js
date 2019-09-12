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
	
	async createStudent(ctx, studentId, name, email, grade) {
		let msgSender = ctx.clientIdentity.getID();
		let studentKey = Student.makeKey([studentId]);
		// Checking if the user already exists
		let student = await ctx.studentList
				.getStudent(studentKey)
				.catch(err => console.log(err));
		
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
			let newStudent = Student.createInstance(studentObject);
			newStudent.setCurrentState('CREATED');
			await ctx.studentList.addStudent(newStudent);
			return newStudent.toBuffer();
		}
	}
}

module.exports = CertnetContract;