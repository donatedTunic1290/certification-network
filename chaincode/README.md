# Chaincode Development

### 1. Create node.js project
1. Create new node project
```console
mkdir chaincode
cd chaincode
npm init
```
2. Update package.json with dependencies
```console
npm i
```

### 2. Write Basic Chaincode
1. Create contract.js & index.js
2. Update index.js and export contracts to module.exports.contracts
3. Update contract.js with basic functions


### 3. Deploy Chaincode on Test Network
```console
cd ..
cd test-network
./network.sh up
./network.sh createChannel
./network.sh deployCC -ccn certnet -ccl javascript -ccv 1 -ccs 1 -ccp ../chaincode -cci instantiate
```
### 4. Invoke Chaincode Functions
```console
export PATH=${PWD}/../bin:$PATH
export FABRIC_CFG_PATH=$PWD/../config/
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051

peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls true --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n certnet --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"function":"createStudent","Args":["0001","Aakash Bansal","connect@aakashbansal.com"]}'
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls true --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n certnet --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"function":"getStudent","Args":["0001"]}'
```

### 5. Finish Writing Chaincode
- Access Control
- Events

### 6. Re-deploy Chaincode on Test Network


### 5. Write Unit Tests


### 6. Fetching Transaction History
1. Updates to fabric network
2. Chaincode function
3. Invoke function to see result
