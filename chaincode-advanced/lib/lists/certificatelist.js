'use strict';

const StateList = require('../../ledger-api/statelist.js');
const Certificate = require('../models/certificate');

class CertificateList extends StateList{
	
	constructor(ctx) {
		super(ctx, 'org.certification-network.certnet.lists.certificate');
		this.use(Certificate);
	}
	
	async getCertificate(certKey) {
		return this.getState(certKey);
	}
	
	async addCertificate(certificate) {
		return this.addState(certificate);
	}
	
	async updateCertificate(certificate) {
		return this.updateState(certificate);
	}
}

module.exports = CertificateList;