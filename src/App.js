import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import {Router, Route, browserHistory} from 'react-router';

class App extends Component {
  render() {
    return (
      <div>
        <header role="banner" className="container">
          <h1>Our Awesome Website</h1>
        </header>
        <div className="container" role="region">
          {this.props.children}
        </div>
      </div>
    );
  }
}

export default App;
