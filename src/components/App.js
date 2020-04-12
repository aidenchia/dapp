import React, { Component } from 'react';
import Web3 from 'web3';
import './App.css';
import SocialNetwork from '../abis/SocialNetwork.json';
import Navbar from './Navbar';
import Identicon from 'identicon.js';

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
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{maxWidth: '500px'}}>
              <div className="content mr-auto ml-auto">
                { this.state.posts.map((post,key) => {
                  return (
                    <div className="card mb-4" key={key} >
                      <div className="card-header">
                      <img
                          className='mr-2'
                          width='30'
                          height='30'
                          src={`data:image/png;base64,${new Identicon(this.state.account, 30).toString()}`}
                        />
                        <small className="text-muted">{post.author}</small>
                      </div>
                      <ul id="postList" className="list-group list-group-flush">
                        <li className="list-group-item">
                          <p>{post.content}</p>
                        </li>
                        <li key={key} className="list-group-item py-2">
                          <small className="float-left mt-1 text-muted">
                            TIPS: {window.web3.utils.fromWei(post.rewards.toString(), 'Ether')} ETH
                          </small>
                          <button className="btn btn-link btn-sm float-right pt-0">
                            <span>
                              TIP 0.1 ETH
                            </span>
                          </button>
                        </li>
                      </ul>
                    </div> 
                  )
                })}
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
