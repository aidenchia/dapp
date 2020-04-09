// Truffle needs to be explicitly told which contracts we'll need
const SocialNetwork = artifacts.require("./SocialNetwork.sol");

contract("SocialNetwork", function(accounts) {
	it("should be named correctly", function() {
		return SocialNetwork.deployed().then(function(instance) {
			return instance.name();
		}).then(function(name) {
			assert.equal(name, "Dwitter Social Network")
		});
	});
})

