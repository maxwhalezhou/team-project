import React from "react";
import { hashHistory, Link } from "react-router";
import firebase from "firebase";

class IndividualPost extends React.Component {
    render() {
        var currentUser = firebase.auth().currentUser; //get the curent user
        return (
            <div>
                <div>
                    <h2>{this.props.post.title}</h2>
                    <p>{this.props.user.handle}at {this.props.post.time}</p>
                    <p>{this.props.post.text}</p>
                </div>
                <div className="comment-box">
                    <PostForm post={this.props.post} writer={this.props.user} />
                    <div className="comments">
                        <CommentList post={this.props.post} writer={this.props.user} />
                    </div>
                </div>
            </div>
        );
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
        var commentsRef = firebase.database().ref('Users/' + this.props.writer.uid + '/published/' + this.props.post.key + '/comments'); //the chats in the channel
        var newComment = {
            text: this.state.comment,
            userId: firebase.auth().currentUser.uid, //to look up user info
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
                    <textarea placeholder="Type comment here..." name="text" className="post-form form-control" onChange={(e) => this.updateComment(e)}></textarea>
                    <div className="form-group send-message">
                        <button className="btn btn-primary" disabled={this.state.post.length === 0 || this.state.loading}
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
        this.state = { comments: [], users: undefined };
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
        var commentsRef = firebase.database().ref('Users/' + this.props.writer.uid + '/published/' + this.props.post.key + '/comments'); //the chats in the channel
        commentsRef.on('value', (snapshot) => {
            var commentArray = []; //could also do this processing in render
            snapshot.forEach(function (child) {
                var comment = child.val();
                comment.key = child.key; //save the unique id for later
                commentArray.push(comment); //make into an array
            });
            this.setState({ comments: commentArray });
        });
    }

    render() {
        //don't show if don't have user data yet (to avoid partial loads)
        if (!this.state.users) {
            return null;
        }

        /* Create a list of <CommentItem /> objects */
        var commentItems = this.state.chats.map((comment) => {
            return <CommentItem aria-label="comment" comment={comment}
                post={this.props.post}
                commentUser={this.state.users[comment.userId]}
                postUwer={this.props.user}
                key={comment.key} />
        });
    }

}

class CommentItem extends React.Component {
    render() {
        return (
            <div>
                <p>{this.props.comment.handle}</p>
                <p>{this.props.comment.time}</p>
                <p>{this.props.comment.text}</p>
            </div>
        );
    }
}
export default IndividualPost;