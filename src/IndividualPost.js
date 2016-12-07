import React from "react";
import { Modal, Button, Alert } from "react-bootstrap";
import { hashHistory } from "react-router";
import firebase from "firebase";
import Time from "react-time";

class IndividualPost extends React.Component {
    constructor(props) {
        super(props);
        this.state = { post: undefined };
    }
    componentDidMount() {
        var unregister = firebase.auth().onAuthStateChanged(user => {
            if (!user) {
                unregister();
                hashHistory.push('/login/');
            }
        });
        this.searchPosts(this.props.params);
    }
    searchPosts(param) {
        //only executes if there is a channel param
        //getting the last 100 posts
        var postKey = param.post;
        var postsRef = firebase.database().ref("Users");
        this.PostsRef = postsRef;
        var thisPost = "placeholder";
        postsRef.on('value', (snapshot) => {
            //going through posts and pushing the value into array

            snapshot.forEach(function (child) {
                if (child.val().published) {
                    var post = child.val().published[postKey];
                    // post.key = postKey; //save the unique id for later
                    if (post) {
                        thisPost = post;
                    }
                }
            });
            this.setState({ post: thisPost });
        });
    }
    componentWillUnmount = () => {
        this.PostsRef.off();
    }
    render() {
        return (
            <div>
                {!this.state.post &&
                    <h3>loading</h3>
                }
                {this.state.post &&
                    <div>
                        <div>
                            <h2>{this.state.post.title}</h2>
                            <p>{this.state.post.handle} at <Time value={this.state.post.time} relative /></p>
                            <p className="white-space">{this.state.post.text}</p>
                        </div>
                        <div className="comments-box">
                            <label>Leave A Comment</label>
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
            userId: firebase.auth().currentUser.uid, //to look up user info
            handle: firebase.auth().currentUser.displayName, //to look up user info
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
                <form className="form-group">
                    <textarea type="text" placeholder="Type comment here..." value={this.state.comment} className="form-control" onChange={(e) => this.updateComment(e)} />
                    <Button className="btn btn-primary btn-block" onClick={(e) => this.postComment(e)} >Post</Button>
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
        var commentsRef = firebase.database().ref('Users/' + this.props.writer + '/published/' + this.props.post + '/comments'); //the chats in the channel
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
        if (!this.state.comments) {
            return null;
        }

        /* Create a list of <CommentItem /> objects */
        var commentItems = this.state.comments.map((comment) => {
            return <CommentItem aria-label="comment" comment={comment}
                post={this.props.post} postWriter={this.props.writer} key={comment.key} />
        });

        var commentDisplay = "";
        if (commentItems.length === 1) {
            commentDisplay = "Comment";
        } else {
            commentDisplay = "Comments";
        }

        return (
            <div>
                <p>{commentItems.length} {commentDisplay}</p>
                {commentItems}
            </div>);
    }
}

class CommentItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = { editShow: false, deleteShow: false, text: this.props.comment.text, edited: false };
    }

    updateText(event) {
        this.setState({ text: event.target.value });
    }

    editPost() {
        var commentRef = firebase.database().ref("Users/" + this.props.postWriter + "/published/" + this.props.post + "/comments/" + this.props.comment.key);
        commentRef.child("text").set(this.state.text);
        commentRef.child("editTime").set(firebase.database.ServerValue.TIMESTAMP);
        this.setState({ edited: true });
        window.setTimeout(() => {
            this.setState({ edited: false });
        }, 1500);
    }

    deleteComment() {
        var commentRef = firebase.database().ref("Users/" + this.props.postWriter + "/published/" + this.props.post + "/comments/" + this.props.comment.key);
        commentRef.remove();
    }

    render() {
        let editClose = () => this.setState({ editShow: false });
        let deleteClose = () => this.setState({ deleteShow: false });

        return (
            <div className="panel panel-default panel-info">
                <div className="panel-heading">
                    <p className="panel-title">{this.props.comment.handle || this.props.comment.userId}
                        {this.props.comment.editTime === undefined &&
                            <span> Posted <Time value={this.props.comment.time} relative /></span>
                        }
                        {this.props.comment.editTime &&
                            <span> Edited <Time value={this.props.comment.editTime} relative /></span>
                        }
                    </p>
                </div>
                <div className="panel-body white-space">
                    <p className="comment-text white-space">{this.props.comment.text}</p>
                </div>
                {this.props.comment.userId === firebase.auth().currentUser.uid &&
                    <div className="panel-footer">
                        <Button bsSize="small" onClick={() => this.setState({ editShow: true })}>Edit</Button>
                        <Button bsStyle="danger" bsSize="small" onClick={() => this.setState({ deleteShow: true })}>Delete</Button>
                    </div>
                }

                <Modal show={this.state.editShow} onHide={editClose} bsSize="large" aria-labelledby="contained-modal-title-lg">
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-lg">
                            <p>Edit</p>
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <textarea defaultValue={this.props.comment.text} className="post-form form-control" onChange={(e) => this.updateText(e)} />
                        {this.state.edited &&
                            <Alert bsStyle="success">
                                <strong>Edited!</strong>
                            </Alert>
                        }
                    </Modal.Body>
                    <Modal.Footer>
                        <Button bsStyle="primary" onClick={() => this.editPost()}>Save</Button>
                        <Button onClick={editClose}>Cancel</Button>
                    </Modal.Footer>
                </Modal>

                <Modal show={this.state.deleteShow} onHide={deleteClose} bsSize="small" aria-labelledby="contained-modal-title-sm">
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-sm">
                            Are you sure?
                    </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        This will permanently delete your comment.
                </Modal.Body>
                    <Modal.Footer>
                        <Button bsStyle="danger" onClick={() => this.deleteComment()}>Yes</Button>
                        <Button onClick={deleteClose}>No</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}

export default IndividualPost;