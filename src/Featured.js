import React from "react";
import { hashHistory, Link } from "react-router";
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
                console.log('Auth state changed: logged in as', user.email);
                 this.getPosts();
            }else{
                unregister();
                console.log('Auth state changed: logged out');
                hashHistory.push('/login/');
            }
        });
    }
     getPosts(){
        //only executes if there is a channel param
        //getting the last 100 posts
        var postsRef = firebase.database().ref("Users");  
        postsRef.on('value', (snapshot) => {
            var postsArray = []; 
            //going through posts and pushing the value into array
            
            snapshot.forEach(function(child){
                if(child.val().published){
                    var postKeys = Object.keys(child.val().published)
                    for(var i= 0 ; i < postKeys.length; i++){
                        var post = child.val().published[postKeys[i]];
                        post.key = postKeys[i]; //save the unique id for later
                        postsArray.push(post);
                    }   
                } 
            });
            //sorting the array by time
            //postsArray.sort((a,b) => a.comments.length - b.comments.length); //reverse order
             postsArray.sort(function(a, b) {

                 var A= a.comments;
                 var B= b.comments;
                if (A === undefined && B === undefined) {
                    return 0;
                }else if(A === undefined ){
                    return 1;
                }else if(B === undefined){
                    return -1;
                }else if(Object.keys(A).length === Object.keys(B).length ){
                    return 0;
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

    render() {

        var postItems = '';
            postItems= this.state.Posts.map((post) => {
                return <PostItem post={post} key={post.key} />
            });
        return(
            <div>
                <h2>**HOT** Posts</h2>
                {postItems}
            </div>
            );
    }
}
class PostItem extends React.Component {
    

    handleClick(e){
      hashHistory.push('/post/'+this.props.post.key);
    }

    render() {
        var text =this.props.post.text;
        if(this.props.post.text.length > 250){
            text = text.substring(0, 250) +"...";
        }
        var comment = '';
        console.log(this.props.post.comment);
        if(this.props.post.comments !== undefined){
            comment =  Object.keys(this.props.post.comments).length;
        }else{
            comment = 0;
        }
        return(
            <div className="panel panel-default panel-info">
                <div className="panel-heading">
                    <h3 className="panel-title">{this.props.post.title}</h3>
                    <p className="small help-block">{comment} Comments</p>
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
