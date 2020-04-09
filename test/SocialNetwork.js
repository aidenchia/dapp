// Truffle needs to be explicitly told which contracts we'll need
const SocialNetwork = artifacts.require("./SocialNetwork.sol");

// Get truffle-assertions library to help test require statements
const truffleAssert = require('truffle-assertions');


contract("SocialNetwork", function(accounts) {
	var contract;

	it("should be named correctly", function() {
		return SocialNetwork.deployed().then(function(instance) {
			return instance.name();
		}).then(function(name) {
			assert.equal(name, "Agora")
		});
	});

	it("should init with correct values", function() {
		return SocialNetwork.deployed().then(function(instance) {
			return instance.numPosts();
		}).then(function(numPosts) {
			assert.equal(numPosts, 0, "No. of posts should init as 0")
		});
	});

	it("should create post correctly", function() {
		return SocialNetwork.deployed().then(function(instance) {
			contract = instance;
			return instance.createPost("tweet");
		}).then(function() {
			return contract.numPosts();
		}).then(function(numPosts) {
			assert.equal(numPosts,1, "Create posts should increment no. of posts by 1");
		}).then(function() {
			return contract.posts(1)
		}).then(function(post) {
			assert.equal(post[0], 1, "id of first post should equal to 1");
			assert.equal(post[1], "tweet", "content of post should be equal to argument passed to create post function");
			assert.equal(post[2], 0, "no. of likes should init as zero");
		});
	});

	it("should like post correctly", function() {
		return SocialNetwork.deployed().then(function(instance) {
			contract = instance;
			return instance.likePost(1);
		}).then(function() {
			return contract.posts(1);
		}).then(function(post) {
			assert.equal(post[2], 1, "no. of likes should increment by 1");
		});
	});

	it("should revert if post is of length zero", function() {
		return SocialNetwork.deployed().then(async function(instance) {
			await truffleAssert.reverts(instance.createPost(""));
		});
	});

	it("should revert if argument passed to likePost, rewardPost, and rePost not between 0 and numPosts", function() {
		return SocialNetwork.deployed().then(function(instance) {
			contract = instance;
			return contract.numPosts();
		}).then(async function(numPosts) {
			await truffleAssert.reverts(contract.likePost(0));
			await truffleAssert.reverts(contract.rewardPost(0));
			await truffleAssert.reverts(contract.rePost(0));

			await truffleAssert.reverts(contract.likePost(numPosts+1));
			await truffleAssert.reverts(contract.rewardPost(numPosts+1));
			await truffleAssert.reverts(contract.rePost(numPosts+1));
		});
	});

	it("should reward post correctly", function() {
		return SocialNetwork.deployed().then(function(instance) {
			contract = instance;
			return instance.rewardPost(1, {value: 2});
		}).then(function() {
			return contract.posts(1);
		}).then(function(post) {
			assert.equal(post[4], 2, "post rewards should increment by argument passed in rewardPost")
		});
	});

	it("should repost correctly", function() {
		return SocialNetwork.deployed().then(function(instance) {
			contract = instance;
		}).then(async function() {
			await contract.rePost(1, {from: accounts[1]});
			return contract.numPosts();
		}).then(function(numPosts) {
			assert.equal(numPosts, 2, "no. of posts should increase by 1");
			return contract.posts(2);
		}).then(function(post) {
			assert.equal(post[3], accounts[1], "repost author should be as specified in arg passed to rePost function");
		});
	});
})

