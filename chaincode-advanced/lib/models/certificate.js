'use strict';

const State = require('../../ledger-api/state');

class Certificate extends State {
	
	/**
	 * Constructor function
	 * @param certificateObject
	 */
	constructor(certificateObject) {
		super(Certificate.getClass(), [certificateObject.certId]);
		Object.assign(this, certificateObject);
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
		return 'org.certification-network.certnet.models.certificate';
	}
	
	/**
	 * Convert the buffer stream received from blockchain into an object of this model
	 * @param buffer {Buffer}
	 */
	static fromBuffer(buffer) {
		return Certificate.deserialize(Buffer.from(JSON.parse(buffer.toString())));
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
		return Certificate.deserializeClass(data, Certificate);
	}
	
	/**
	 * Create a new instance of this model
	 * @returns {Certificate}
	 * @param certificateObject {Object}
	 */
	static createInstance(certificateObject) {
		return new Certificate(certificateObject);
	}
	
}

module.exports = Certificate;