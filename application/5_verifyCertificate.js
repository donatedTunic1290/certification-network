'use strict';

/**
 * This is a Node.JS application to Verify A Student's Certificate
 */

const helper = require('./contractHelper');

async function main(studentId, courseId, hash) {
	
	try {
		const certnetContract = await helper.getContractInstance();
		
		const listener = async (event) => {
			if (event.eventName === 'verifyCertificate') {
				const payload = JSON.parse(event.payload.toString());
				console.log('\n\n*** NEW EVENT ***');
				console.log(payload);
				console.log('\n\n');
			}
		};
		// Register a listener to listen to custom events triggered by this contract
		certnetContract.addContractListener(listener);
		
		// Create a new student account
		console.log('.....Verify Certificate Of Student');
		const verificationBuffer = await certnetContract.submitTransaction('verifyCertificate', studentId, courseId, hash);
		// process response

		return JSON.parse(verificationBuffer.toString());
		
	} catch (error) {
		
		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);
		
	} finally {
		
		// Disconnect from the fabric gateway
		helper.disconnect();
		
	}
}

module.exports.execute = main;
