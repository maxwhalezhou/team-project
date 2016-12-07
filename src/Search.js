import React from "react";
import firebase from "firebase";
import { PostItem } from "./Featured";
import { hashHistory } from "react-router";
//create search box
class SearchResults extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            value: '',
            Posts: [],
            Matching: [],
            searched: false
        }
    }

    handleChange(event) {
        this.setState({ value: event.target.value.toLowerCase() });
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
    searchPosts() {
        //only executes if there is a channel param
        //getting the last 100 posts
        var searchValue = this.state.value;
        var matchingArray = [];
        var postsRef = firebase.database().ref("Users");
        postsRef.on('value', (snapshot) => {
            var postsArray = [];
            //going through posts and pushing the value into array

            snapshot.forEach(function (child) {
                var postKeys = Object.keys(child.val().published)
                for (var i = 0; i < postKeys.length; i++) {
                    var post = child.val().published[postKeys[i]];
                    post.key = postKeys[i]; //save the unique id for later
                    postsArray.push(post);
                }
            });
            //sorting the array by time
            //postsArray.sort((a,b) => a.comments.length - b.comments.lengh); //reverse order

            this.setState({ Posts: postsArray });

            //go through all posts and check if they have matching value. if so, add to an array
            for (var i = 0; i < this.state.Posts.length; i++) {
                if (this.state.Posts[i].text.toLowerCase().includes(searchValue) || this.state.Posts[i].title.toLowerCase().includes(searchValue)) {
                    matchingArray.push(this.state.Posts[i]);
                }
            }
            this.setState({ Matching: matchingArray, searched: true });
        });
    }

    render() {

        var postItems ='';
        if(this.state.Matching.length > 0){
            postItems = this.state.Matching.map((post) => {
            //including channel prop so the post can be edited later 
                return <PostItem post={post} key={post.key} />
            });
        } else if(this.state.Matching.length === 0 && this.state.searched) {
            postItems = <h3> No Results Found </h3>;
        }

        return (
            <div>
                <div className="input-group">
                    <input type="text" placeholder="Search posts here" className="form-control" id="search" value={this.state.value} onChange={this.handleChange.bind(this)} />
                    <span className="input-group-btn">
                        <button className="btn btn-primary" onClick={(e) => this.searchPosts(e)}>Search</button>
                    </span>
                </div>
                <div>
                    {postItems}
                </div>
            </div>
        );
    }

}

class Search extends React.Component {

    render() {
        return (
            <div>
                <h1>Search</h1>
                <SearchResults />
            </div>
        );
    }
}



export default Search;
