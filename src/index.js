import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { Router, Route, IndexRoute, hashHistory } from 'react-router';
import firebase from "firebase";

import Login, {Join} from "./Login";
import Featured from "./Featured";
import IndividualPost from "./IndividualPost";
import NewPost from "./NewPost";
import Search from "./Search";
import Saved from "./Saved";
import Published from "./Published";

//load CSS files
import "bootstrap/dist/css/bootstrap.css";
import "./index.css";

// Initialize Firebase
var config = {
  apiKey: "AIzaSyATJwYOtM3TJJsf6e7UE5Kz3B8T53i2guc",
  authDomain: "our-awesome-343-project.firebaseapp.com",
  databaseURL: "https://our-awesome-343-project.firebaseio.com",
  storageBucket: "our-awesome-343-project.appspot.com",
  messagingSenderId: "133142778137"
};
firebase.initializeApp(config);


ReactDOM.render(
  <Router history={hashHistory}>
    <Route path="/" component={App} >
      <IndexRoute component={Featured} />
      <Route path="login" component={Login} />
      <Route path="join" component={Join} />
      <Route path="featured" component={Featured} />
      <Route path="post" component={IndividualPost} >
        <Route path=":post" component={IndividualPost} />
      </Route>
      <Route path="search" component={Search} />
      <Route path="saved" component={Saved} />
      <Route path="newpost" component={NewPost} />
      <Route path="published" component={Published} />
    </Route>
  </Router>,
  document.getElementById('root')
);
