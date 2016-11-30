import React from "react";
import { hashHistory, Link } from "react-router";
import firebase from "firebase";

class NewPost extends React.Component {
  constructor(props) {
    super(props);
    this.state = { post: '', title: '', loading: false };
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
    this.setState({ loading: true }); //empty out post (controlled input)

    /* Add a new Chat to the database */
    var postsRef = firebase.database().ref('Users/' + firebase.auth().currentUser.uid + '/published'); //the chats in the channel
    var newPost = {
      text: this.state.post,
      userId: firebase.auth().currentUser.uid, //to look up user info
      time: firebase.database.ServerValue.TIMESTAMP, //MAGIC
      title: this.state.title
    };
    postsRef.push(newPost).then((response) => { this.setState({ loading: false }) }); //upload

    this.setState({ post: '', title: '' }); //empty out post (controlled input)
  }
  savePost(event) {
    event.preventDefault(); //don't submit
    this.setState({ loading: true }); //empty out post (controlled input)

    /* Add a new Chat to the database */
    var postsRef = firebase.database().ref('Users/' + firebase.auth().currentUser.uid + '/saved'); //the chats in the channel
    var newPost = {
      text: this.state.post,
      userId: firebase.auth().currentUser.uid, //to look up user info
      time: firebase.database.ServerValue.TIMESTAMP, //MAGIC
      title: this.state.title
    };
    postsRef.push(newPost).then((response) => { this.setState({ loading: false }) }); //upload

    this.setState({ post: '', title: '' }); //empty out post (controlled input)
  }

  // how to display
  render() {
    var currentUser = firebase.auth().currentUser; //get the curent user
    return (
      <div className="message-box write-message" role="region">
        {this.state.loading &&
          <p className="loading">Uploading...</p>
        }
        <form className="message-input" role="form">
          <textarea placeholder="Type title here..." name="text" className="post-form form-control" onChange={(e) => this.updateTitle(e)}></textarea>
          <textarea placeholder="Type post here..." name="text" className="post-form form-control" onChange={(e) => this.updatePost(e)}></textarea>
          <div className="form-group send-message">
            {/* Disable if invalid post length */}
            <button className="btn btn-primary" disabled={this.state.post.length === 0 || this.state.loading}
              onClick={(e) => this.postPost(e)} >Post</button>
            <button className="btn btn-primary" disabled={this.state.post.length === 0 || this.state.loading}
              onClick={(e) => this.savePost(e)} >
              <i className="fa fa-pencil-square-o" aria-hidden="true"></i> Save
            </button>
          </div>
        </form>
      </div>
    );
  }
}
export default NewPost;