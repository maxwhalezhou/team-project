import React from "react";
import { hashHistory, Link } from "react-router";
import { Modal, Button } from "react-bootstrap";
import firebase from "firebase";

class Saved extends React.Component {
    render() {
        return (
            <div>
                <h2>Saved Posts</h2>
                <div>
                    <PostList />
                </div>
            </div>
        );
    }
}

class PostList extends React.Component {
    constructor(props) {
        super(props);
        this.state = { savedPosts: [] }
    }

    componentDidMount() {
        var unregister = firebase.auth().onAuthStateChanged(user => {
            if (user) {
                console.log('Auth state changed: logged in as', user.email);
                this.getPosts();
            } else {
                unregister();
                console.log('Auth state changed: logged out');
                hashHistory.push('/login');
            }
        });
    }

    getPosts() {
        this.savedPostsRef = firebase.database().ref("Users/" + firebase.auth().currentUser.uid + "/saved");

        this.savedPostsRef.on("value", (snapshot) => {
            var savedPostsArray = [];
            snapshot.forEach(function(child) {
                var post = child.val();
                post.key = child.key;
                savedPostsArray.push(post);
            });
            this.setState({ savedPosts: savedPostsArray });
        });
    }
    
    componentWillUnmount = () => {
        this.savedPostsRef.off();
    }

    render() {
        var posts = this.state.savedPosts.map((post) => {
            return <PostItem post={post} key={post.key} />
        });

        return (
            <div>
                {posts}
            </div>
        );
    }
}

class PostItem extends React.Component {
    constructor(props) {
        super(props);

        this.state = { editShow: false };
    }

    render() {
        var text = this.props.post.text;
        if (this.props.post.text.length > 200) {
            var text = text.substring(0, 200) + "...";
        }

        let editClose = () => this.setState({ editShow: false });

        return (
            <div>
                <h3>{this.props.post.title}</h3>
                <div>{text}</div>
                <Button onClick={() => this.setState({ editShow: true })}>Edit</Button>

                <EditModal post={this.props.post} show={this.state.editShow} onHide={editClose} />
            </div>
        );
    }
}

class EditModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = { title: this.props.post.title, text: this.props.post.text };
    }

    updateTitle(event) {
        this.setState({ title: event.target.value });
    }

    updateText(event) {
        this.setState({ text: event.target.value });
    }

    editPost(post) {
        var postRef = firebase.database().ref("Users/" + firebase.auth().currentUser.uid + "/saved/" + post.key);
        postRef.child("title").set(this.state.title);
        postRef.child("text").set(this.state.text);
    }

    postPost(post) {
        var postRef = firebase.database().ref("Users/" + firebase.auth().currentUser.uid + "/saved/" + post.key);
        postRef.remove();

        var publishedPostsRef = firebase.database().ref("Users/" + firebase.auth().currentUser.uid + "/published");
        var publishPost = {
            text: this.state.text,
            time: this.props.post.time,
            title: this.state.title,
            userId: firebase.auth().currentUser.uid
        };
        publishedPostsRef.push(publishPost);
    }

    render() {
        return (
            <Modal {...this.props} bsSize="large" aria-labelledby="contained-modal-title-lg">
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-lg">
                        <textarea defaultValue={this.props.post.title} onChange={(e) => this.updateTitle(e)} />
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <textarea defaultValue={this.props.post.text} onChange={(e) => this.updateText(e)} />
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => this.editPost(this.props.post)}>Save</Button>
                    <Button bsStyle="primary" onClick={() => this.postPost(this.props.post)}>Post</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

export default Saved;