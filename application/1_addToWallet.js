'use strict';

/**
 * This is a Node.JS module to load a user's Identity to his wallet.
 * This Identity will be used to sign transactions initiated by this user.
 * Defaults:
 *  User Name: IIT_ADMIN
 *  User Organization: IIT
 *  User Role: Admin
 *
 */

const fs = require('fs'); // FileSystem Library
const { FileSystemWallet, X509WalletMixin } = require('fabric-network'); // Wallet Library provided by Fabric
const path = require('path'); // Support library to build filesystem paths in NodeJs

const crypto_materials = path.resolve(__dirname, '../network/crypto-config'); // Directory where all Network artifacts are stored

// A wallet is a filesystem path that stores a collection of Identities
const wallet = new FileSystemWallet('./identity/iit');

async function main() {
	
	// Main try/catch block
	try {
		
		// Fetch the credentials from our previously generated Crypto Materials required to create this user's identity
		const credentialPath = path.join(crypto_materials, '/peerOrganizations/iit.certification-network.com/users/Admin@iit.certification-network.com');
		const certificate = fs.readFileSync(path.join(credentialPath, '/msp/signcerts/Admin@iit.certification-network.com-cert.pem')).toString();
		// IMPORTANT: Change the private key name to the key generated on your computer
		const privatekey = fs.readFileSync(path.join(credentialPath, '/msp/keystore/afeb899edf89629d8915f7b39f758c8bbb0ff57b9452e0a7d35f53b40112b76f_sk')).toString();
		
		// Load credentials into wallet
		const identityLabel = 'IIT_ADMIN';
		const identity = X509WalletMixin.createIdentity('iitMSP', certificate, privatekey);
		
		await wallet.import(identityLabel, identity);
		
	} catch (error) {
		console.log(`Error adding to wallet. ${error}`);
		console.log(error.stack);
	}
}

main().then(() => {
	console.log('Added New Client Identity for Admin User in IIT\'s wallet.');
}).catch((e) => {
	console.log(e);
	console.log(e.stack);
	process.exit(-1);
});