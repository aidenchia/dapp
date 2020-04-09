pragma solidity ^0.5.0;

/* To run a demo on truffle console:
	SocialNetwork.deployed().then(function(a) {app=a})
	app.createPost("BID:4")
	app.bidSize().then(function(b) {bidSize=b})
	bidSize.toNumber()
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
	string public bid;
	uint public bidSize;
	string public offer;
	uint public offerSize;
	mapping(uint => Post) public posts;

	struct Post {
		uint id;
		string content;
		uint likes;
		address payable author;
		uint rewards;
	}

	constructor() public {
		name = "Dwitter Social Network";
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
			bidSize ++;
			strings.slice memory _ = slice.split(":".toSlice());
			string memory order = slice.toString();
		}

		else if (slice.startsWith("OFFER:".toSlice())) {
			offerSize ++;
			strings.slice memory _ = slice.split(":".toSlice());
			string memory order = slice.toString();
		}

		else {
			return;
		}
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