import React from "react";
import { hashHistory } from "react-router";
import { Modal, Button, Alert } from "react-bootstrap";
import firebase from "firebase";

class Saved extends React.Component {
    // displays the user's saved posts
    render() {
        return (
            <div>
                <h2>Saved Works</h2>
                <Alert role="alert">
                    <p>Here is where your saved works are! You are free to edit or delete them at any time!</p>
                    <p>If you want to post them, however, you need to click on the edit button first and click on "Post."</p>
                </Alert>
                <div role="region">
                    <PostList />
                </div>
            </div>
        );
    }
}

// creates a list of the user's saved posts
class PostList extends React.Component {
    constructor(props) {
        super(props);
        this.state = { savedPosts: [] }
    }

    componentDidMount() {
        var unregister = firebase.auth().onAuthStateChanged(user => {
            // if the user is logged in, get their posts
            if (user) {
                this.getPosts();
            } else {
                // otherwise, re-direct them to the login page
                unregister();
                hashHistory.push('/login');
            }
        });
    }

    // get all of the posts from firebase's database
    getPosts() {
        // get the database reference on saved posts
        this.savedPostsRef = firebase.database().ref("Users/" + firebase.auth().currentUser.uid + "/saved");

        // iterate through each post in the database
        this.savedPostsRef.on("value", (snapshot) => {
            // create an empty array to hold saved posts
            var savedPostsArray = [];

            // add every saved post in firebase to the array
            snapshot.forEach(function (child) {
                var post = child.val();
                post.key = child.key;
                savedPostsArray.push(post);
            });

            // sorts the saved posts based on how recent they are (i.e., most recent to least recent)
            savedPostsArray.sort((a, b) => b.time - a.time);

            // save the saved posts
            this.setState({ savedPosts: savedPostsArray });
        });
    }

    // unmount the reference to avoid warnings/errors
    componentWillUnmount = () => {
        this.savedPostsRef.off();
    }

    // renders all of the posts
    render() {
        // map the posts, so they're put into components to render
        var posts = this.state.savedPosts.map((post) => {
            return <PostItem post={post} key={post.key} />
        });

        // display the posts
        return (
            <div>
                {posts}
            </div>
        );
    }
}

// creates a single saved post
class PostItem extends React.Component {
    constructor(props) {
        super(props);

        this.state = { editShow: false, deleteShow: false, title: this.props.post.title, text: this.props.post.text, saved: false };
    }

    // whenever the user types in the title, update it each time
    updateTitle(event) {
        this.setState({ title: event.target.value });
    }

    // whenever the user types in the post section, update it each time
    updateText(event) {
        this.setState({ text: event.target.value });
    }

    // edits the user's saved post
    editPost(post) {
        // grab that specific post's reference in firebase
        var postRef = firebase.database().ref("Users/" + firebase.auth().currentUser.uid + "/saved/" + post.key);

        // change its title and post content
        postRef.child("title").set(this.state.title);
        postRef.child("text").set(this.state.text);

        // set the saved state to be true
        this.setState({ saved: true });

        // after 1.5 seconds, set the saved state back to false
        window.setTimeout(() => {
            this.setState({ saved: false });
        }, 1500);
    }

    // deletes the user's saved post
    deletePost(post) {
        // grab that specific post's reference in firebase
        var postRef = firebase.database().ref("Users/" + firebase.auth().currentUser.uid + "/saved/" + post.key);

        // remove it from firebase
        postRef.remove();
    }

    // posts the user's saved post onto the website
    postPost(post) {
        // grabs that specific post's reference under firebase's saved posts, and remove it
        var postRef = firebase.database().ref("Users/" + firebase.auth().currentUser.uid + "/saved/" + post.key);
        postRef.remove();

        // grab the database reference to the user's published posts
        var publishedPostsRef = firebase.database().ref("Users/" + firebase.auth().currentUser.uid + "/published");

        // because the state has the saved post's data, create a new published post
        var publishPost = {
            handle: firebase.auth().currentUser.displayName,
            text: this.state.text,
            time: this.props.post.time,
            title: this.state.title,
            userId: firebase.auth().currentUser.uid
        };

        // push the published post onto firebase
        publishedPostsRef.push(publishPost);
    }

    // renders each saved post
    render() {
        // create a preview of the post
        var text = this.props.post.text;
        if (this.props.post.text.length > 200) {
            text = text.substring(0, 200) + "...";
        }

        // set up the Modals' display states
        let editClose = () => this.setState({ editShow: false });
        let deleteClose = () => this.setState({ deleteShow: false });

        // displays each saved post
        return (
            <div>
                {/* A saved post */}
                <div role="region" className="panel panel-default panel-info" aria-labelledby="a saved work">
                    <div className="panel-heading" aria-labelledby="a saved work's title">
                        <h3 className="panel-title">{this.props.post.title}</h3>
                    </div>
                    <div className="panel-body white-space" aria-labelledby="a saved work's content">
                        {text}
                    </div>
                    <div className="panel-footer" aria-labelledby="a saved work's edit and delete buttons">
                        <Button bsSize="small" onClick={() => this.setState({ editShow: true })} aria-labelledby="edit button">Edit</Button>
                        <Button bsStyle="danger" bsSize="small" onClick={() => this.setState({ deleteShow: true })} aria-labelledby="delete button">Delete</Button>
                    </div>
                </div>

                {/* A Modal for editing the post */}
                <Modal show={this.state.editShow} onHide={editClose} bsSize="large" aria-labelledby="edit post modal">
                    <Modal.Header closeButton>
                        <Modal.Title>
                            <input defaultValue={this.props.post.title} className="post-form form-control input-lg" onChange={(e) => this.updateTitle(e)} aria-labelledby="the saved work's title"/>
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <textarea defaultValue={this.props.post.text} className="post-form form-control" onChange={(e) => this.updateText(e)} aria-labelledby="the saved work's content"/>
                        {/* If the post has been edited, display an alert to the user, and remove the alert after 1.5 seconds */}
                        {this.state.saved &&
                            <Alert bsStyle="success">
                                <strong>Saved!</strong>
                            </Alert>
                        }
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={() => this.editPost(this.props.post)} aria-labelledby="save button">Save</Button>
                        <Button bsStyle="primary" onClick={() => this.postPost(this.props.post)} aria-labelledby="post button">Post</Button>
                    </Modal.Footer>
                </Modal>

                {/* A Modal for deleting the post */}
                <Modal show={this.state.deleteShow} onHide={deleteClose} bsSize="small" aria-labelledby="delete post modal">
                    <Modal.Header closeButton>
                        <Modal.Title>
                            Deleting "{this.props.post.title}"
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Are you sure?
                    </Modal.Body>
                    <Modal.Footer>
                        <Button bsStyle="danger" onClick={() => this.deletePost(this.props.post)} aria-labelledby="yes button">Yes</Button>
                        <Button onClick={deleteClose} aria-labelledby="no button">No</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}

export default Saved;