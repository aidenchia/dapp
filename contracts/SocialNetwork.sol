pragma solidity ^0.5.0;

/* To run a demo on truffle console:
	SocialNetwork.deployed().then(function(a) {app=a})
	app.workForMoney().then(function(i) {i=i})
	web3.eth.getAccounts()
	app.transferMoney().then(function(i) {i=i})
	app.balances().then(function(b) {balance=b})
	balance.toNumber()
	app.owner().then(function(o) {owner=o})
	owner
	web3.eth.getAccounts()
	web3.eth.getBalance()
	app.createPost("BID:4", {from: })
	app.bid().then(function(b) {bid=b})
	bid.toNumber()
	app.bidSize().then(function(b) {bidSize=b})
	bidSize.toNumber()
	app.createPost("OFFER:9")
	app.offerSize().then(function(o) {offerSize=o})
	offerSize.toNumber()
	app.posts(1).then(function(p) {posts=p})
	posts[0].toNumber()
	posts[1]
	posts[2].toNumber()
	posts[3]
	posts[4].toNumber()
	app.rewardPost(1, {value: 2})
	web3.eth.getAccounts()
	app.rePost(1)
*/

import {strings} from "strings.sol";

contract SocialNetwork {
	using strings for *;

	string public name;
	uint public numPosts;
	uint public bid;
	uint public bidSize;
	uint public offer;
	uint public offerSize;
	address payable public owner;
	mapping(uint => Post) public posts;
	mapping(address => uint) public balances;

	struct Post {
		uint id;
		string content;
		uint likes;
		address payable author;
		uint rewards;
	}

	constructor() public {
		name = "Agora";
		bid = 5;
		offer = 10;
		owner = msg.sender;
	}


	function workForMoney() public {
		// Increases balance of address
		balances[msg.sender] += 10;
	}

	function transferMoney(address _from, address _to, uint _amount) public {
		balances[_from] -= _amount;
		balances[_to] += _amount;
	}

	function createPost(string memory _content) public {
		// Require content to be longer than 0 bytes and shorter than 560 bytes
		require(bytes(_content).length > 0 && bytes(_content).length < 560);

		// Increment num posts
		numPosts ++;

		// Store post in mapping
		posts[numPosts] = Post(numPosts, _content, 0, msg.sender, 0);

		// Check if it's a quote
		newQuote(_content);
	}

	function newQuote(string memory _content) public {
		strings.slice memory slice = _content.toSlice();
		if (slice.startsWith("BID:".toSlice())) {
			// All bids should increment bidSize
			bidSize ++;
			
			// Use imported strings library to help with string util functions
			strings.slice memory _ = slice.split(":".toSlice());
			string memory order = slice.toString();

			// Convert string to uint so we can compare it to market bid
			uint newBid = stringToUint(order);
			if (newBid >= bid) {
				// Market bid should always reflect currently best(highest) bid
				bid = newBid;

				// Transfer money to current owner
				transferMoney(msg.sender, owner, bid);
			}
		}

		else if (slice.startsWith("OFFER:".toSlice())) {
			// All offers should increment offerSize
			offerSize ++;

			// Use imported strings library to help with string util functons
			strings.slice memory _ = slice.split(":".toSlice());
			string memory order = slice.toString();

			// Convert string to uint
			offer = stringToUint(order);

			// Market offer should always reflect currently best(lowest) offer
			uint newOffer = stringToUint(order);
			if (newOffer <= offer) {
				offer = newOffer;
			}
		}

		else {
			return;
		}
	}

	function stringToUint(string memory s) internal returns (uint result) {
		bytes memory b = bytes(s);
		uint i;
		result = 0;
		for (i = 0; i < b.length; i++) {
			uint c = uint(uint8(b[i]));
			if (c >= 48 && c <= 57) {
				result = result * 10 + (c - 48);
			}
		}

		return result;
	}

	function likePost(uint _id) public {
		// Require id to be greater than 0 and smaller than num posts
		require(_id > 0 && _id <= numPosts);

		// Increment the number of likes
		posts[_id].likes ++;
	}

	function rewardPost(uint _id) public payable {
		// Require id to be greater than 0 and smaller than num posts
		require(_id > 0 && _id <= numPosts);

		// Require sufficient balance
		require(address(msg.sender).balance > msg.value);

		// Get post
		Post memory _post = posts[_id];

		// Get author of post
		address payable _author = _post.author;

		// Pay author of post
		address(_author).transfer(msg.value);

		// Increment post reward
		_post.rewards += msg.value;

		// Update the post
		posts[_id] = _post;
	}

	function rePost(uint _id) public {
		// Require id to be greater than 0 and smaller than num posts
		require(_id > 0 && _id <= numPosts);

		// Get content of post
		string memory _content = posts[_id].content;

		// Repost same content but with current user
		createPost(_content);
	}
}