import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import {Router, Route, browserHistory} from 'react-router';
import firebase from "firebase";

class App extends Component {
  signOut(){
    /* Sign out the user, and update the state */
    firebase.auth().signOut();
    
  }
  render() {
    return (
      <div>
        <header role="banner" className="well">

          <div className="container">
            <h1>Our Awesome Website</h1>
          </div>  
          {firebase.auth().currentUser &&
          <button className="btn btn-warning float-btn" onClick={() => this.signOut()}>Sign out</button>
            }
        </header>
        <div className="container" role="region">
          {this.props.children}
        </div>
      </div>
    );
  }
}

export default App;
