'use strict';

const State = require('../../ledger-api/state');

class Student extends State {
	
	/**
	 * Constructor function
	 * @param studentObject {Object}
	 */
	constructor(studentObject) {
		super(Student.getClass(), [studentObject.studentId]);
		Object.assign(this, studentObject);
	}
	
	// Getters and Setters
	
	/**
	 * Set the value of currentState
	 * @param newState {String}
	 */
	setCurrentState(newState) {
		this.currentState = newState;
	}
	
	
	// Helper Functions
	
	/**
	 * Get class of this model
	 * @returns {string}
	 */
	static getClass() {
		return 'org.certification-network.certnet.models.student';
	}
	
	/**
	 * Convert the buffer stream received from blockchain into an object of this model
	 * @param buffer {Buffer}
	 */
	static fromBuffer(buffer) {
		return Student.deserialize(Buffer.from(JSON.parse(buffer.toString())));
	}
	
	/**
	 * Convert the object of this model to a buffer stream
	 * @returns {Buffer}
	 */
	toBuffer() {
		return Buffer.from(JSON.stringify(this));
	}
	
	/**
	 * Convert the buffer steam into an object of this model
	 * @param data {Buffer}
	 */
	static deserialize(data) {
		return Student.deserializeClass(data, Student);
	}
	
	/**
	 * Create a new instance of this model
	 * @returns {Student}
	 * @param studentObject {Object}
	 */
	static createInstance(studentObject) {
		return new Student(studentObject);
	}
	
}

module.exports = Student;