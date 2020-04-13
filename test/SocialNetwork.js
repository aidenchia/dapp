const SocialNetwork = artifacts.require("./SocialNetwork.sol");

// Get truffle-assertions library to help test require statements
const truffleAssert = require('truffle-assertions');

contract("SocialNetwork", function(accounts) {
	var contract;
	var numPosts;
	var bid;
	var ask;
	var marketMaker;
	const workPay = 50;

	// before hook will run before every test in file
	before(async () => {
		contract = await SocialNetwork.deployed();
		numPosts = await contract.numPosts();
		bid = await contract.bid();
		offer = await contract.offer();
		marketMaker = await contract.marketMaker();
	})


	describe("deployment", async () => {
		it("contract deployed at valid address", async () => {
			const address = await contract.address;
			assert.notEqual(address, 0x0);
			assert.notEqual(address, '');
			assert.notEqual(address, null);
			assert.notEqual(address, undefined);
		});

		it("state variables init correctly", async() => {
			const name = await contract.name();
			assert.equal(name, "Agora");
			assert.equal(numPosts, 0);
			assert.equal(bid, web3.utils.toWei('2', 'Wei'));
			assert.equal(offer, web3.utils.toWei('5', 'Wei'));
			assert.equal(marketMaker, accounts[0])
		});
	});

	describe("posts", async () => {
		let numPosts;
		let post;
		let cpResult;
		let lpResult;

		// before hook runs before all tests in this block
		before(async () => {
			cpResult = await contract.createPost("first post");
			numPosts = await contract.numPosts();
		})

		it("no. of posts increments by 1", async () => {
			assert.equal(numPosts, 1);
		});

		it("post init correctly", async() => {
			post = await contract.posts(numPosts);
			assert.equal(post.id.toNumber(), numPosts.toNumber(), "id of latest post should equal numPosts");
			assert.equal(post.content, "first post", "content of post should be equal to _content argument");
			assert.equal(post.likes.toNumber(), 0, "no. of likes should be init as zero");
			assert.equal(post.author, accounts[0], "address of author should equal msg.sender");
		})

		it("created post event emitted correctly", async () => {
			const event = cpResult.logs[0].args;
			assert.equal(event.id.toNumber(), numPosts.toNumber(), 'id of latest post should equal numPosts');
			assert.equal(event.content, "first post", "content of post should be equal to _content argument");
			assert.equal(event.likes.toNumber(), 0, "no. of likes should be init as zero");
			assert.equal(event.author, accounts[0], "address of author should equal msg.sender");
		});

		it("like post increments likes of post by 1", async () => {
			lpResult = await contract.likePost(numPosts);
			post = await contract.posts(numPosts);
			assert.equal(post.likes, 1);
		});

		it("like post event emitted correctly", async() => {
			const event = lpResult.logs[0].args;
			assert.equal(event.id.toNumber(), numPosts.toNumber(), "id of post liked should be equal to _id argument");
			assert.equal(event.numLikes.toNumber(), 1, "no. of likes should equal to 1");
		});

		it("reverts if post is of length zero", async () => {
			await truffleAssert.reverts(contract.createPost(""));	
		});

		it("reverts if arg passed to likePost, rewardPost and rePost not between 0 and numPosts", async () => {
			await truffleAssert.reverts(contract.likePost(0));
			await truffleAssert.reverts(contract.rewardPost(0));
			await truffleAssert.reverts(contract.rePost(0));
			await truffleAssert.reverts(contract.likePost(numPosts+1));
			await truffleAssert.reverts(contract.rewardPost(numPosts+1));
			await truffleAssert.reverts(contract.rePost(numPosts+1));
		});

		it("should repost correctly", async () => {
			await contract.rePost(1, {from: accounts[1]});
			numPosts = await contract.numPosts();
			assert.equal(numPosts, 2, "no. of posts should increase by 1");
			post = await contract.posts(numPosts);
			assert.equal(post[3], accounts[1], "repost author should be as specified in arg passed to rePost function");
		});

		it("should reward post correctly", async () => {
			let oldAuthorBalance = await web3.eth.getBalance(accounts[0]);
			oldAuthorBalance = new web3.utils.BN(oldAuthorBalance);

			await contract.rewardPost(1, {from: accounts[1], value: web3.utils.toWei("1", "Wei")});

			// Check that author received funds
			let newAuthorBalance = await web3.eth.getBalance(accounts[0]);
			newAuthorBalance = new web3.utils.BN(newAuthorBalance);
			let reward = web3.utils.toWei("1", "Wei");
			reward = new web3.utils.BN(reward);
			const expectedBalance = oldAuthorBalance.add(reward);
			assert.equal(newAuthorBalance.toString(), expectedBalance.toString());
		});
	});

	describe("quotes", async() => {

		it("bid at offer should result in transfer of Ether", async() => {
			// Get current balance
			let oldAuthorBalance = await web3.eth.getBalance(accounts[0]);
			oldAuthorBalance = new web3.utils.BN(oldAuthorBalance);
			
			// Define newBid at offer
			let newBid = web3.utils.toWei("5", "Wei")

			// Make a bid of 5 when current offer is 5
			await contract.createPost("BID:5", {from: accounts[1], value: newBid})

			// Check new balance
			let newAuthorBalance = await web3.eth.getBalance(accounts[0]);
			newAuthorBalance = new web3.utils.BN(newAuthorBalance);

			// Convert to BN type to add to oldAuthorBalance
			newBid = new web3.utils.BN(newBid)
			const expectedBalance = oldAuthorBalance.add(newBid);
			assert.equal(newAuthorBalance.toString(),expectedBalance.toString());
		})

		it("bid below current market bid should emit failed bid", async() => {
			// Define newBid below current bid
			let newBid = web3.utils.toWei("1", "Wei");

			// get logs
			let cpResult = await contract.createPost("BID:1", {from: accounts[1], value: newBid})
			const event = cpResult.logs[0].args;

			// assert event failedbid emitted correctly
			assert.equal(event.remarks, "Bid is below current market bid")
		})



	})

	/*

	it("should allocate drachma to account that calls workForDrachma", function() {
		return SocialNetwork.deployed().then(function(instance) {
			contract = instance;
			return contract.workForDrachma({from: accounts[1]});
		}).then(function() {
			return contract.balances(accounts[1]);
		}).then(function(balance) {
			assert.equal(balance, workPay);
		});
	});

	it("should have transaction if bid is equal to offer", function() {
		return SocialNetwork.deployed().then(function(instance) {
			contract = instance;
			return contract.createPost("BID:20", {from:accounts[1]});
		}).then(function() {
			return contract.balances(accounts[1]);
		}).then(function(balance) {
			assert.equal(balance, workPay - 20);
		});
	});
	*/
})

