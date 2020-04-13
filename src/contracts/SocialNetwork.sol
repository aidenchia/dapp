pragma solidity ^0.5.0;

import {strings} from "strings.sol";

contract SocialNetwork {
	using strings for *;

	string public name;
	uint public numPosts;
	uint public bid;
	uint public bidSize;
	uint public offer;
	uint public offerSize;
	uint public nonce;
	address payable public marketMaker;
	mapping(uint => Post) public posts;
	uint public queueLength;
	mapping(uint => uint) public offerQueue;
	mapping(uint => address payable) public offerers;


	struct Post {
		uint id;
		string content;
		uint likes;
		address payable author;
		uint rewards;
	}

	constructor() public {
		name = "Agora";
		bid = 10 wei;
		offer = 20 wei;
		marketMaker = msg.sender;
		nonce = 1;
	}

	event PostCreated(uint id, string content, uint likes, address payable author);

	function createPost(string memory _content) public payable {
		// Require content to be longer than 0 bytes and shorter than 560 bytes
		require(bytes(_content).length > 0 && bytes(_content).length < 560);

		// Increment num posts
		numPosts ++;

		// Store post in mapping
		posts[numPosts] = Post(numPosts, _content, 0, msg.sender, 0);

		// Check if it's a quote
		newQuote(_content);

		// Emit post
		emit PostCreated(numPosts, _content, 0, msg.sender);
	}

	function random(uint max) internal returns (uint) {
		// Pseudo randomly generate number from 0 to max

		// Prevent modulo by zero error
		if (max == 0) {
			max ++;
		}

		uint _random = uint(keccak256(abi.encodePacked(now, msg.sender, nonce)))%max;
		nonce ++;
		return _random;
	}

	event FailedTxn(uint newQuote, uint bid, uint offer, string remarks);
	event SuccessfulTxn(uint last, uint bid, uint offer);

	function newQuote(string memory _content) public payable {
		strings.slice memory slice = _content.toSlice();
		if (slice.startsWith("BID:".toSlice())) {

			// All bids should increment bidSize
			bidSize ++;
			
			// Use imported strings library to get the x value out of "BID:x"
			slice.split(":".toSlice()); 
			string memory order = slice.toString();
			
			// Convert string to uint so we can compare it to market bid
			uint newBid = stringToUint(order);

			// Convert bid to wei denomination by default
			newBid = newBid * 1 wei;

			// All bids are capped by current market offer
			if (newBid >= offer) {
				newBid = offer;
			}
			
			// Valid bid has to be higher than current market bid
			if (newBid >= bid) {
				
				// Generate random number
				uint rnd = random(offer - newBid);

				// Closer the bid is to the offer, higher chance of transaction taking place
				if (rnd > (offer - bid) / 2) {
					emit FailedTxn(newBid, bid, offer, "Bid was not filled by market maker. Try bidding higher.");
					return;
				}

				// Transfer money to current market maker
				require(msg.value >= newBid, "msg.value must be equal to newBid or greater");
				address(marketMaker).transfer(msg.value);


				// New market maker sets his own bid and offer spread
				// Spread is generated by random function, capped to between 2-10 wei
				marketMaker = msg.sender;
				uint spread = random(8) + 2;
				bid = newBid - spread / 2;
				offer = newBid + spread / 2;
				emit SuccessfulTxn(newBid, bid, offer);
			}

			// Failed bid since < current market bid
			else {
				emit FailedTxn(newBid, bid, offer, "Bid is below current market bid");
			}
		}

		else if (slice.startsWith("OFFER:".toSlice())) {
			// All offers should increment offer size
			offerSize ++;

			// Use imported strings library to get the x value out of "OFFER:x"
			slice.split(":".toSlice()); 
			string memory order = slice.toString();
			
			// Convert string to uint so we can compare it to market bid
			uint newOffer = stringToUint(order);

			// Convert offer to wei denomination by default
			newOffer = newOffer * 1 wei;

			// All offers must be greater than current market bid
			if (newOffer >= bid) {
				newOffer = bid;
			}
			
			// Valid offer has to be lower than current market offer
			if (newOffer <= offer) {
				
				// Generate random number
				uint rnd = random(newOffer - bid);

				// Closer the new offer is to the bid, higher chance of transaction taking place
				if (rnd > (offer - bid) / 2) {
					emit FailedTxn(newOffer, bid, offer, "Offer was not filled by market maker. Try offering lower.");
					return;
				}

				// Update offerers, offer queue, queueLength
				queueLength ++;
				offerQueue[queueLength] = newOffer;
				offerers[queueLength] = msg.sender;
			}

			// Failed offer since > current market offer
			else {
				emit FailedTxn(newOffer, bid, offer, "Offer is above current market offer");
			}
		}
	}

	
	function clearOffer(uint _idx) public payable {
		// Get the outstanding offer to clear
		uint newOffer = offerQueue[_idx];

		// Check that market maker is paying the required amount
		require(msg.value >= newOffer, "msg.value must be equal to newOffer or greater");

		// Get the address of the offerer
		address payable _offerer = offerers[_idx];

		// Transfer eth from market maker to seller
		address(_offerer).transfer(msg.value);

		// Set new market maker
		marketMaker = _offerer;

		// Clear the queue
		offerQueue[_idx] = 0;
		offerers[_idx] = address(0);

		// Set new bid/offer spread
		// Spread is generated by random function, capped to between 2-10 wei
		uint spread = random(8) + 2;
		bid = newOffer - spread / 2;
		offer = newOffer + spread / 2;

		// Emit the successful txn event
		emit SuccessfulTxn(newOffer, bid, offer);
	}
	

	// pure function won't even read the storage state
	function stringToUint(string memory s) internal pure returns (uint result) {
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

	event LikePost(uint id, uint numLikes);

	function likePost(uint _id) public {
		// Require id to be greater than 0 and smaller than num posts
		require(_id > 0 && _id <= numPosts);

		// Increment the number of likes
		posts[_id].likes ++;

		emit LikePost(_id, posts[_id].likes);
	}

	function rewardPost(uint _id) public payable {
		// Require id to be greater than 0 and smaller than num posts
		require(_id > 0 && _id <= numPosts);

		// Require sufficient balance

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