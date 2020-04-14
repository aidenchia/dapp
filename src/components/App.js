import React, { Component } from 'react';
import Web3 from 'web3';
import Identicon from 'identicon.js';
import './App.css';
import SocialNetwork from '../abis/SocialNetwork.json';
import Navbar from './Navbar';
import Main from './Main';


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

    // set default account to state
    this.setState({account: accounts[0]})

    // Network ID 
    const networkId = await web3.eth.net.getId()
    const networkData  = SocialNetwork.networks[networkId]

    // Address
    if (networkData) {
      const socialNetwork = web3.eth.Contract(SocialNetwork.abi, networkData.address)
      this.setState({socialNetwork})

      // get relevant state variables
      const bid = await socialNetwork.methods.bid().call()
      this.setState({bid})
      const offer = await socialNetwork.methods.offer().call()
      this.setState({offer})
      const marketMaker = await socialNetwork.methods.marketMaker().call()
      this.setState({marketMaker})
      const queueLength = await socialNetwork.methods.queueLength().call()
      this.setState({queueLength})
      
      // load and display the offer queue
      for (var i = 1; i <= queueLength; i++) {
        const waitingOffer = await socialNetwork.methods.offerQueue(i).call()
        var offerVal = waitingOffer[0].toString()
        if(offerVal == "0") {continue;}
        this.setState({
          offerQueue: [...this.state.offerQueue, waitingOffer]
        })
      }


      // need to know number of posts to list them
      const numPosts = await socialNetwork.methods.numPosts().call() // call methods read blockchain
      this.setState({numPosts})

      // Load posts
      for (var i = 1; i <= numPosts; i++) {
        const post = await socialNetwork.methods.posts(i).call()
        this.setState({
          posts: [...this.state.posts, post] // ES6 allows us to add an element to array with spread operator
        })
      }

      // Sort posts
      this.setState({
        posts: this.state.posts.sort((a,b) => b.rewards - a.rewards)
      })

      this.setState({loading: false})

    } else {
      window.alert('Social Network contract has not been deployed to detected network')
    }
  }

  createPost(content) {
    // making a bid
    this.setState({loading: true})
    if (content.startsWith("BID")) {
      const order = content.split(":")[1]
      this.state.socialNetwork.methods.createPost(content).send({from: this.state.account, value: order})
      .once('receipt', (receipt) => {
        this.setState({loading:false})
      })
    }

    // just chatting
    else {
      this.state.socialNetwork.methods.createPost(content).send({from: this.state.account})
      .once('receipt', (receipt) => {
      this.setState({loading:false})
      })
    }
  }

  rewardPost(id, amount) {
    this.setState({loading: true})
    this.state.socialNetwork.methods.rewardPost(id).send({from: this.state.account, value: amount})
    .once('receipt', (receipt) => {
      this.setState({loading:false})
    })
  }

  likePost(id) {
    this.setState({loading:true})
    this.state.socialNetwork.methods.likePost(id).send({from: this.state.account})
    .once('receipt', (receipt) => {
      this.setState({loading:false})
    })
  }

  clearOffer() {
    this.state.socialNetwork.methods.offerQueue(this.state.queueLength).call()
    .then((waitingOffer)=> {
      this.state.socialNetwork.methods.clearOffer(this.state.queueLength).send({from: this.state.account, value: waitingOffer[0]})
    })
  }

  constructor(props) {
    super(props) 
    this.state = {
      account: '',
      socialNetwork: null,
      numPosts: 0,
      bid: 10,
      offer: 20,
      marketMaker: null,
      queueLength: 0,
      offerQueue: [],
      posts: [],
      loading: true
    }

    // bind to constructor
    this.createPost = this.createPost.bind(this)
    this.rewardPost = this.rewardPost.bind(this)
    this.likePost = this.likePost.bind(this)
    this.clearOffer = this.clearOffer.bind(this)
  }


  render() {
    return (
      <div>
      <Navbar account={this.state.account}/>
      { this.state.loading 
        ? <div id='loader' className="text-center mt-5" ><p>Loading...</p></div>
        :<Main 
            posts={this.state.posts}
            createPost={this.createPost}
            rewardPost={this.rewardPost}
            likePost={this.likePost}
            bid={this.state.bid}
            offer={this.state.offer}
            marketMaker={this.state.marketMaker}
            offerQueue={this.state.offerQueue}
            queueLength={this.state.queueLength}
            clearOffer={this.clearOffer}
          />
      }
      </div>
    );
  }
}

export default App;
