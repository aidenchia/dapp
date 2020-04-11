# dapp
Dapp for Blockchain module

### Learning Points

#### Blockchain / Solidity / Ethereum
* truffle is a framework for building, deploying, testing applications on Ethereum
* Ganache is a personal blockchain which you can use to run tests, execute commands, and inspect state while controlling how the chain operates
* useful library to work with strings in solidity: https://github.com/Arachnid/solidity-stringutils 
* truffle console to interact with blockchain
* truffle migrate --reset to reset contract address. Contracts cannot be updated on the blockchain, migration just points to new address
* Metamask is a Chrome extension to connect your browser to the blockchain
* how to import and use solidity libraries: https://medium.com/@jeancvllr/solidity-tutorial-all-about-libraries-762e5a3692f9 

#### JavaScript / node.JS
* async/await pattern allows you to work with JS promises more easily
* arrow functions () => in JS cuts down a lot of typing
* package.json is a file located in project root that gives information to npm to handle project dependencies
* package-lock.json is automatically generated file that describes the exact node_modules tree that was generated, such that subsequent installs are able to generate identical trees, regardless of intermediate dependency updates.
* ESLint statically analyzes your JS code to quickly find problems

#### Miscellaneous
* if you push files to git repo and then include them in gitignore, git status will still show changes made to them as gitignore only works for untracked files 
* if you accidentally pushed files or directories you no longer want to track, you can remove the tracked files via git rm --cached _filename_ or git rm -r --cached _dir_

