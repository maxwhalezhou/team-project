import React from "react";
import { hashHistory, Link } from "react-router";
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
        var publishedPostsRef = firebase.database().ref("Users/" + firebase.auth().currentUser.uid + "/published");

        publishedPostsRef.on("value", (snapshot) => {
            var publishedPostsArray = [];
            snapshot.forEach(function (child) {
                publishedPostsArray.push(child.val());
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
    render() {
        var text = this.props.post.text;
        if (this.props.post.text.length > 200) {
            var text = text.substring(0, 200) + "...";
        }

        return (
            <div>
                <h3>{this.props.post.title}</h3>
                <div>{text}</div>
            </div>
        );
    }
}

export default Published;
