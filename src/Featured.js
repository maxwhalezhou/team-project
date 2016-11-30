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
        });
      
    }

    render() {

        var postItems = this.state.Posts.map((post) => {
        //including channel prop so the post can be edited later 
        return <PostItem post={post} key={post.key} />
      });
        return(
            <div>
                <h2>Featured Posts</h2>
                {postItems}

            </div>
            );
    }
}
class PostItem extends React.Component {
    handleClick(e){
        // var param = this.props.post.key.substring(1,);
      hashHistory.push('/post/'+this.props.post.key);
    }

    render() {
        var text =this.props.post.text;
        if(this.props.post.text.length >200){
            var text = text.substring(0, 200) +"...";
        }
        console.log(this.props.post.key);
        return(
            <div onClick={(e) =>this.handleClick(e)}>
                <h3>{this.props.post.title}</h3>
                <div >{text}</div>
            </div>
            );
    }
}

export {PostItem};
export default Featured;
