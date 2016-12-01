import React from "react";
import { hashHistory, Link } from "react-router";
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
                var postKeys = Object.keys(child.val().published)
                for(var i= 0 ; i < postKeys.length; i++){
                    var post = child.val().published[postKeys[i]];
                    post.key = postKeys[i]; //save the unique id for later
                    postsArray.push(post);
                }    
            });
            //sorting the array by time
            //postsArray.sort((a,b) => a.comments.length - b.comments.lengh); //reverse order
            
            this.setState({Posts:postsArray});
            console.log(this.state.Posts);
        });
      
    }

    render() {

        var postItems = '';
        if(this.state.Posts){
            postItems= this.state.Posts.map((post) => {
                return <PostItem post={post} key={post.key} />
            });
        }
        return(
            <div>
                <h2>Featured Posts</h2>
                {postItems}

            </div>
            );
    }
}
class PostItem extends React.Component {
    handleClick(){
      hashHistory.push('/post/'+this.props.key);
    }

    render() {
        var text =this.props.post.text;
        if(this.props.post.text.length > 1250){
            var text = text.substring(0, 1250) +"...";
        }
        return(
            <div className="panel panel-default" onClick={this.handleClick}>
                <div className="panel-heading">
                    <h3 className="panel-title">{this.props.post.title}</h3>
                </div>
                <div className="panel-body">
                    {text}
                </div>
            </div>
            );
    }
}

export {PostItem};
export default Featured;
