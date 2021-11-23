// Most blockchain functionality here using web3js

// Global variables to work with in file
var accounts;
var account;
var shuffled = false;
var randomSeed;
var player = '0x0000000000000000000000000000000000000000';
var houseOwner = '0x0000000000000000000000000000000000000000';
var accountBalance = 0;

// Log web provider
if (typeof web3 !== 'undefined') {
    console.log('Web3 Detected! ' + web3.currentProvider.constructor.name);
    web3 = new Web3(web3.currentProvider);
} else {
    // set the provider you want from Web3.providers
    console.log('No Web3 Detected... using HTTP Provider');
    web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}

// Declare contract address, if deployment is made again, CHANGE ADDRESS
// Also create contract instance, with ABI and address
var BJHouseAddress = "0xd315d27bf1534faC9df456AEeF56BB119C91dB1c";
var BlockJackHouse = new web3.eth.Contract([
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Approval",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Transfer",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "_from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "_to",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "_value",
				"type": "uint256"
			}
		],
		"name": "TransferChipsFromHouse",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "_from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "_to",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "_value",
				"type": "uint256"
			}
		],
		"name": "TransferEtherFromHouse",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "_from",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "_message",
				"type": "string"
			}
		],
		"name": "VRFCompleted",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			}
		],
		"name": "allowance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "approve",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "balanceOf",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_player",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_bet",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "_gameResult",
				"type": "string"
			}
		],
		"name": "blockJackGame",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_amount",
				"type": "uint256"
			}
		],
		"name": "cashIn",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address payable",
				"name": "_to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_amount",
				"type": "uint256"
			}
		],
		"name": "cashOut",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "createAccount",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "decimals",
		"outputs": [
			{
				"internalType": "uint8",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "subtractedValue",
				"type": "uint256"
			}
		],
		"name": "decreaseAllowance",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getDeckSeed",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getHouseOwner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getPlayerAccount",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getPlayerBalance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "addedValue",
				"type": "uint256"
			}
		],
		"name": "increaseAllowance",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_player",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_bet",
				"type": "uint256"
			}
		],
		"name": "lockedBet",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "name",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "players",
		"outputs": [
			{
				"internalType": "address",
				"name": "accountOwner",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "accountBalance",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "creationDate",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "funded",
				"type": "bool"
			},
			{
				"internalType": "int256",
				"name": "accountWinLossBalance",
				"type": "int256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "randomResult",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "requestId",
				"type": "bytes32"
			},
			{
				"internalType": "uint256",
				"name": "randomness",
				"type": "uint256"
			}
		],
		"name": "rawFulfillRandomness",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "shuffleDeckSeed",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "symbol",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalSupply",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "recipient",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "transfer",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "recipient",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "transferFrom",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address payable",
				"name": "_to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_amount",
				"type": "uint256"
			}
		],
		"name": "withdrawFromHouse",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
], BJHouseAddress); // Large array is contract ABI

// Log contract
console.log(BlockJackHouse);

// Log if metamask is installed
if (typeof window.ethereum !== 'undefined') {
    console.log('MetaMask is installed!');
}

// Function called when connecting wallet, it assigns the ownwerAccount, accountBalance on load, and houseOwner(contract owner)
async function getAccount(){
    accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    account = accounts[0];
    
	// when account not created, address returned is: 0x0000000000000000000000000000000000000000
	getAccountOwner();
	getAccountBalance();
	getHouseOwner();
	document.getElementById("logInButton").style.visibility = "visible";
}

// Assign onClick to login button, this makes visible all functionality functions and also creates account in blockchain if it doesn't exist
const logInButton = document.querySelector('#logInButton');

logInButton.addEventListener('click', () => {
	if(player == '0x0000000000000000000000000000000000000000') {
		var txOptions = {from: account};

		BlockJackHouse.methods.createAccount().send(txOptions, function(error, result){
			console.log("created account, hash: " + result);
		});
	}

	document.getElementById("playermoney").innerHTML = accountBalance + " BJX";

	document.getElementById("cashInSpan").style.visibility = "visible";
	document.getElementById("cashOutSpan").style.visibility = "visible";
	document.getElementById("shuffleButton").style.visibility = "visible";
	document.getElementById("checkShuffledButton").style.visibility = "visible";
	document.getElementById("logInButton").style.visibility = "hidden";

	// When user that logged in is also contract owener make withdraw button visible
	if(account == houseOwner) {
		document.getElementById("withdrawSpan").style.visibility = "visible";
	}
  
});


// Button to make withdrawals from smart contract
const withdrawButton = document.querySelector('#withdrawButton');

withdrawButton.addEventListener('click', () => {
	var withdrawAmount = document.getElementById('withdrawInput').value;
	withdrawAmountInWei = Web3.utils.toWei(withdrawAmount.toString(), 'ether');

	if(parseInt(withdrawAmount) >= 1) {
		var txOptions = {
			from: account
		};
	
		BlockJackHouse.methods.withdrawFromHouse(account, withdrawAmountInWei).send(txOptions, function(error, result){
			console.log("Withdrawn to owner, hash: " + result);
		}).then(()=>{ 
			console.log("Withdrawal complete, amount: " + withdrawAmount); 
		});
	}
    
});

// Connect wallet button
const ethereumButton = document.querySelector('#enableEthereumButton');

ethereumButton.addEventListener('click', () => {
  //Will Start the metamask extension
  getAccount();
  
});

//////////////// Access to contract, helper functions ////////////////
async function getAccountBalance(){
	var txOptions = {
		from: account
	};

	BlockJackHouse.methods.getPlayerBalance().call(txOptions, function(error, result){
		resultInEther = Web3.utils.fromWei(result.toString(), 'ether');
		accountBalance = parseInt(resultInEther);
	});
}

async function getAccountOwner(){

	var txOptions = {
		from: account
	};
    
	BlockJackHouse.methods.getPlayerAccount().call(txOptions, function(error, result){})
	.then(function(result) {
		player = result;
		// console.log(player);
	});
}

async function getHouseOwner(){
	var txOptions = {
		from: account
	};

	BlockJackHouse.methods.getHouseOwner().call(txOptions, function(error, result){
		// result is returned with address containing UPPERCASE, change to lowercase
		houseOwner = result.toLowerCase();
	});
}

// Shuffle button, this triggers contract function to call VRF 
const shuffleButton = document.querySelector('#shuffleButton');

shuffleButton.addEventListener('click', () => {
    var txOptions = {from: account};
    // console.log(txOptions);
    BlockJackHouse.methods.shuffleDeckSeed().send(txOptions, function(error, result){
        console.log("Shuffled deck, hash: " + result);
    });
    console.log("Shuffling deck...");

    var latestBlock = web3.eth.blockNumber; //get the latest blocknumber

    let options = {
        address: [account],
        fromBlock: latestBlock
    };
    
	// Set event listener that changes shuffled to true when recieving VRF from this address
    BlockJackHouse.events.VRFCompleted(options)
        .on('data', event => {
            console.log(event);
            shuffled = true;
        })
        .on('changed', changed => console.log(changed))
        .on('error', err => {throw err;})
        .on('connected', str => console.log("subscribed at: " + str));
});

// Cash in button, triggers cashIn contract method
const cashInButton = document.querySelector('#cashInButton');

cashInButton.addEventListener('click', async () => {
	var cashInAmount = parseInt(document.getElementById('cashInInput').value);
	cashInAmountInWei = Web3.utils.toWei(cashInAmount.toString(), 'ether');
	
	if(parseInt(cashInAmount) >= 1) {
		var txOptions = {
			from: account,
			value: cashInAmountInWei
		};
	
		BlockJackHouse.methods.cashIn(cashInAmountInWei).send(txOptions, function(error, result){
			console.log("Cashed in, hash: " + result);
		}).then(()=>{ 
			console.log("Cash in complete, amount: " + cashInAmount); 
			accountBalance += parseInt(cashInAmount);
			document.getElementById("playermoney").innerHTML = accountBalance + " BJX";
		});
	}
    
});

// Cash out button, triggers cashOut contract method
const cashOutButton = document.querySelector('#cashOutButton');

cashOutButton.addEventListener('click', () => {
	var cashOutAmount = document.getElementById('cashOutInput').value;
	cashOutAmountInWei = Web3.utils.toWei(cashOutAmount.toString(), 'ether');

	if(parseInt(cashOutAmount) >= 1) {
		var txOptions = {
			from: account
		};
	
		BlockJackHouse.methods.cashOut(account, cashOutAmountInWei).send(txOptions, function(error, result){
			console.log("Cashed out, hash: " + result);
		}).then(()=>{ 
			console.log("Cash out complete, amount: " + cashOutAmount); 
			accountBalance -= parseInt(cashOutAmount);
			document.getElementById("playermoney").innerHTML = " ";
			document.getElementById("playermoney").innerHTML = accountBalance + " BJX";
		});
	}
    
});