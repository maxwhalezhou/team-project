import React from "react";
import { hashHistory, Link } from "react-router";
import firebase from "firebase";

class Featured extends React.Component {
    componentDidMount() {
    /* Add a listener and callback for authentication events */
        var unregister = firebase.auth().onAuthStateChanged(user => {
        if(user) {
            console.log('Auth state changed: logged in as', user.email);
        }else{
            unregister();
            console.log('Auth state changed: logged out');
            hashHistory.push('/login');
        }
        });
    }
    render() {
        return(<div>Featured Posts</div>);
    }
}

export default Featured;
