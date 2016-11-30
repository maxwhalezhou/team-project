import React from "react";
import firebase from "firebase";
import $ from 'jquery';
import {PostItem} from "./Featured";
import {IndividualPost} from "./IndividualPost";

//create search box
class SearchResults extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            value: '',
            Posts: [],
            Matching:[]
        }
    }

    handleChange(event) {
        this.setState({ value: event.target.value.toLowerCase() });
    }

    searchPosts() {
        //only executes if there is a channel param
        //getting the last 100 posts
        var searchValue = this.state.value;
        console.log(searchValue);
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
            for(var i = 0; i < this.state.Posts.length; i++) {
                console.log(this.state.Posts[i].text.toLowerCase().includes(searchValue.toLowerCase));
                if(this.state.Posts[i].text.toLowerCase().includes(searchValue) || this.state.Posts[i].title.toLowerCase().includes(searchValue)) {
                    matchingArray.push(this.state.Posts[i]);
                    console.log("match!" + this.state.Posts[i].text);
                }
            }
            this.setState({ Matching: matchingArray});
            console.log( "matching: " + this.state.Matching);
        });
    }


    render() {

        var postItems = this.state.Matching.map((post) => {
        //including channel prop so the post can be edited later 
        return <PostItem post={post} key={post.key} />
      });

        return (
            <div>
                <div className="form-group">
                    <form>
                        <input type="text" placeholder="Search posts here" className="form-control" id="search" value={this.state.value} onChange={this.handleChange.bind(this)} />
                        <button className="btn btn-primary" onClick={(e) => this.searchPosts(e)}>Search</button>
                    </form>
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
