// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "./ERC20.sol";
import "./RandomNumberConsumer.sol";

contract BlockJackHouse is ERC20, RandomNumberConsumer {
    // private randomSeed; // seed sent to shuffle decks now returned from RandomNumberConsumer
    address houseOwner;
    uint256 houseFunds; // ether counter of contract funds
    uint256 houseChips; // balance of BJX tokens
    
    // Players can create an account with their address, and they can ask for a free funding before having to trade in ether for BJX
    struct PlayerAccount {
        address accountOwner;
        uint accountBalance;
        uint creationDate;
        bool funded; // 0 --> false, not funded yet
        int accountWinLossBalance;
    }
    
    modifier onlyHouseOwner {
        require(houseOwner == msg.sender, "Only the BlockJackHouse owner can do this");
        _;
    }
    
    modifier enoughCashIn {
        require(msg.value >= 1000000000000000000, "You have to cash in with 1 or more eth"); // amount sent is greater than 1 eth
        _;
    }
    
    modifier enoughCashOut(uint256 _amount) {
        require(_amount >= 1000000000000000000, "You have to cash out 1 or more eth"); // amount to withdraw is greater than 1 eth
        require(players[msg.sender].accountBalance >= _amount, "Not enough chips to cash out"); // amount to withdraw is enough
        _;
    }
    
    modifier enoughHouseFunds(uint256 _amount) {
        require(houseFunds >= _amount, "Not enough house funds"); // amount sent is greater than 1 eth
        _;
    }
    
    event TransferChipsFromHouse(address indexed _from, address indexed _to, uint256 _value);
    event TransferEtherFromHouse(address indexed _from, address indexed _to, uint256 _value);
    
    mapping(address => PlayerAccount) public players;
    
    function createAccount() public {
        PlayerAccount memory player;
        player.accountOwner = msg.sender;
        player.accountBalance = 0;
        player.creationDate = block.timestamp;
        player.accountWinLossBalance = 0;
        players[msg.sender] = player;
    }
    
    // Initialize BlockJackHouse with ERC20 token and RandomNumberConsumer
    constructor() ERC20("BlackJack Coin", "BJX") {
        //_mint(msg.sender, 1000000000000000000000000000); // supply de 1,000,000 ethers
        _mint(address(this), 10000000000000000000);
        
        
        houseOwner = msg.sender;
        houseFunds = 0; // to check ether balance
        
        
    } 
    
    // Function to trigger call to VRF Consumer Base
    function shuffleDeckSeed() external {
        getRandomNumber();
    }
    
    // Function to get random seed, only called from front end when VRFCompleted event is emited
    function getDeckSeed() external view returns(uint256) {
        return sendRandomNumber();
    }
    
    // Transfers:
    // When using {address}.transfer()... it transfers ethers
    // When using transfer({address}...) it uses the tokens
    
    
    // Function to cashIn, in other words exchange some ether for BJX tokens
    function cashIn(uint _amount) public enoughCashIn payable { // make it payable so player can deposit ether
        houseFunds += _amount;
        
        _mint(msg.sender, _amount);
        emit TransferChipsFromHouse(address(this), msg.sender, _amount);
        players[msg.sender].accountBalance += _amount;
        
    }
    
    // Function to cashOut, in other words exchange some BJX tokens for ether
    function cashOut(address payable _to, uint _amount) public enoughCashOut(_amount) enoughHouseFunds(_amount) { // make it payable so player can deposit ether
        houseFunds -= _amount;
        
        _to.transfer(_amount);
        emit TransferEtherFromHouse(address(this), msg.sender, _amount);
        players[msg.sender].accountBalance -= _amount;
        _burn(msg.sender, _amount);
  
    }
    
    // Function to withdraw ether when being owner
    function withdrawFromHouse(address payable _to, uint _amount) external onlyHouseOwner enoughHouseFunds(_amount) {
        houseFunds -= _amount;
        
        _to.transfer(_amount);
        emit TransferEtherFromHouse(address(this), _to, _amount);
    }
    
    // Function to return house owner
    function getHouseOwner() external view returns(address) {
        return houseOwner;
    }
    
    // Game:
    // When a player makes his bet, front end keeps the bet and plays BlackJack
    // After the game ends, send from front end the results and decide if the bet gets paid or keeps for the house
    
    // Function for locking in bet, this is made so that if user sees he is losing and closes or refreshes browser, bet is locked in
    function lockedBet(address _player, uint _bet) external {
        // this only happens after player approves in metamask
        players[_player].accountBalance -= _bet;
        _burn(msg.sender, _bet);
        
    }
    
    // Function for game opperation
    function blockJackGame(address _player, uint _bet, string memory _gameResult) external {
        if (keccak256(bytes(_gameResult)) == keccak256(bytes('won'))) {
            _mint(_player, _bet * 2);
            players[_player].accountBalance += _bet * 2;
            players[_player].accountWinLossBalance += int(_bet);
        } else if (keccak256(bytes(_gameResult)) == keccak256(bytes('push'))) {
            _mint(_player, _bet);
            players[_player].accountBalance += _bet;
        } else {
            players[_player].accountWinLossBalance -= int(_bet);
        }
    }
    
    // Function to return player balance
    function getPlayerBalance() external view returns(uint) {
        return players[msg.sender].accountBalance;
    }
    
    // Function to return account owner
    function getPlayerAccount() external view returns(address) {
        return players[msg.sender].accountOwner;
    }
    
    
    
}