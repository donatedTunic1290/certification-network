'use strict';

const Student = require('./student.js');

class StudentList {
	
	constructor(ctx) {
		this.ctx = ctx;
		this.name = 'org.certification-network.certnet.lists.student';
	}
	
	/**
	 * Returns the Student model stored in blockchain identified by this key
	 * @param studentKey
	 * @returns {Promise<Student>}
	 */
	async getStudent(studentKey) {
		let studentCompositeKey = this.ctx.stub.createCompositeKey(this.name, studentKey.split(':'));
		let studentBuffer = await this.ctx.stub.getState(studentCompositeKey);
		return Student.fromBuffer(studentBuffer);
	}
	
	/**
	 * Adds a student model to the blockchain
	 * @param studentObject {Student}
	 * @returns {Promise<void>}
	 */
	async addStudent(studentObject) {
		let studentCompositeKey = this.ctx.stub.createCompositeKey(this.name, studentObject.getKeyArray());
		let studentBuffer = studentObject.toBuffer();
		await this.ctx.stub.putState(studentCompositeKey, studentBuffer);
	}
	
	/**
	 * Updates a student model on the blockchain
	 * @param studentObject {Student}
	 * @returns {Promise<void>}
	 */
	async updateStudent(studentObject) {
		let studentCompositeKey = this.ctx.stub.createCompositeKey(this.name, key.split(':'));
		let studentBuffer = studentObject.toBuffer();
		await this.ctx.stub.putState(studentCompositeKey, studentBuffer);
	}
}

module.exports = StudentList;