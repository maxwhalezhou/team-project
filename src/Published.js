import React from "react";
import { hashHistory } from "react-router";
import { Modal, Button, Alert } from "react-bootstrap";
import firebase from "firebase";

class Published extends React.Component {
    // displays the user's published posts
    render() {
        return (
            <div>
                <h2>Published Works</h2>
                <Alert role="alert">
                    <p>Here is where your published works are! You are also free to edit or delete them at any time in this section!</p>
                    <p>You can also easily check out a post and its comments on the website by clicking on "Read More."</p>
                </Alert>
                <div>
                    <PostList />
                </div>
            </div>
        );
    }
}

// creates a list of the user's published posts
class PostList extends React.Component {
    constructor(props) {
        super(props);
        this.state = { publishedPosts: [] }
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
        var publishedPostsRef = firebase.database().ref("Users/" + firebase.auth().currentUser.uid + "/published");

        // iterate through each post in the database, and save them
        this.PostsRef = publishedPostsRef;
        publishedPostsRef.on("value", (snapshot) => {
            // create an empty array to hold published posts
            var publishedPostsArray = [];

            // add every published post in firebase to the array
            snapshot.forEach(function (child) {
                var post = child.val();
                post.key = child.key;
                publishedPostsArray.push(post);
            });

            // sorts the saved posts based on how recent they are (i.e., most recent to least recent)
            publishedPostsArray.sort((a, b) => b.time - a.time);

            // saved the published posts
            this.setState({ publishedPosts: publishedPostsArray });
        });
    }

    // unmount the reference to avoid warnings/errors
    componentWillUnmount = () => {
        this.PostsRef.off();
    }

    // displays all of the posts
    render() {
        // map the posts, so they're put into components to render
        var posts = this.state.publishedPosts.map((post) => {
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

// creates a single published post
class PostItem extends React.Component {
    constructor(props) {
        super(props);

        this.state = { editShow: false, deleteShow: false, title: this.props.post.title, text: this.props.post.text, saved: false };
    }

    // re-directs to the published post's webpage
    handleClick() {
        hashHistory.push('/post/' + this.props.post.key);
    }

    // whenever the user types in the title, update it each time
    updateTitle(event) {
        this.setState({ title: event.target.value });
    }

    // whenever the user types in the post section, update it each time
    updateText(event) {
        this.setState({ text: event.target.value });
    }

    // edits the user's published post
    editPost(post) {
        // grab that specific post's reference in firebase
        var postRef = firebase.database().ref("Users/" + firebase.auth().currentUser.uid + "/published/" + post.key);
        
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

    // deletes the user's published post
    deletePost(post) {
        // grab that specific post's reference in firebase
        var postRef = firebase.database().ref("Users/" + firebase.auth().currentUser.uid + "/published/" + post.key);
        
        // remove it from firebase
        postRef.remove();
    }

    // renders each published post
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
                {/* A published post */}
                <div className="panel panel-default panel-info" aria-labelledby="a published work">
                    <div className="panel-heading" aria-labelledby="a published work's title">
                        <h3 className="panel-title">{this.props.post.title}</h3>
                    </div>
                    <div className="panel-body white-space" aria-labelledby="a published work's content">
                        {text}
                    </div>
                    <div className="panel-footer" aria-labelledby="a published work's edit, delete, and read more buttons">
                        <Button bsSize="small" onClick={() => this.setState({ editShow: true })} aria-labelledby="edit button">Edit</Button>
                        <Button bsStyle="danger" bsSize="small" onClick={() => this.setState({ deleteShow: true })} aria-labelledby="delete button">Delete</Button>
                        <Button className="btn-space" bsSize="small" bsStyle='primary' onClick={() => this.handleClick()} aria-labelledby="read more button">Read More</Button>
                    </div>
                </div>

                {/* A Modal for editing the post */}
                <Modal show={this.state.editShow} onHide={editClose} bsSize="large" aria-labelledby="edit post modal">
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-lg">
                            <input defaultValue={this.props.post.title} className="post-form form-control input-lg" onChange={(e) => this.updateTitle(e)} />
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <textarea defaultValue={this.props.post.text} className="post-form form-control" onChange={(e) => this.updateText(e)} />
                        {/* If the post has been edited, display an alert to the user, and remove the alert after 1.5 seconds */}
                        {this.state.saved &&
                            <Alert bsStyle="success">
                                <strong>Saved!</strong>
                            </Alert>
                        }
                    </Modal.Body>
                    <Modal.Footer>
                        <Button bsStyle="primary" onClick={() => this.editPost(this.props.post)} aria-labelledby="save button">Save</Button>
                        <Button onClick={editClose} aria-labelledby="cancel button">Cancel</Button>
                    </Modal.Footer>
                </Modal>

                {/* A Modal for deleting the post */}
                <Modal show={this.state.deleteShow} onHide={deleteClose} bsSize="small" aria-labelledby="delete post modal">
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-sm">
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

export default Published;
