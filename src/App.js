import React, { Component } from 'react';
import './App.css';
import {LinkContainer} from 'react-router-bootstrap';
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
  
    firebase.auth().onAuthStateChanged(user => {
      //if they are logged in it pushes to channel component
      if(user) {
        this.setState({'loggedIn': true});
      }
    })
   }
  render() {
    return (
    <div>

      <div>
        <header role="banner" className="well">
          <div className="container">
            <Navbar collapseOnSelect>
              <Navbar.Header>
                <Navbar.Brand>
                    <a href="#">Damaged Blue Zone</a>
                </Navbar.Brand>
                <Navbar.Toggle />
              </Navbar.Header>
              <Navbar.Collapse>
                <Nav>
                  <NavDropdown title="Navigate" id="basic-nav-dropdown">
                    <LinkContainer to={'/featured'}><MenuItem>**HOT** Works</MenuItem></LinkContainer>
                    <LinkContainer to={'/saved'}><MenuItem>Saved Posts</MenuItem></LinkContainer>
                    <LinkContainer to={'/published'}><MenuItem>Published Posts</MenuItem></LinkContainer>
                    <LinkContainer to={'/search'}><MenuItem>Search</MenuItem></LinkContainer>
                    <LinkContainer to={'/newpost'}><MenuItem>Make a New Post!</MenuItem></LinkContainer>
                  </NavDropdown>
                </Nav>
                <Nav pullRight>
                  <NavItem>
                    {firebase.auth().currentUser &&
                    <button className="btn btn-warning float-btn" onClick={() => this.signOut()}>Sign out</button>
                    }
                  </NavItem>
                </Nav>
              </Navbar.Collapse>
            </Navbar>
          </div>  
          
        </header>
        <div className="container" role="main">
          {this.props.children}
        </div>
      </div>
    </div>
    );
  }
}

export default App;
