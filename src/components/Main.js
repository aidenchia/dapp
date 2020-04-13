import React, {Component} from 'react';
import Identicon from 'identicon.js';

class Main extends Component {

	render() {

		return (
      <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{maxWidth: '500px'}}>
              <div className="content mr-auto ml-auto">
                <p>&nbsp;</p>
                <h3 className="text-center font-weight-bold"> Welcome to the Agora!</h3>
                <img src="agora.jpg" className="img-fluid" alt="Responsive image"/>
                <p>&nbsp;</p>
                <small className= "text-muted mb-2 d-flex text-justify"> 
                  The name Agora literally means “gathering place” and 
                  refers to the public spaces in ancient Greek city-states 
                  where people used to gather freely to chat and trade items with one another 
                  in a completely decentralized manner.
                  Chat with others or make bids and offers to trade items with others.
                  The current market bid and offer is shown below:
                </small>
                <p>&nbsp;</p>
                <div className="container">
                  <div className="row">
                    <div className="col-sm text-success">
                      <h4 className="text-left">BID: {this.props.bid.toString()} Wei</h4>
                      <small className="text-muted">
                        To make an offer of {this.props.bid.toString()} Wei, post OFFER:{this.props.bid.toString()}
                      </small>
                    </div>
                    <div className="col-sm text-danger">
                      <h4>OFFER: {this.props.offer.toString()} Wei</h4>
                      <small className="text-muted">
                        To make a bid of {this.props.offer.toString()} Wei, post BID:{this.props.offer.toString()}
                      </small>
                    </div>
                  </div>
                </div>
                <p>&nbsp;</p>
                <p>Market Maker:</p>
                <small className="text-muted">
                  {this.props.marketMaker.toString()}
                </small>
                <p>&nbsp;</p>
                <form onSubmit={(event) => {
                  event.preventDefault()
                  const content = this.postContent.value
                  this.props.createPost(content)
                }}>
                  <div className="form-group mr-sm 2">
                    <input 
                      id="postContent"
                      type="text"
                      ref={(input) => {this.postContent = input}}
                      className="form-control"
                      placeholder="What's on your mind?"
                      required />
                   </div>
                   <button type="submit" className="btn btn-primary btn-block">Post</button>
                  </form>
                  <p>&nbsp;</p>
                { this.props.posts.map((post,key) => {
                  return (
                    <div className="card mb-4" key={key} >
                      <div className="card-header">
                      <img
                          className='mr-2'
                          width='30'
                          height='30'
                          src={`data:image/png;base64,${new Identicon(post.author, 30).toString()}`}
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
                          <small className="float-left ml-4 mt-1 text-muted">
                            LIKES: {post.likes.toString()}
                          </small>
                           <button 
                            className="btn btn-link btn-sm float-right pt-0"
                            name={post.id}
                            onClick= {(e) => {
                              // Call the like function
                              this.props.likePost(e.currentTarget.name)
                            }}
                          >
                          <img src="heart.png" alt="LIKE" height="20" width="20"/>
                          </button>                         
                          <button 
                            className="btn btn-link btn-sm mr-4 float-right pt-0"
                            name={post.id}
                            onClick= {(event) => {
                              // Define reward amount
                              let amount = window.web3.utils.toWei('0.1', 'Ether')
                              // Call the tip function
                              this.props.rewardPost(event.currentTarget.name, amount)
                            }}
                          >
                          TIP 0.1 ETH
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
		)
	}
}


export default Main;