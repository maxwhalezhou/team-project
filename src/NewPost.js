import React from "react";
import { hashHistory } from "react-router";
import firebase from "firebase";

class NewPost extends React.Component {
  constructor(props) {
    super(props);
    this.state = { post: '', title: ''};
  }

  componentDidMount() {
    /* Add a listener and callback for authentication events */
    var unregister = firebase.auth().onAuthStateChanged(user => {
      if (!user) {
        unregister();//unregistering the listener
        hashHistory.push('/login/');
      }
    });
  }

  //when the text in the form title or content form changes
  updatePost(event) {
    this.setState({ post: event.target.value });
  }
  updateTitle(event) {
    this.setState({ title: event.target.value });
  }

  //add post to published array in the database
  postPost(event) {
    event.preventDefault(); //don't submit
    var postsRef = firebase.database().ref('Users/' + firebase.auth().currentUser.uid + '/published'); //the chats in the channel
    var newPost = {
      text: this.state.post,
      userId: firebase.auth().currentUser.uid, //to look up user info
      handle: firebase.auth().currentUser.displayName,
      time: firebase.database.ServerValue.TIMESTAMP, //getting the time
      title: this.state.title
    };
    postsRef.push(newPost); //upload

    this.setState({ post: '', title: '' }); //empty out post (controlled input)
    hashHistory.push('/published');//redirecting to saved posts where they can see their new published story
  }

  //adds post to save array
  savePost(event) {
    event.preventDefault(); //don't submit

    var postsRef = firebase.database().ref('Users/' + firebase.auth().currentUser.uid + '/saved'); //the chats in the channel
    var newPost = {
      text: this.state.post,
      userId: firebase.auth().currentUser.uid, //to look up user info
      time: firebase.database.ServerValue.TIMESTAMP, //getting the time
      title: this.state.title
    };
    postsRef.push(newPost); //upload

    this.setState({ post: '', title: '' }); //empty out post (controlled input)
    hashHistory.push('/saved');//redirecting to saved posts where they can see their new saved story
  }

  //testing whether title or post content inputs are empty
  validateTitle(title) {
    return (title.length > 0);
  }
  validatePost(post) {
    return (post.length > 0);
  }

  // how to display
  render() {
    //determines if post or save buttons should be enabled
    var buttonEnabled = (this.validateTitle(this.state.title) && this.validatePost(this.state.post));
    return (
      <div className="message-box write-message" role="region">
        <h2>Post Your Work!</h2>
        <div className="alert alert-info" role="alert">
          You can make a new post of your work, which you can either save for later or publish to the website!
        </div>
        <form className="message-input form-group" role="form">
          <label htmlFor="title">Title: </label>
          <input type="text" id="title" placeholder="Type title here..." name="input" className="post-form form-control input-lg" onChange={(e) => this.updateTitle(e)} />
         
          <label htmlFor="newPost" >Content:</label>
          <textarea id="newPost" role="textbox" aria-multiline="true" placeholder="Type post here..." name="text" className="post-form form-control" onChange={(e) => this.updatePost(e)} rows="5"/>
          
          <div className="form-group new-post">
            {/* Disable if invalid post length */}
            <button className="btn btn-default" disabled={!buttonEnabled}
              onClick={(e) => this.savePost(e)} >Save</button>
            <button className="btn btn-primary" disabled={!buttonEnabled}
              onClick={(e) => this.postPost(e)} >Post</button>
          </div>
        </form>
      </div>
    );
  }
}

export default NewPost;