'use strict';

/**
 * This is a Node.JS application to Verify A Student's Certificate
 * Defaults:
 * StudentID: 0001
 * CourseID: PGDBC
 * Certificate Hash: asdfgh
 */

const helper = require('./contractHelper');

async function main() {
	
	try {
		const certnetContract = await helper.getContractInstance();
		
		// Create a new student account
		console.log('.....Verify Certificate Of Student');
		const verificationBuffer = await certnetContract.submitTransaction('verifyCertificate', '0001', 'PGDBC', 'asdfg');
		
		// process response
		console.log('.....Processing Verify Certificate Transaction Response \n\n');
		let verifyResult = verificationBuffer.toString();
		console.log(verifyResult);
		console.log('\n\n.....Verify Certificate Transaction Complete!');
		
	} catch (error) {
		
		console.log(`\n\n ${error} \n\n`);
		
	} finally {
		
		// Disconnect from the fabric gateway
		helper.disconnect();
		
	}
}

main().then(() => {
	
	console.log('.....API Execution Complete!');
	
}).catch((e) => {
	
	console.log('.....Transaction Exception: ');
	console.log(e);
	console.log(e.stack);
	process.exit(-1);
	
});