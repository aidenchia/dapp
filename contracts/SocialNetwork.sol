pragma solidity ^0.5.0;

contract SocialNetwork {
	string public name;
	uint public numPosts;
	mapping(uint => Post) public posts;

	struct Post {
		uint id;
		string content;
	}

	constructor() public {
		name = "Dwitter Social Network";
	}

}