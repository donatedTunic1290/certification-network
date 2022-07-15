const fs = require('fs');
const yaml = require('js-yaml');
const { Wallets, Gateway } = require('fabric-network');
let gateway;


async function getContractInstance() {
	
	// A gateway defines which peer is used to access Fabric network
	// It uses a common connection profile (CCP) to connect to a Fabric Peer
	// A CCP is defined manually in file connection-profile-iit.yaml
	gateway = new Gateway();
	
	// A wallet is where the credentials to be used for this transaction exist
	// Credentials for user IIT_ADMIN was initially added to this wallet.
	const wallet = await Wallets.newFileSystemWallet('./identity/org1');
	
	// What is the username of this Client user accessing the network?
	const fabricUserName = 'ORG1_ADMIN';
	
	// Load connection profile; will be used to locate a gateway; The CCP is converted from YAML to JSON.
	let connectionProfile = yaml.load(fs.readFileSync('./connection-org1.yaml', 'utf8'));
	
	// Set connection options; identity and wallet
	let connectionOptions = {
		wallet: wallet,
		identity: fabricUserName,
		discovery: { enabled: true, asLocalhost: true }
	};
	
	// Connect to gateway using specified parameters
	console.log('.....Connecting to Fabric Gateway');
	await gateway.connect(connectionProfile, connectionOptions);
	
	// Access certification channel
	console.log('.....Connecting to channel - mychannel');
	const channel = await gateway.getNetwork('mychannel');
	
	// Get instance of deployed Certnet contract
	// @param Name of chaincode
	// @param Name of smart contract
	console.log('.....Connecting to Certnet Smart Contract');
	return channel.getContract('certnet', 'certnet');
}

function disconnect() {
	console.log('.....Disconnecting from Fabric Gateway');
	gateway.disconnect();
}

module.exports.getContractInstance = getContractInstance;
module.exports.disconnect = disconnect;
