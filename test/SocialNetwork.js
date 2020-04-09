// Truffle needs to be explicitly told which contracts we'll need
const SocialNetwork = artifacts.require("./SocialNetwork.sol");

contract("SocialNetwork", function(accounts) {
	var contract;

	it("should be named correctly", function() {
		return SocialNetwork.deployed().then(function(instance) {
			return instance.name();
		}).then(function(name) {
			assert.equal(name, "Dwitter Social Network")
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
			return contract.numPosts()
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
			return contract.posts(1)
		}).then(function(post) {
			assert.equal(post[2], 1, "no. of likes should increment by 1");
		});
	});

	it("should reward post correctly", function() {
		return SocialNetwork.deployed().then(function(instance) {
			contract = instance;
			return instance.rewardPost(1, {value: 2});
		}).then(function() {
			return contract.posts(1)
		}).then(function(post) {
			assert.equal(post[4], 2, "post rewards should increment by argument passed in rewardPost")
		});
	});
})

