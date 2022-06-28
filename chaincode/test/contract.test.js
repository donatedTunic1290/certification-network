'use strict';
// Istanbul.js, mocha (chai), sinon (fakes, spy)
const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const expect = chai.expect;

const { Context } = require('fabric-contract-api');
const { ChaincodeStub, ClientIdentity } = require('fabric-shim');

const Certnet = require('../contract.js');

let assert = sinon.assert;
chai.use(sinonChai);

describe('Certnet Tests', () => {
	let transactionContext, chaincodeStub, clientIdentity, student, certificate;
	
	beforeEach(() => {
		transactionContext = new Context();
		
		chaincodeStub = sinon.createStubInstance(ChaincodeStub);
		chaincodeStub.getMspID.returns('upgrad');
		transactionContext.setChaincodeStub(chaincodeStub);
		
		clientIdentity = sinon.createStubInstance(ClientIdentity);
		clientIdentity.getMSPID.returns('upgrad');
		transactionContext.clientIdentity = clientIdentity;
		
		chaincodeStub.createCompositeKey.callsFake((domain, keyParts) => {
			return domain + "." + keyParts.join(".");
		});
		
		chaincodeStub.putState.callsFake((key, value) => {
			if (!chaincodeStub.states) {
				chaincodeStub.states = {};
			}
			chaincodeStub.states[key] = value;
		});
		
		chaincodeStub.getState.callsFake(async (key) => {
			let ret;
			if (chaincodeStub.states) {
				ret = chaincodeStub.states[key];
			}
			return Promise.resolve(ret);
		});
		
		chaincodeStub.deleteState.callsFake(async (key) => {
			if (chaincodeStub.states) {
				delete chaincodeStub.states[key];
			}
			return Promise.resolve(key);
		});
		
		chaincodeStub.getStateByRange.callsFake(async () => {
			function* internalGetStateByRange() {
				if (chaincodeStub.states) {
					// Shallow copy
					const copied = Object.assign({}, chaincodeStub.states);
					
					for (let key in copied) {
						yield {value: copied[key]};
					}
				}
			}
			
			return Promise.resolve(internalGetStateByRange());
		});
		
		student = {
			docType: 'student',
			studentId: '0001',
			name: 'Aakash Bansal',
			email: 'connect@aakashbansal.com'
		};
		
	});
	
	describe('Test Certnet', () => {
		it('should return error on CreateStudent', async () => {
			chaincodeStub.putState.rejects('failed inserting key');
			
			let certnet = new Certnet();
			try {
				await certnet.createStudent(transactionContext, student.studentId, student.name, student.email);
				assert.fail('CreateStudent should have failed');
			} catch(err) {
				expect(err.name).to.equal('failed inserting key');
			}
		});
		
		it('should return success on CreateStudent', async () => {
			let certnet = new Certnet();
			
			await certnet.createStudent(transactionContext, student.studentId, student.name, student.email);
			const ret = await certnet.getStudent(transactionContext, student.studentId);
			delete ret.createdAt;
			delete ret.updatedAt;
			expect(ret).to.eql(student);
		});
	});
	
	describe('Test GetStudent', () => {
		it('should return error on GetStudent', async () => {
			let certnet = new Certnet();
			await certnet.createStudent(transactionContext, student.studentId, student.name, student.email);
			
			try {
				const resp = await certnet.getStudent(transactionContext, '0002');
				assert.fail(resp);
			} catch (err) {
				expect(err.message).to.equal('Asset with key 0002 does not exist on the network');
			}
		});
		
		it('should return success on GetStudent', async () => {
			let certnet = new Certnet();
			await certnet.createStudent(transactionContext, student.studentId, student.name, student.email);
			const readStudent = await certnet.getStudent(transactionContext, '0001');
			delete readStudent.createdAt;
			delete readStudent.updatedAt;
			expect(readStudent).to.eql(student);
		});
	});
});
