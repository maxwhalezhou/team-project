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
      if (user) {
      } else {
        unregister();
        hashHistory.push('/login/');
      }
    });
  }

  //when the text in the form changes
  updatePost(event) {
    this.setState({ post: event.target.value });
  }
  updateTitle(event) {
    this.setState({ title: event.target.value });
  }

  //post a new chat to the database
  postPost(event) {
    event.preventDefault(); //don't submit
    /* Add a new Chat to the database */
    var postsRef = firebase.database().ref('Users/' + firebase.auth().currentUser.uid + '/published'); //the chats in the channel
    var newPost = {
      text: this.state.post,
      userId: firebase.auth().currentUser.uid, //to look up user info
      handle: firebase.auth().currentUser.displayName,
      time: firebase.database.ServerValue.TIMESTAMP, //MAGIC
      title: this.state.title
    };
    postsRef.push(newPost); //upload

    this.setState({ post: '', title: '' }); //empty out post (controlled input)
    hashHistory.push('/published');
  }
  savePost(event) {
    event.preventDefault(); //don't submit
    /* Add a new Chat to the database */
    var postsRef = firebase.database().ref('Users/' + firebase.auth().currentUser.uid + '/saved'); //the chats in the channel
    var newPost = {
      text: this.state.post,
      userId: firebase.auth().currentUser.uid, //to look up user info
      time: firebase.database.ServerValue.TIMESTAMP, //MAGIC
      title: this.state.title
    };
    postsRef.push(newPost); //upload

    this.setState({ post: '', title: '' }); //empty out post (controlled input)
    hashHistory.push('/saved');
  }

  // how to display
  render() {
    return (
      <div className="message-box write-message" role="region">
        <h2>Make a New Story!</h2>

        <form className="message-input form-group" role="form">
          <label>Title:</label>
          <input  id='title' placeholder="Type title here..." name="input" className="post-form form-control input-lg" onChange={(e) => this.updateTitle(e)} />
          <label>Content:</label>
          <textarea placeholder="Type post here..." name="text" className="post-form form-control" onChange={(e) => this.updatePost(e)} rows="5"/>

          <div className="form-group send-message">
            {/* Disable if invalid post length */}
            <button className="btn btn-default" disabled={this.state.post.length === 0 }
              onClick={(e) => this.savePost(e)} >Save</button>
            <button className="btn btn-primary" disabled={this.state.post.length === 0 }
              onClick={(e) => this.postPost(e)} >Post</button>
          </div>
        </form>
      </div>
    );
  }
}
export default NewPost;