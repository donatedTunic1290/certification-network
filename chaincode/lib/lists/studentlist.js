'use strict';

const StateList = require('../../ledger-api/statelist.js');
const Student = require('../models/student.js');

class StudentList extends StateList{
	
	constructor(ctx) {
		super(ctx, 'org.certification-network.certnet.lists.student');
		this.use(Student);
	}
	
	/**
	 * Returns the Student model stored in blockchain identified by this key
	 * @param studentKey
	 * @returns {Promise<Student>}
	 */
	async getStudent(studentKey) {
		return this.getState(studentKey);
	}
	
	async addStudent(student) {
		return this.addState(student);
	}
	
	async updateStudent(student) {
		return this.updateState(student);
	}
}

module.exports = StudentList;