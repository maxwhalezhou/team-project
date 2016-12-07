import React from "react";
import { hashHistory } from "react-router";
import { Modal, Button, Alert } from "react-bootstrap";
import firebase from "firebase";

class Published extends React.Component {
    render() {
        return (
            <div>
                <h2>Published Posts</h2>
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
        this.state = { publishedPosts: [] }
    }

    componentDidMount() {
        var unregister = firebase.auth().onAuthStateChanged(user => {
            if (user) {
                this.getPosts();
            } else {
                unregister();
                hashHistory.push('/login');
            }
        });
    }

    getPosts() {
        var publishedPostsRef = firebase.database().ref("Users/" + firebase.auth().currentUser.uid + "/published");

        publishedPostsRef.on("value", (snapshot) => {
            var publishedPostsArray = [];
            snapshot.forEach(function(child) {
                var post = child.val();
                post.key = child.key;
                publishedPostsArray.push(post);
            });
            this.setState({ publishedPosts: publishedPostsArray });
        });
    }

    render() {
        var posts = this.state.publishedPosts.map((post) => {
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

        this.state = { editShow: false, deleteShow: false };
    }
    handleClick(e){
      hashHistory.push('/post/'+this.props.post.key);
    }
    render() {
        var text = this.props.post.text;
        if (this.props.post.text.length > 200) {
            text = text.substring(0, 200) + "...";
        }

        let editClose = () => this.setState({ editShow: false });
        let deleteClose = () => this.setState({ deleteShow: false });

        return (
            <div>
                <div className="panel panel-default panel-info">
                    <div className="panel-heading">
                        <h3 className="panel-title">{this.props.post.title}</h3>
                    </div>
                    <div className="panel-body white-space">
                        {text}
                    </div>
                    <div className="panel-footer">
                        <Button bsSize="small" onClick={() => this.setState({ editShow: true })}>Edit</Button>
                        <Button bsStyle="danger" bsSize="small" onClick={() => this.setState({ deleteShow: true })}>Delete</Button>
                        <Button className="btn-space" bsSize="small" bsStyle='primary' onClick={(e) => this.handleClick(e)}>Read More</Button>
                    </div>
                </div>

                <EditModal post={this.props.post} show={this.state.editShow} onHide={editClose} />
                <DeleteModal post={this.props.post} show={this.state.deleteShow} onHide={deleteClose} />
            </div>
        );
    }
}

class EditModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = { title: this.props.post.title, text: this.props.post.text, saved: false };
    }

    updateSaved() {
        this.setState({ saved: false });
    }

    updateTitle(event) {
        this.setState({ title: event.target.value });
    }

    updateText(event) {
        this.setState({ text: event.target.value });
    }

    editPost(post) {
        var postRef = firebase.database().ref("Users/" + firebase.auth().currentUser.uid + "/published/" + post.key);
        postRef.child("title").set(this.state.title);
        postRef.child("text").set(this.state.text);
        this.setState({ saved: true });
        window.setTimeout(() => {
            this.setState({ saved: false });
        }, 1500);
    }

    render() {
        return (
            <Modal {...this.props} bsSize="large" aria-labelledby="contained-modal-title-lg">
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-lg">
                        <input defaultValue={this.props.post.title} className="post-form form-control input-lg" onChange={(e) => this.updateTitle(e)} />
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body onClick={() => this.updateSaved()}>
                    <textarea defaultValue={this.props.post.text} className="post-form form-control" onChange={(e) => this.updateText(e)} />
                    {this.state.saved &&
                        <Alert bsStyle="success">
                            <strong>Saved!</strong>
                        </Alert>
                    }
                </Modal.Body>
                <Modal.Footer>
                    <Button bsStyle="primary" onClick={() => this.editPost(this.props.post)}>Save</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

class DeleteModal extends React.Component {
    deletePost(post) {
        var postRef = firebase.database().ref("Users/" + firebase.auth().currentUser.uid + "/published/" + post.key);
        postRef.remove();
    }

    render() {
        return (
            <Modal {...this.props} bsSize="small" aria-labelledby="contained-modal-title-sm">
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-sm">
                        Deleting "{this.props.post.title}"
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure?
                </Modal.Body>
                <Modal.Footer>
                    <Button bsStyle="danger" onClick={() => this.deletePost(this.props.post)}>Yes</Button>
                    <Button onClick={this.props.onHide}>No</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

export default Published;
