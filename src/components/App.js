import React, { Component } from 'react';
import Web3 from 'web3';
import logo from '../logo.png';
import './App.css';
import SocialNetwork from '../abis/SocialNetwork.json';
import Navbar from './Navbar';

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    // look for ethereum provider in window
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    // create web3 provider 
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    // if Metamask is not installed
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    // get window connection
    const web3 = window.web3

    // load accounts with web3
    const accounts = await web3.eth.getAccounts()

    // set to state
    this.setState({account: accounts[0]})

    // Network ID 
    const networkId = await web3.eth.net.getId()
    const networkData  = SocialNetwork.networks[networkId]

    // Address
    if (networkData) {
      const socialNetwork = web3.eth.Contract(SocialNetwork.abi, networkData.address)
      this.setState({socialNetwork: socialNetwork})
      
      // need to know number of posts to list them
      const numPosts = await socialNetwork.methods.numPosts().call() // call methods read blockchain
      this.setState({numPosts})

      // set state of all posts
      for (var i = 1; i <= numPosts; i++) {
        const post = await socialNetwork.methods.posts(i).call()
        this.setState({
          posts: [...this.state.posts, post] // ES6 allows us to add an element to array with spread operator
        })
      }


    } else {
      window.alert('Social Network contract has not been deployed to detected network')
    }

    // ABI
  }

  constructor(props) {
    super(props) 
    this.state = {
      account: '',
      socialNetwork: null,
      numPosts: 0,
      posts: []
    }
  }


  render() {
    return (
      <div>
      <Navbar account={this.state.account}/>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <a
                  href="http://www.dappuniversity.com/bootcamp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src={logo} className="App-logo" alt="logo" />
                </a>
                <h1>Dapp University Starter Kit</h1>
                <p>
                  Edit <code>src/components/App.js</code> and save to reload.
                </p>
                <a
                  className="App-link"
                  href="http://www.dappuniversity.com/bootcamp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LEARN BLOCKCHAIN <u><b>NOW! </b></u>
                </a>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
