# Distributed Certification Network
A hyperledger fabric network to demonstrate certificate creation, exchange and verification between education providers. 

## Fabric Network
- 3 Organizations (MIT, UpGrad, Government)
- TLS Enabled
- 2 Peers per org
- Raft Ordering with single node



## Network Setup

### STEP 1: PRE SETUP
   1. **Install Hyperledger Fabric**
      ```console
       mkdir certification-network
       cd certification-network
       curl -sSL https://bit.ly/2ysbOFE | bash -s
   2. **Setup Development Environment** 
      1. Open project folder in Webstorm or Visual Studio or any other IDE 
      2. Copy bin and config folder from fabric-samples to project root. 
      3. Create organizations folder and cryptogen files
      4. ```console
         mkdir network
         cd network
         mkdir organizations
         cd organizations
         mkdir cryptogen
         cd cryptogen
      5. Create 4 crypto-config files
      
   3. **Generate Crypto Materials**
       ```console
      cd ..
      cd ..
      export PATH=${PWD}/../bin:$PATH
      cryptogen generate --config=./organizations/cryptogen/crypto-config-orderer.yaml --output="organizations"
      cryptogen generate --config=./organizations/cryptogen/crypto-config-mit.yaml --output="organizations"
      cryptogen generate --config=./organizations/cryptogen/crypto-config-upgrad.yaml --output="organizations"
      cryptogen generate --config=./organizations/cryptogen/crypto-config-government.yaml --output="organizations"
	
   4. **Generate Genesis Block Artifact**
      1. Create configtx file - network/configtx/configtx.yaml
      2. Add configtx filepath to environment
          ```console
         export FABRIC_CFG_PATH=${PWD}/configtx
      3. Run configtxgen tool to create artifact file
          ```console
          configtxgen -profile CertificationOrdererGenesis -channelID system-channel -outputBlock ./system-genesis-block/genesis.block


### STEP 2: START FABRIC NETWORK

   1. **Create Docker Network**
      1. Create Docker Compose File
             - network/docker/docker-compose-certnet.yaml
             - network/docker/docker-compose-ca.yaml
      2. Start Docker Network
          ```console
         export IMAGE_TAG=latest
         docker-compose -f docker/docker-compose-certnet.yaml -f docker/docker-compose-ca.yaml up -d
         docker ps -a

   2. **Configure Fabric Services on Docker Network**
       1. Generate Channel Creation Artifact 
           ```console
          configtxgen -profile CertificationChannel -outputCreateChannelTx ./channel-artifacts/certnet.tx -channelID certnet
       2. Create Channel from Peer0 of MIT
           ```console
          export FABRIC_CFG_PATH=$PWD/../config/
          export ORDERER_CA=${PWD}/organizations/ordererOrganizations/certification.com/orderers/orderer.certification.com/msp/tlscacerts/tlsca.certification.com-cert.pem
          export CORE_PEER_LOCALMSPID="mitMSP"
          export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/mit.certification.com/peers/peer0.mit.certification.com/tls/ca.crt
          export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/mit.certification.com/users/Admin@mit.certification.com/msp
          export CORE_PEER_ADDRESS=localhost:7051
          peer channel create -o localhost:7050 -c certnet --ordererTLSHostnameOverride orderer.certification.com -f ./channel-artifacts/certnet.tx --outputBlock "./channel-artifacts/certnet.block" --tls --cafile $ORDERER_CA
          
       3. Join Channel for Peer0 of MIT
           ```console
          export BLOCKFILE="./channel-artifacts/certnet.block"
          peer channel join -b $BLOCKFILE
       4. Join Channel for Peer1 of MIT
           ```console
           export CORE_PEER_ADDRESS=localhost:8051
           peer channel join -b $BLOCKFILE
       5. Join Channel for Peer0 of Upgrad
           ```console
          export CORE_PEER_LOCALMSPID="upgradMSP"
          export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/upgrad.certification.com/peers/peer0.upgrad.certification.com/tls/ca.crt
          export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/upgrad.certification.com/users/Admin@upgrad.certification.com/msp
          export CORE_PEER_ADDRESS=localhost:9051 
          peer channel join -b $BLOCKFILE
       6. Join Channel for Peer1 of Upgrad
           ```console
           export CORE_PEER_ADDRESS=localhost:10051
           peer channel join -b $BLOCKFILE
       7. Join Channel for Peer0 of Government
           ```console
           export CORE_PEER_LOCALMSPID="governmentMSP"
           export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/government.certification.com/peers/peer0.government.certification.com/tls/ca.crt
           export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/government.certification.com/users/Admin@government.certification.com/msp
           export CORE_PEER_ADDRESS=localhost:11051
           peer channel join -b $BLOCKFILE
       8. Join Channel for Peer1 of Government
           ```console
           export CORE_PEER_ADDRESS=localhost:12051
           peer channel join -b $BLOCKFILE
       9. Update channel config to define anchor peer for MIT 
           ```console
          docker exec -it cli /bin/bash 
          
          export ORDERER_CA=${PWD}/organizations/ordererOrganizations/certification.com/orderers/orderer.certification.com/msp/tlscacerts/tlsca.certification.com-cert.pem
          export CORE_PEER_LOCALMSPID="mitMSP"
          export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/mit.certification.com/peers/peer0.mit.certification.com/tls/ca.crt
          export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/mit.certification.com/users/Admin@mit.certification.com/msp
          export CORE_PEER_ADDRESS=peer0.mit.certification.com:7051
          peer channel fetch config config_block.pb -o orderer.certification.com:7050 --ordererTLSHostnameOverride orderer.certification.com -c certnet --tls --cafile $ORDERER_CA
          
          configtxlator proto_decode --input config_block.pb --type common.Block | jq .data.data[0].payload.data.config >"${CORE_PEER_LOCALMSPID}config.json"
          export HOST="peer0.mit.certification.com"
          export PORT=7051
          jq '.channel_group.groups.Application.groups.'${CORE_PEER_LOCALMSPID}'.values += {"AnchorPeers":{"mod_policy": "Admins","value":{"anchor_peers": [{"host": "'$HOST'","port": '$PORT'}]},"version": "0"}}' ${CORE_PEER_LOCALMSPID}config.json > ${CORE_PEER_LOCALMSPID}modified_config.json
          
          configtxlator proto_encode --input "${CORE_PEER_LOCALMSPID}config.json" --type common.Config >original_config.pb
          configtxlator proto_encode --input "${CORE_PEER_LOCALMSPID}modified_config.json" --type common.Config >modified_config.pb
          configtxlator compute_update --channel_id "certnet" --original original_config.pb --updated modified_config.pb >config_update.pb
          configtxlator proto_decode --input config_update.pb --type common.ConfigUpdate >config_update.json
          echo '{"payload":{"header":{"channel_header":{"channel_id":"certnet", "type":2}},"data":{"config_update":'$(cat config_update.json)'}}}' | jq . >config_update_in_envelope.json
          configtxlator proto_encode --input config_update_in_envelope.json --type common.Envelope >"${CORE_PEER_LOCALMSPID}anchors.tx"
          
          peer channel update -o orderer.certification.com:7050 --ordererTLSHostnameOverride orderer.certification.com -c certnet -f ${CORE_PEER_LOCALMSPID}anchors.tx --tls --cafile $ORDERER_CA

       10. Update channel config to define anchor peer for Upgrad
           ```console
           export CORE_PEER_LOCALMSPID="upgradMSP"
           export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/upgrad.certification.com/peers/peer0.upgrad.certification.com/tls/ca.crt
           export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/upgrad.certification.com/users/Admin@upgrad.certification.com/msp
           export CORE_PEER_ADDRESS=peer0.upgrad.certification.com:9051 
           peer channel fetch config config_block.pb -o orderer.certification.com:7050 --ordererTLSHostnameOverride orderer.certification.com -c certnet --tls --cafile $ORDERER_CA

           configtxlator proto_decode --input config_block.pb --type common.Block | jq .data.data[0].payload.data.config >"${CORE_PEER_LOCALMSPID}config.json"
           export HOST="peer0.upgrad.certification.com"
           export PORT=9051
           jq '.channel_group.groups.Application.groups.'${CORE_PEER_LOCALMSPID}'.values += {"AnchorPeers":{"mod_policy": "Admins","value":{"anchor_peers": [{"host": "'$HOST'","port": '$PORT'}]},"version": "0"}}' ${CORE_PEER_LOCALMSPID}config.json > ${CORE_PEER_LOCALMSPID}modified_config.json
          
           configtxlator proto_encode --input "${CORE_PEER_LOCALMSPID}config.json" --type common.Config >original_config.pb
           configtxlator proto_encode --input "${CORE_PEER_LOCALMSPID}modified_config.json" --type common.Config >modified_config.pb
           configtxlator compute_update --channel_id "certnet" --original original_config.pb --updated modified_config.pb >config_update.pb
           configtxlator proto_decode --input config_update.pb --type common.ConfigUpdate >config_update.json
           echo '{"payload":{"header":{"channel_header":{"channel_id":"certnet", "type":2}},"data":{"config_update":'$(cat config_update.json)'}}}' | jq . >config_update_in_envelope.json
           configtxlator proto_encode --input config_update_in_envelope.json --type common.Envelope >"${CORE_PEER_LOCALMSPID}anchors.tx"
          
           peer channel update -o orderer.certification.com:7050 --ordererTLSHostnameOverride orderer.certification.com -c certnet -f ${CORE_PEER_LOCALMSPID}anchors.tx --tls --cafile $ORDERER_CA
   
       11. Update channel config to define anchor peer for Government
           ```console
           export CORE_PEER_LOCALMSPID="governmentMSP"
           export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/government.certification.com/peers/peer0.government.certification.com/tls/ca.crt
           export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/government.certification.com/users/Admin@government.certification.com/msp
           export CORE_PEER_ADDRESS=peer0.government.certification.com:11051 
           peer channel fetch config config_block.pb -o orderer.certification.com:7050 --ordererTLSHostnameOverride orderer.certification.com -c certnet --tls --cafile $ORDERER_CA

           configtxlator proto_decode --input config_block.pb --type common.Block | jq .data.data[0].payload.data.config >"${CORE_PEER_LOCALMSPID}config.json"
           export HOST="peer0.government.certification.com"
           export PORT=11051
           jq '.channel_group.groups.Application.groups.'${CORE_PEER_LOCALMSPID}'.values += {"AnchorPeers":{"mod_policy": "Admins","value":{"anchor_peers": [{"host": "'$HOST'","port": '$PORT'}]},"version": "0"}}' ${CORE_PEER_LOCALMSPID}config.json > ${CORE_PEER_LOCALMSPID}modified_config.json
          
           configtxlator proto_encode --input "${CORE_PEER_LOCALMSPID}config.json" --type common.Config >original_config.pb
           configtxlator proto_encode --input "${CORE_PEER_LOCALMSPID}modified_config.json" --type common.Config >modified_config.pb
           configtxlator compute_update --channel_id "certnet" --original original_config.pb --updated modified_config.pb >config_update.pb
           configtxlator proto_decode --input config_update.pb --type common.ConfigUpdate >config_update.json
           echo '{"payload":{"header":{"channel_header":{"channel_id":"certnet", "type":2}},"data":{"config_update":'$(cat config_update.json)'}}}' | jq . >config_update_in_envelope.json
           configtxlator proto_encode --input config_update_in_envelope.json --type common.Envelope >"${CORE_PEER_LOCALMSPID}anchors.tx"
          
           peer channel update -o orderer.certification.com:7050 --ordererTLSHostnameOverride orderer.certification.com -c certnet -f ${CORE_PEER_LOCALMSPID}anchors.tx --tls --cafile $ORDERER_CA
           
           exit


### STEP 3: DEPLOY CHAINCODE

1. **Package**
   ```console
   export CHANNEL_NAME=certnet
   export CC_NAME=demo
   export CC_SRC_PATH=../chaincode
   export CC_RUNTIME_LANGUAGE=node
   export CC_VERSION=1.0
   export CC_SEQUENCE=1
   export FABRIC_CFG_PATH=$PWD/../config/
   peer lifecycle chaincode package ${CC_NAME}.tar.gz --path ${CC_SRC_PATH} --lang ${CC_RUNTIME_LANGUAGE} --label ${CC_NAME}_${CC_VERSION}

2. **Install**
   1. On Peer0 of MIT
      ```console
      export ORDERER_CA=${PWD}/organizations/ordererOrganizations/certification.com/orderers/orderer.certification.com/msp/tlscacerts/tlsca.certification.com-cert.pem
      export CORE_PEER_LOCALMSPID="mitMSP"
      export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/mit.certification.com/peers/peer0.mit.certification.com/tls/ca.crt
      export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/mit.certification.com/users/Admin@mit.certification.com/msp
      export CORE_PEER_ADDRESS=localhost:7051
      peer lifecycle chaincode install ${CC_NAME}.tar.gz
      
   2. On Peer1 of MIT
       ```console
       export CORE_PEER_ADDRESS=localhost:8051
       peer lifecycle chaincode install ${CC_NAME}.tar.gz
      
   3. On Peer0 of Upgrad
      ```console
      export CORE_PEER_LOCALMSPID="upgradMSP"
      export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/upgrad.certification.com/peers/peer0.upgrad.certification.com/tls/ca.crt
      export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/upgrad.certification.com/users/Admin@upgrad.certification.com/msp
      export CORE_PEER_ADDRESS=localhost:9051
      peer lifecycle chaincode install ${CC_NAME}.tar.gz
      
   4. On Peer1 of Upgrad
      ```console
      export CORE_PEER_ADDRESS=localhost:10051
      peer lifecycle chaincode install ${CC_NAME}.tar.gz
      
   5. On Peer0 of Government
      ```console
      export CORE_PEER_LOCALMSPID="governmentMSP"
      export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/government.certification.com/peers/peer0.government.certification.com/tls/ca.crt
      export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/government.certification.com/users/Admin@government.certification.com/msp
      export CORE_PEER_ADDRESS=localhost:11051
      peer lifecycle chaincode install ${CC_NAME}.tar.gz
      
   6. On Peer1 of Government
      ```console
      export CORE_PEER_ADDRESS=localhost:12051
      peer lifecycle chaincode install ${CC_NAME}.tar.gz

3. **Query**
   ```console
   peer lifecycle chaincode queryinstalled
   export PACKAGE_ID=<copy package ID from above command's response>

4. **Approve**
    1. Approve for MIT Organisation
        ```console
       export CORE_PEER_LOCALMSPID="mitMSP"
       export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/mit.certification.com/peers/peer0.mit.certification.com/tls/ca.crt
       export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/mit.certification.com/users/Admin@mit.certification.com/msp
       export CORE_PEER_ADDRESS=localhost:7051
       peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.certification.com --tls --cafile $ORDERER_CA --channelID certnet --name ${CC_NAME} --version ${CC_VERSION} --package-id ${PACKAGE_ID} --sequence ${CC_SEQUENCE}
       
    2. Approve for Upgrad Organisation
        ```console
       export CORE_PEER_LOCALMSPID="upgradMSP"
       export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/upgrad.certification.com/peers/peer0.upgrad.certification.com/tls/ca.crt
       export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/upgrad.certification.com/users/Admin@upgrad.certification.com/msp
       export CORE_PEER_ADDRESS=localhost:9051
       peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.certification.com --tls --cafile $ORDERER_CA --channelID certnet --name ${CC_NAME} --version ${CC_VERSION} --package-id ${PACKAGE_ID} --sequence ${CC_SEQUENCE}
       
    3. Approve for Government Organisation
        ```console
       export CORE_PEER_LOCALMSPID="governmentMSP"
       export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/government.certification.com/peers/peer0.government.certification.com/tls/ca.crt
       export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/government.certification.com/users/Admin@government.certification.com/msp
       export CORE_PEER_ADDRESS=localhost:11051
       peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.certification.com --tls --cafile $ORDERER_CA --channelID certnet --name ${CC_NAME} --version ${CC_VERSION} --package-id ${PACKAGE_ID} --sequence ${CC_SEQUENCE}
       
5. **Check Commit Readiness**
    ```console
    peer lifecycle chaincode checkcommitreadiness --channelID certnet --name ${CC_NAME} --version ${CC_VERSION} --sequence ${CC_SEQUENCE} --output json
       
6. **Commit**
    ```console
    peer lifecycle chaincode commit -o localhost:7050 --ordererTLSHostnameOverride orderer.certification.com --tls --cafile $ORDERER_CA --channelID certnet --name ${CC_NAME} --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/mit.certification.com/peers/peer0.mit.certification.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/upgrad.certification.com/peers/peer0.upgrad.certification.com/tls/ca.crt --peerAddresses localhost:11051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/government.certification.com/peers/peer0.government.certification.com/tls/ca.crt --version ${CC_VERSION} --sequence ${CC_SEQUENCE}
       
7. **Query Committed**
    ```console
    peer lifecycle chaincode querycommitted --channelID certnet --name ${CC_NAME}
    
8. **Invoke**
   1. Invoke Create Student Function
       ```console
       peer chaincode invoke -o localhost:7050 -C certnet -n demo -c '{"Args":["org.certification-network.certnet:createStudent","0001","Aakash Bansal","connect@aakashbansal.com"]}' --tls --cafile $ORDERER_CA
