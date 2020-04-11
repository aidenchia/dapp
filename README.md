# dapp
Dapp for Blockchain module

### Learning Points

#### Blockchain / Solidity / Ethereum
* truffle is a framework for building, deploying, testing applications on Ethereum
* Ganache is a personal blockchain which you can use to run tests, execute commands, and inspect state
* useful library to work with strings in solidity: https://github.com/Arachnid/solidity-stringutils 
* `truffle console` to interact with blockchain
* `truffle migrate --reset` to reset contract address. Contracts cannot be updated on the blockchain, migration just points to new address
* `web3.eth.getAccounts()` to get all account addresses
* `web3.utils.toWei("1", "Ether")` to specify 1 ether without writing out 18 zeros
* Solidity will auto create getter functions for all `public` variables 
* `pure` modifier means function won't even read state
* `truffle test` to run test file located under /test directory
* tests can be written in JS or Solidity
* Mocha framework and Chai assertions library comes bundled with truffle to help you run tests
* In Mocha framework, `before {...}` hook runs before every test, use this to setup variables that need to be re-used for multiple tests
* `msg.sender` and `msg.value` can be used in all solidity functions
* use `{from: _address_}` and `{value: _value_}` in order to pass as args to `msg.sender` and `msg.value` respectively
* use `require(...)` statements to revert if condition does not hold true
* use truffle-assertions library to test require statements easily
* Metamask is a Chrome extension to connect your browser to the blockchain
* how to import and use solidity libraries: https://medium.com/@jeancvllr/solidity-tutorial-all-about-libraries-762e5a3692f9


#### JavaScript / node.JS
* let and const are block-scoped while var is function-scoped
* async/await pattern allows you to work with JS promises more easily
* arrow functions () => in JS cuts down a lot of typing
* npm automatically looks for package.json in root to download dependencies specified
* package-lock.json is automatically generated file that describes the exact node_modules tree that was generated, such that subsequent installs are able to generate identical trees, regardless of intermediate dependency updates.
* ESLint statically analyzes your JS code to quickly find problems

#### Miscellaneous
* if you push files to git repo and then include them in gitignore, git status will still show changes made to them as gitignore only works for untracked files 
* if you accidentally pushed files or directories you no longer want to track, you can remove the tracked files via `git rm --cached filename` or `git rm -r --cached dir`

