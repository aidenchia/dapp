# Agora
This is my decentralized application (dapp) written for my 50.037 Blockchain Technology module. It is a very simple decentralized social network / marketplace app built using Solidity 0.5.0 for the smart contract and ReactJS for the frontend.   
<p align="center">
<img src="https://github.com/aidenchia/dapp/blob/master/public/agora.jpg" width="700" height="462.5">
</p>
The name Agora literally means “gathering place” and refers to the public spaces in ancient Greek city-states where people used to gather freely to chat and trade items with one another in a completely decentralized manner. This dapp is the modern version of this ancient practice, where users can post content, like and reward other posts, as well as trade items by making bids and offers to buy and sell. 

## Design Documentation

#### Dataflow Diagram (Gene and Sarson Notation)
Level 1 Diagram
![Data Flow Diagram](https://github.com/aidenchia/dapp/blob/master/public/DFD_level1.png)

Use Case Diagram
![Use Case Diagram](https://github.com/aidenchia/dapp/blob/master/public/UCD.png)

## Source Code & Test Data
Source code found in [this repo](https://github.com/aidenchia/dapp.git).  

Test data can be run by cloning the repo, cd to root, and run `truffle test` in Terminal, you should be able to see the following:  

![Terminal Screenshot](https://github.com/aidenchia/dapp/blob/master/public/truffletest.png)

## Screenshots 
![Frontend 1](https://github.com/aidenchia/dapp/blob/master/public/UI1.png)
![Frontend 2](https://github.com/aidenchia/dapp/blob/master/public/UI2.png)

## Analysis

#### Gas Usage
* `likePost` function, gas fee: 0.00132 ETH
* `rewardPost` function, gas fee: 0.002331 ETH
* `clearOffer` function, gas fee: 0.002379 ETH
* `createPost` function, gas fee: 0.003558 ETH 
* `newQuote` function, gas fee: 0.005375 ETH 
* Deploy the contract, gas used: 0.0443963 ETH  

`likePost` function is the shortest function with only 3 lines long hence it has the lowest gas fee.`newQuote` function uses up most amount of gas as it is one of the longest functions, plus it calls `keccak256(abi.encodePacked(now, msg.sender, nonce))` twice and this has high gas costs.

#### Security
* No sensitive personal information recorded on the smart contract
* Use of address.transfer() which forwards 2,300 gas stipend and is safe against reentrancy
* `createPost` function checks that user input by string is non-empty and limited to less than 560 bytes: `require(bytes(_content).length > 0 && bytes(_content).length < 560);`

## Learning Points

#### Blockchain / Solidity / Ethereum
* truffle is a framework for building, deploying, testing applications on Ethereum
* Ganache is a personal blockchain which you can use to run tests, execute commands, and inspect state
* Metamask is a Chrome extension to connect your browser to the blockchain
* Mocha framework and Chai assertions library comes bundled with truffle to help you run tests
* useful library to work with strings in solidity: https://github.com/Arachnid/solidity-stringutils 
* how to import and use solidity libraries: https://medium.com/@jeancvllr/solidity-tutorial-all-about-libraries-762e5a3692f9
* `truffle console` to interact with blockchain
* `truffle migrate --reset` to reset contract address. Contracts cannot be updated on the blockchain, migration just points to new address
* `web3.eth.getAccounts()` to get all account addresses
* `web3.utils.toWei("1", "Ether")` to specify 1 ether without writing out 18 zeros
* for all `public` variables, Solidity will auto create getter functions 
* `pure` modifier means function won't even read state
* `truffle test` to run test file located under /test directory
* tests can be written in JS or Solidity
* In Mocha framework, `before {...}` hook runs before every test, use this to setup variables that need to be re-used for multiple tests
* `msg.sender` and `msg.value` can be used in all solidity functions
* use `{from: _address_}` and `{value: _value_}` in order to pass as args to `msg.sender` and `msg.value` respectively
* use `require(...)` statements to revert if condition does not hold true
* use truffle-assertions library to test require statements easily

#### JavaScript / node.JS
* `let` and `const` are block-scoped while `var` is function-scoped
* async/await pattern allows you to work with JS promises more easily
* arrow functions () => in JS cuts down a lot of typing
* npm automatically looks for package.json in root to download dependencies specified
* package-lock.json is automatically generated file that describes the exact node_modules tree that was generated, such that subsequent installs are able to generate identical trees, regardless of intermediate dependency updates.
* ESLint statically analyzes your JS code to quickly find problems
* Babel is a JS compiler that is used to convert ECMAScript 2015+ code for backwards compatibility

#### Miscellaneous
* if you push files to git repo and then include them in gitignore, git status will still show changes made to them as gitignore only works for untracked files 
* if you accidentally pushed files or directories you no longer want to track, you can remove the tracked files via `git rm --cached filename` or `git rm -r --cached dir`
* .DS_Store is a file auto created by Finder in macOS that stores custom attributes of folder, such as the position of icons
* lite-server is a lightweight development-only node server
* bs-config.json is a config file for lite-server that allows you to overwrite default server config 
