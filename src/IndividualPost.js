import React from "react";
import { hashHistory, Link } from "react-router";
import firebase from "firebase";
import Time from "react-time";

class IndividualPost extends React.Component {
    constructor(props) {
        super(props);
        this.state = { post: undefined };
    }

    render() {
        var currentUser = firebase.auth().currentUser; //get the curent user
        return (
            <div>
            { !this.state.post &&
                <h3>loading</h3>    
            }
            { this.state.post &&
                <div>
                <div>
                    <h2>{this.state.post.title}</h2>
                    <p>{this.state.post.handle} at {this.state.post.time}</p>
                    <p>{this.state.post.text}</p>
                </div>
                <div className="comments-box">
                    <PostForm post={this.props.params.post} writer={this.state.post.userId} />
                    <div className="comments">
                        <CommentList post={this.props.params.post} writer={this.state.post.userId} />
                    </div>
                </div>
                </div>
            }
            </div>
        );
    }
    componentDidMount(){
        this.searchPosts(this.props.params);
    }
    searchPosts(param) {
        //only executes if there is a channel param
        //getting the last 100 posts
        var postKey = param.post;
        console.log("post key", postKey);

        var postsRef = firebase.database().ref("Users");
        var thisPost = "placeholder";
        postsRef.on('value', (snapshot) => {
            //going through posts and pushing the value into array

            snapshot.forEach(function (child) {
                if(child.val().published){
                    var postKeys = Object.keys(child.val().published)
                    var post = child.val().published[postKey];
                    // post.key = postKey; //save the unique id for later
                    if (post) {
                        thisPost = post;
                    }
                }
            });
            //sorting the array by time
            //thisPost.sort((a,b) => a.comments.length - b.comments.lengh); //reverse order

            this.setState({ post: thisPost });
            console.log("**********", thisPost);
        });
    }
}

class PostForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = { comment: '', loading: false }
    }
    updateComment(event) {
        this.setState({ comment: event.target.value });
    }

    postComment(event) {
        event.preventDefault(); //don't submit
        this.setState({ loading: true }); //empty out post (controlled input)

        /* Add a new Chat to the database */
        var commentsRef = firebase.database().ref('Users/' + this.props.writer + '/published/' + this.props.post + '/comments'); //the chats in the channel
        var newComment = {
            text: this.state.comment,
            userId: firebase.auth().currentUser.uid,
            name: firebase.auth().currentUser.displayName, //to look up user info
            time: firebase.database.ServerValue.TIMESTAMP, //MAGIC
        };
        commentsRef.push(newComment).then((response) => { this.setState({ loading: false }) }); //upload

        this.setState({ comment: '' }); //empty out post (controlled input)
    }

    render() {
        return (
            <div>
                {this.state.loading &&
                    <p className="loading">Uploading...</p>
                }
                <form className="comment-form">
                    <textarea placeholder="Type comment here..." value={this.state.comment} name="text" className="post-form form-control" onChange={(e) => this.updateComment(e)}></textarea>
                    <div className="form-group send-message">
                        <button className="btn btn-primary" 
                            onClick={(e) => this.postComment(e)} >Post</button>
                    </div>
                </form>
            </div>
        );
    }
}


class CommentList extends React.Component {
    constructor(props) {
        super(props);
        this.state = { comments: [] };
    }

    componentDidMount() {
        /* Add a listener for changes to the user details object, and save in the state */
        var usersRef = firebase.database().ref('users');
        usersRef.on('value', (snapshot) => {
            this.setState({ users: snapshot.val() });
        });

        this.getComments();
    }
    componentWillReceiveProps() {
        this.getComments();
    }

    getComments() {
        console.log("comments from " + 'Users/' + this.props.writer + '/published/' + this.props.post + '/comments');
        var commentsRef = firebase.database().ref('Users/' + this.props.writer + '/published/' + this.props.post + '/comments'); //the chats in the channel
        var commentArray = []; //could also do this processing in render
        commentsRef.on('value', (snapshot) => {
            snapshot.forEach(function (child) {
                var comment = child.val();
                comment.key = child.key; //save the unique id for later
                commentArray.push(comment); //make into an array
            });
            this.state.comments = commentArray;
        });
        console.log("comments list", this.state.comments);
    }

    render() {
        //don't show if don't have user data yet (to avoid partial loads)
        if (!this.state.comments) {
            return null;
        }

        /* Create a list of <CommentItem /> objects */
        var commentItems = this.state.comments.map((comment) => {
            return <CommentItem aria-label="comment" comment={comment}
                post={this.props.post} />
        });
        
        return (<div>{commentItems}</div>);
    }
}

class CommentItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {editing: false, newComment: ""};
    }

    render() {
        return (
            <div className="comment-box">
                <p className="comment-user">by {this.props.comment.name || this.props.comment.userId}</p>
                <p className="comment-time">Posted <Time value={this.props.comment.time} relative /></p>
                <p className="comment-text">{this.props.comment.text}</p>
            </div>
        );
    }
}
export default IndividualPost;