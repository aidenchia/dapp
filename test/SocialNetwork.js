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
			assert.equal(bid, web3.utils.toWei('10', 'Wei'));
			assert.equal(offer, web3.utils.toWei('20', 'Wei'));
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
			assert.equal(post.author, accounts[0], "address of author should equal msg.newReceiverBalance");
		})

		it("created post event emitted correctly", async () => {
			const event = cpResult.logs[0].args;
			assert.equal(event.id.toNumber(), numPosts.toNumber(), 'id of latest post should equal numPosts');
			assert.equal(event.content, "first post", "content of post should be equal to _content argument");
			assert.equal(event.likes.toNumber(), 0, "no. of likes should be init as zero");
			assert.equal(event.author, accounts[0], "address of author should equal msg.newReceiverBalance");
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

		it("bid at offer should result in successful transaction", async() => {
			// Get current values
			let oldReceiverBalance = await web3.eth.getBalance(accounts[0]);
			let oldMarketMaker = await contract.marketMaker();
			let oldOffer = await contract.offer();
			
			// Define a new bid at the current offer price of 20
			let newBid = web3.utils.toWei("20", "Wei")

			// Make a bid of 20, must be a successful bid since it equals offer
			await contract.createPost("BID:20", {from: accounts[1], value: newBid})

			// Check new values
			let newReceiverBalance = await web3.eth.getBalance(accounts[0]);
			let newMarketMaker = await contract.marketMaker();
			let newOffer = await contract.offer();

			// Convert all variables to BN type for addition
			newBid = new web3.utils.BN(newBid);
			oldReceiverBalance = new web3.utils.BN(oldReceiverBalance);
			newReceiverBalance = new web3.utils.BN(newReceiverBalance);

			// Assert receiver's balance has increased by the amount of bid
			const expectedBalance = oldReceiverBalance.add(newBid);
			assert.equal(newReceiverBalance.toString(),expectedBalance.toString());

			// Assert that market maker has been reset
			assert.notEqual(oldMarketMaker, newMarketMaker, "Market maker should change after successful bid");
			assert.equal(newMarketMaker, accounts[1]);

			// Assert that offer price has changed
			assert.notEqual(oldOffer.toString(), newOffer.toString(), "Offer price must change if bid at offer");
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

		it("offer at bid should add to offer queue", async() => {
			// Get the current market bid
			bid = await contract.bid();

			// Get current queue length and convert to BN for later comparison
			let oldQueueLength = await contract.queueLength();
			oldQueueLength = new web3.utils.BN(oldQueueLength);

			// Make the offer at current market bid
			await contract.createPost("OFFER:".concat(bid.toString()), {from: accounts[4]});

			// Get new queue length and check it has incremented by 1
			let newQueueLength = await contract.queueLength();
			newQueueLength = new web3.utils.BN(newQueueLength);
			let change = newQueueLength.sub(oldQueueLength);
			assert.equal(change, 1);			

			// Get the new offer from the offer queue to verify it has been appended
			newOffer = await contract.offerQueue(newQueueLength);

			// Check that the outstanding offer in the queue is equal to the current market bid
			assert.equal(newOffer.toString(), bid.toString());
		})

		it("clearing offer should reset market maker and queue should be empty", async() => {
			// get old market maker and bid
			let oldMarketMaker = await contract.marketMaker();
			let oldBid = await contract.bid();

			// clear the outstanding offer in queue
			await contract.clearOffer(1, {from: oldMarketMaker, value: oldBid});

			// get new market maker and check
			let newMarketMaker = await contract.marketMaker();
			assert.notEqual(oldMarketMaker, newMarketMaker);

			// get new bid and check
			let newBid = await contract.bid();
			assert.notEqual(oldBid.toString(), newBid.toString(), "offer at bid must have reduced the market bid");

			// check that the queue is now empty
			check = await contract.offerQueue(1);
			assert.equal(check, 0);
		})
	})
})

