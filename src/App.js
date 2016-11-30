import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import {Router, Route, hashHistory} from 'react-router';
import {Navbar, Nav, NavItem, NavDropdown, MenuItem} from 'react-bootstrap';
import firebase from "firebase";

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      'loggedIn': false
    }; 
  }
  signOut(){
    /* Sign out the user, and update the state */
    firebase.auth().signOut();
  }
   componentDidMount() {
    /* Add a listener and callback for authentication events */
  
    var unregister = firebase.auth().onAuthStateChanged(user => {
      //if they are logged in it pushes to channel component
      if(user) {
        this.setState({'loggedIn': true});
        console.log('Auth state changed: logged in as', user.email);
      }
      else{
        console.log('Auth state changed: logged out');
      }
    })
   }
  render() {
    return (
    <div>
      <Navbar inverse collapseOnSelect>
        <Navbar.Header>
          <Navbar.Brand>
            <a href="#">React-Bootstrap</a>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          <Nav>
            <NavDropdown eventKey={0} title="Dropdown" id="basic-nav-dropdown">
              <MenuItem eventKey={1}>Action</MenuItem>
              <MenuItem eventKey={2}>Another action</MenuItem>
              <MenuItem eventKey={3}>Something else here</MenuItem>
              <MenuItem eventKey={4}>Something else here</MenuItem>
              <MenuItem eventKey={5}>Something else here</MenuItem>
              <MenuItem eventKey={6}>Something else here</MenuItem>
              <MenuItem eventKey={7}>Something else here</MenuItem>
              <MenuItem eventKey={8}>Something else here</MenuItem>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      <div>
        <header role="banner" className="well">
          <div className="container">
            <h1>Our Awesome Website</h1>
            {firebase.auth().currentUser &&
          <button className="btn btn-warning float-btn" onClick={() => this.signOut()}>Sign out</button>
            }
          </div>  
          
        </header>
        <div className="container" role="region">
          {this.props.children}
        </div>
      </div>
    </div>
    );
  }
}

export default App;
