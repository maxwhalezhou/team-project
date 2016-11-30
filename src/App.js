import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import {Router, Route, hashHistory, Link} from 'react-router';
import {LinkContainer} from 'react-router-bootstrap';
import {Navbar, Nav, NavItem, NavDropdown, MenuItem} from 'react-bootstrap';
import firebase from "firebase";

class App extends Component {
  signOut(){
    /* Sign out the user, and update the state */
    firebase.auth().signOut();
    
  }
  render() {
    return (
    <div>
      <Navbar inverse collapseOnSelect>
        <Navbar.Header>
          <Navbar.Brand>
            <a href="">React-Bootstrap</a>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          <Nav>
            <NavDropdown title="Navigate" id="basic-nav-dropdown">
              <LinkContainer to={'/featured'}><MenuItem>Featured</MenuItem></LinkContainer>
              <LinkContainer to={'/saved'}><MenuItem>Saved Posts</MenuItem></LinkContainer>
              <LinkContainer to={'/published'}><MenuItem>Published Posts</MenuItem></LinkContainer>
              <LinkContainer to={'/search'}><MenuItem>Search</MenuItem></LinkContainer>
              <LinkContainer to={'/newpost'}><MenuItem>Make a New Post!</MenuItem></LinkContainer>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
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
      </div>
    );
  }
}

export default App;
