'use strict';

/**
 * This is a Node.JS module to load a user's Identity to his wallet.
 * This Identity will be used to sign transactions initiated by this user.
 * Defaults:
 *  User Name: ORG1_ADMIN
 *  User Organization: ORG1
 *  User Role: Admin
 *
 */

const fs = require('fs'); // FileSystem Library
const { Wallets} = require('fabric-network'); // Wallet Library provided by Fabric

async function main(certificatePath, privateKeyPath) {
	
	// Main try/catch block
	try {
		
		// A wallet is a filesystem path that stores a collection of Identities
		const wallet = await Wallets.newFileSystemWallet('./identity/org1');
		
		// Fetch the credentials from our previously generated Crypto Materials required to create this user's identity
		const certificate = fs.readFileSync(certificatePath).toString();
		const privatekey = fs.readFileSync(privateKeyPath).toString();
		
		// Load credentials into wallet
		const identityLabel = 'ORG1_ADMIN';
		const identity = {
			credentials: {
				certificate: certificate,
				privateKey: privatekey
			},
			mspId: 'Org1MSP',
			type: 'X.509'
		};
		
		await wallet.put(identityLabel, identity);
		
	} catch (error) {
		console.log(`Error adding to wallet. ${error}`);
		console.log(error.stack);
		throw new Error(error);
	}
}

const certificatePath = '/Users/aakash/WebstormProjects/upgrad/certification-network/test-network/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/signcerts/Admin@org1.example.com-cert.pem';
const privateKeyPath = '/Users/aakash/WebstormProjects/upgrad/certification-network/test-network/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/keystore/priv_sk';
main(certificatePath, privateKeyPath);

// module.exports.execute = main;
