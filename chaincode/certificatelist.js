'use strict';

const Certificate = require('./certificate');

class CertificateList {
	
	constructor(ctx) {
		this.ctx = ctx;
		this.name = 'org.certification-network.certnet.lists.certificate';
	}
	
	/**
	 * Returns the Certificate model stored in blockchain identified by this key
	 * @param certificateKey
	 * @returns {Promise<Certificate>}
	 */
	async getCertificate(certificateKey) {
		let certificateCompositeKey = this.ctx.stub.createCompositeKey(this.name, key.split(':'));
		let certificateBuffer = await this.ctx.stub.getState(certificateCompositeKey);
		return Certificate.fromBuffer(certificateBuffer);
	}
	
	/**
	 * Adds a certificate model to the blockchain
	 * @param certificateObject {Certificate}
	 * @returns {Promise<void>}
	 */
	async addCertificate(certificateObject) {
		let certificateCompositeKey = this.ctx.stub.createCompositeKey(this.name, key.split(':'));
		let certificateBuffer = certificateObject.toBuffer();
		await this.ctx.stub.putState(certificateCompositeKey, certificateBuffer);
	}
	
	/**
	 * Updates a certificate model on the blockchain
	 * @param certificateObject {Certificate}
	 * @returns {Promise<void>}
	 */
	async updateCertificate(certificateObject) {
		let certificateCompositeKey = this.ctx.stub.createCompositeKey(this.name, key.split(':'));
		let certificateBuffer = certificateObject.toBuffer();
		await this.ctx.stub.putState(certificateCompositeKey, certificateBuffer);
	}
}

module.exports = CertificateList;