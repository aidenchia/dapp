pragma solidity ^0.5.0;

contract SocialNetwork {
	string public name;
	uint public numPosts;
	mapping(uint => Post) public posts;

	struct Post {
		uint id;
		string content;
		uint likes;
		address payable author;
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
		posts[numPosts] = Post(numPosts, _content, 0, msg.sender);
	}

	function likePost(uint _id) public {
		// Require id to be greater than 0 and smaller than num posts
		require(_id > 0 && _id <= numPosts);

		// Increment the number of likes
		posts[_id].likes ++;
	}

}