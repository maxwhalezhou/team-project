import React from "react";
import { hashHistory} from "react-router";
import {Button} from "react-bootstrap";
import firebase from "firebase";

class Featured extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            Posts: []
        }; 
    }
    componentDidMount() {
    /* Add a listener and callback for authentication events */
        var unregister = firebase.auth().onAuthStateChanged(user => {
            if(user) {
                 this.getPosts();//getting all of the published posts from the database
            }else{
                unregister();
                hashHistory.push('/login/');//pushing to login page when not logged in
            }
        });
    }
    getPosts(){
        //only executes if there is a channel param
        //getting the last 100 posts
        this.postsRef = firebase.database().ref("Users");  
        this.postsRef.on('value', (snapshot) => {
            var postsArray = []; 
            //going through posts and pushing the value into array
            snapshot.forEach(function(child){
                if(child.val().published){
                    var postKeys = Object.keys(child.val().published)
                    for(var i= 0 ; i < postKeys.length; i++){//going through
                        var post = child.val().published[postKeys[i]];
                        post.key = postKeys[i]; //save the unique id for later
                        postsArray.push(post);
                    }   
                } 
            });

            //sorting the array by number of comments
            //returns 0 when equal, 1 when B.length is greater than A,
            // and -1 when A is greater than B
            postsArray.sort(function(a, b) {
                var A= a.comments;
                var B= b.comments;
                if (A === undefined && B === undefined) {
                    return 0;
                }else if(A === undefined ){
                    return 1;
                }else if(B === undefined){
                    return -1;
                }else if(Object.keys(A).length < Object.keys(B).length ){
                    return 1;
                }else if(Object.keys(A).length > Object.keys(B).length ){
                    return -1;
                }
                // names must be equal
                return 0;
            });
            this.setState({Posts:postsArray});
        });
      
    }

    //turns off reference for postRef
    componentWillUnmount=()=> {
        this.postsRef.off();
    }

    render() {
        //Making each post aa postitem
        var postItems = '';
        postItems= this.state.Posts.map((post) => {
            return <PostItem post={post} key={post.key} />
        });
        return(
            <div >
                <h2>**HOT** Works</h2>
                <div className="alert alert-info" role="alert">
                    Here is where the "hottest" works (i.e., those with the most comments) appear!
                    Each post goes in descending order from the greatest amount of comments to the least amount of comments.
                </div>
                <div role="region">   
                    {postItems}
                </div>
            </div>
            );
    }
}
class PostItem extends React.Component {
    //goes to the individual post
    handleClick(e){
      hashHistory.push('/post/'+this.props.post.key);
    }


    render() {

        var text =this.props.post.text;
        //only shows a substring if over certain length
        if(this.props.post.text.length > 250){
            text = text.substring(0, 250) +"...";
        }

        var comment = '';//set to number of comments on post
        var commentDisplay = "Comments";//text that follows comment number
        if(this.props.post.comments !== undefined){
            comment =  Object.keys(this.props.post.comments).length;
            if (Object.keys(this.props.post.comments).length === 1) {
                commentDisplay = "Comment";//if only one comment 
            }
        }else{//if there is no comment object in database
            comment = 0;
        }

        return(
            <div className="panel panel-default panel-info">
                <div className="panel-heading">
                    <h3 className="panel-title">{this.props.post.title}</h3>
                    <p className="small help-block">{comment} {commentDisplay}</p>
                </div>
                <div className="panel-body white-space">
                    {text}
                </div>
                <div className="panel-footer">
                    <Button bsSize="small" bsStyle='primary' onClick={(e) => this.handleClick(e)}>Read More</Button>
                </div>
            </div>
            );
    }
}

export {PostItem};
export default Featured;
