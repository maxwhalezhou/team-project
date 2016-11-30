import React from "react";
import { hashHistory, Link } from "react-router";
import firebase from "firebase";

class Login extends React.Component {
   constructor(props){
    super(props);
    //variables for login information
    //error tells whether sign in was successfull or if the user needs to sign in again
    this.state = {
      'email': '',
      'password': '',
      'error': false
    }; 

    //function binding
    this.handleChange = this.handleChange.bind(this);
  }
    componentDidMount() {
    /* Add a listener and callback for authentication events */
  
    var unregister = firebase.auth().onAuthStateChanged(user => {
      //if they are logged in it pushes to channel component
      if(user) {
        unregister();
        console.log('Auth state changed: logged in as', user.email);
        hashHistory.push('/featured');
      }
      else{
        console.log('Auth state changed: logged out');
      }
    })
   }

   //sets the value of password and email sets them when the input field values change
   //got this from lecture12
   handleChange(event) {
    var field = event.target.name;
    var value = event.target.value;

    var changes = {}; //object to hold changes
    changes[field] = value; //change this field
    this.setState(changes); //update state
  }
  signIn(event) {
    /* Sign in the user */
    event.preventDefault();
    firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password)
      .catch(err => this.setState({'error':true})); //Incorrect email or password
  }
  //checks for valid password
  validatePassword(password){
    return !(password.length <6);
  }
  //checks for valid email
  validateEmail(email){
    //https://www.w3.org/TR/html-markup/input.email.html#input.email.attrs.value.single
    var valid = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email)
    return (valid);
  }

  render(){
    //variables for validated inputs
    var emailErrors = this.validateEmail(this.state.email);
    var passwordErrors = this.validatePassword(this.state.password);
    //flag for signin button to be enabled or disabled
    var signInEnabled = (emailErrors && passwordErrors);
    return(
      <div className="container">
        <h2>Sign In</h2>
        <form role="form">
          <div className="form-group">
            <label className="control-label" >Email</label>
            <input className="form-control" onChange={this.handleChange} type="text" name="email" />
             {!emailErrors &&
              <p className="help-block">Needs a valid email address.</p>  
            }
          </div>
          <div className="form-group">
            <label className="control-label">Password</label>
            <input className="form-control" onChange={this.handleChange} type="password" name="password"/>
             {!passwordErrors &&
              <p className="help-block">Needs to be at least 6 characters.</p>  
            }
          </div>
          {this.state.error && <p className="help-block">Incorrent email or password</p> } 
          <button className="btn btn-default" disabled={!signInEnabled} onClick={(e) => this.signIn(e)}>Sign-In</button>
        </form>
        <p className="small help-block">New user? Click <Link to="/join">here</Link> to sign up!</p>
       
      </div>
    )
  }
}

class Join extends React.Component {
   constructor(props){
    super(props);

    //variables for creating a new user
    this.state = {
      'email': '',
      'password': '',
      'passwordConf': '',
      'handle': '',
      'avatar':''
    }; 

    //function binding
    this.handleChange = this.handleChange.bind(this);
  }

   componentDidMount() {
    /* Add a listener and callback for authentication events */
    var unregister = firebase.auth().onAuthStateChanged(user => {
      if(user) {
        unregister();
        console.log('Auth state changed: logged in as', user.email);
        hashHistory.push('/featured');
      }
      else{
        console.log('Auth state changed: logged out');
      }
    })
  }
   handleChange(event) {
    var field = event.target.name;
    var value = event.target.value;

    var changes = {}; //object to hold changes
    changes[field] = value; //change this field
    this.setState(changes); //update state
  }
  
 signUp(event) {
    /* Create a new user and save their information */
    event.preventDefault();
    firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password)
      .then((firebaseUser) => {
        console.log('user created: '+firebaseUser.uid);
        //setting some user data
        var userData = {
          displayName: this.state.handle,
        }
        var profilePromise = firebaseUser.updateProfile(userData);
        return profilePromise;
      })
      .catch(function(error) { //report any errors--useful!
        console.log(error);
      });
  }

//got most of validating ideas/methods from lecture12
  //checks if password is greater than or equal to 6
  validatePassword(password){
    return !(password.length <6);
  }
  //Checks if the Confirmation password and the original are the same
  validatePasswords(pass, pass2 ){
    return (pass === pass2);
  }
  //checks for a handle greater than 0
  validateHandle(handle){
    return (handle.length >0);
  }
  //checks for a  valid email
  validateEmail(email){
    //https://www.w3.org/TR/html-markup/input.email.html#input.email.attrs.value.single
    var valid = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email)
    return (valid);
  }
  render(){
    //validated input values
    var emailErrors = this.validateEmail(this.state.email);
    var passwordErrors = this.validatePassword(this.state.password);
    var passwordConfErrors = this.validatePasswords(this.state.password, this.state.passwordConf);
    var handleErrors = this.validateHandle(this.state.handle);
    //flag for signin button to be enabled or disabled
    var signUpEnabled = (emailErrors && passwordErrors && handleErrors && passwordConfErrors);
    return(
      <div className='container'>
        <h2>Join Us</h2>
        <form  role="form">
          <div className="form-group">
            <label className="control-label" >Email</label>
            <input className="form-control" type="text" onChange={this.handleChange} name="email" />
            {!emailErrors &&
              <p className="help-block">Needs a valid email address.</p>  
            }
          </div>
          <div className="form-group">
            <label className="control-label">Password</label>
            <input className="form-control" type="password" onChange={this.handleChange} name="password"/>
            {!passwordErrors &&
              <p className="help-block">Needs to be at least 6 characters.</p>  
            }
          </div>
          <div className="form-group">
            <label className="control-label">Password Confirmation</label>
            <input className="form-control" type="password" onChange={this.handleChange} name="passwordConf"/>
            {!passwordConfErrors &&
              <p className="help-block">Must match the password.</p>  
            }
          </div>
          <div className="form-group">
            <label className="control-label">Handle</label>
            <input className="form-control" type="text" onChange={this.handleChange} name="handle" />
            {!handleErrors &&
              <p className="help-block">Must have some characters.</p>  
            }
          </div>
          <button className="btn btn-default"   disabled={!signUpEnabled} onClick={(e) => this.signUp(e)}>Sign-up</button>
        </form>
        <p className="small help-block">Already a user? Click <Link to="/login">here</Link> to login!</p>
       </div> 
    );
  }
}
export {Join};
export default Login;
