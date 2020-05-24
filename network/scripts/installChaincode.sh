#!/bin/bash

echo
echo " ____    _____      _      ____    _____ "
echo "/ ___|  |_   _|    / \    |  _ \  |_   _|"
echo "\___ \    | |     / _ \   | |_) |   | |  "
echo " ___) |   | |    / ___ \  |  _ <    | |  "
echo "|____/    |_|   /_/   \_\ |_| \_\   |_|  "
echo
echo "Deploying Chaincode CERTNET On Certification Network"
echo
CHANNEL_NAME="$1"
DELAY="$2"
LANGUAGE="$3"
VERSION="$4"
TYPE="$5"
: ${CHANNEL_NAME:="certificationchannel"}
: ${DELAY:="5"}
: ${LANGUAGE:="node"}
: ${VERSION:=1.1}
: ${TYPE="basic"}

LANGUAGE=`echo "$LANGUAGE" | tr [:upper:] [:lower:]`
ORGS="iit mhrd upgrad"
TIMEOUT=15
COUNTER=1
MAX_RETRY=20
PACKAGE_ID=""
CC_RUNTIME_LANGUAGE="node"

if [ "$TYPE" = "basic" ]; then
  CC_SRC_PATH="/opt/gopath/src/github.com/hyperledger/fabric/peer/chaincode/"
else
  CC_SRC_PATH="/opt/gopath/src/github.com/hyperledger/fabric/peer/chaincode-advanced/"
fi

echo "Channel name : "$CHANNEL_NAME

# import utils
. scripts/utils.sh

## at first we package the chaincode on peer0 of all 3 orgs
echo "Packaging chaincode on peer0.iit.certification-network.com ..."
packageChaincode $VERSION 0 'iit'

## Install new version of chaincode on peer0 of all 3 orgs making them endorsers
echo "Installing chaincode on peer0.iit.certification-network.com ..."
installChaincode 0 'iit'
echo "Installing chaincode on peer0.mhrd.certification-network.com ..."
installChaincode 0 'mhrd'
echo "Installing chaincode on peer0.upgrad.certification-network.com ..."
installChaincode 0 'upgrad'

## Query whether the chaincode is installed for IIT - peer0
queryInstalled 0 'iit'
## Approve the definition for IIT - peer0
approveForMyOrg $VERSION 0 'iit'
## Query whether the chaincode is installed for MHRD - peer0
queryInstalled 0 'mhrd'
## Approve the definition for MHRD - peer0
approveForMyOrg $VERSION 0 'mhrd'
## Query whether the chaincode is installed for UPGRAD - peer0
queryInstalled 0 'upgrad'
## Approve the definition for UPGRAD - peer0
approveForMyOrg $VERSION 0 'upgrad'

## now that all orgs have approved the definition, commit the definition
echo "Committing chaincode definition on channel after getting approval from majority orgs..."
commitChaincodeDefinition $VERSION 0 'iit' 0 'mhrd' 0 'upgrad'

## Invoke chaincode first time with --isInit flag to instantiate the chaincode
echo "Invoking chaincode with --isInit flag to instantiate the chaincode on channel..."
chaincodeInvoke 0 'iit' 0 'mhrd' 0 'upgrad'

echo
echo "========= All GOOD, Chaincode CERTNET Is Now Installed & Instantiated On Certification Network =========== "
echo

echo
echo " _____   _   _   ____   "
echo "| ____| | \ | | |  _ \  "
echo "|  _|   |  \| | | | | | "
echo "| |___  | |\  | | |_| | "
echo "|_____| |_| \_| |____/  "
echo

exit 0
