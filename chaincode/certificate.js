'use strict';

class Certificate {
	
	/**
	 * Constructor function
	 * @param certificateObject
	 */
	constructor(certificateObject) {
		this.key = Certificate.makeKey([certificateObject.certId]);
		Object.assign(this, certificateObject);
	}
	
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
		let json = JSON.parse(buffer.toString());
		return new Certificate(json);
	}
	
	/**
	 * Convert the object of this model to a buffer stream
	 * @returns {Buffer}
	 */
	toBuffer() {
		return Buffer.from(JSON.stringify(this));
	}
	
	/**
	 * Create a key string joined from different key parts
	 * @param keyParts {Array}
	 * @returns {*}
	 */
	static makeKey(keyParts) {
		return keyParts.map(part => JSON.stringify(part)).join(":");
	}
	
	/**
	 * Return key parts for instance of this model
	 * @returns {Array}
	 */
	getKeyArray() {
		return this.key.split(":");
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