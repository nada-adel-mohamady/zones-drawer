import 'bootstrap/dist/css/bootstrap.css';
import '../App.css'
import React from "react";
import { Navigate} from "react-router-dom";
import { Button, Form, FormGroup, Input, Label,Modal} from 'reactstrap';
import axios from 'axios';

const serverURL = "https://zones-backend-halan.herokuapp.com​";

export class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        username: '',
        password: '',
        ErrorMsg: '',
        Auth:false
    }

    this.style = {
      color: 'red',
      fontSize: 15
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    this.setState({ [e.target.name] : e.target.value });
  };

  async handleSubmit(event){
    event.preventDefault();
    
    axios.post(serverURL + '/login',{
        username: this.state.username,
        password: this.state.password
    })
    .then(response => {  
      console.log(response.data['token']);
      console.log(response.data);
      if(response.data['message']=='Auth sucessful'){
        window.localStorage.setItem('token', response.data['token']);
        this.setState({Auth: true})
      } 
    })
    .catch(error=> {
      console.log(error);
      this.setState({ErrorMsg: 'username or password is wrong, please try again'});
    });
  };

  render() {
    if(this.state.Auth==true){
      return <Navigate to="/map"/>
    }
    return (
      <div>
        <Modal isOpen>
          <Form id="login" onSubmit={this.handleSubmit}>
            <FormGroup>
                <Label htmlFor="username">Username</Label>
                <Input type="text" name="username"
                    value={this.state.username}
                    onChange={this.handleChange} />
            </FormGroup>
            <FormGroup>
                <Label htmlFor="password">Password</Label>
                <Input type="password" name="password"
                  value={this.state.password}
                  onChange={this.handleChange}  />
            </FormGroup>
            <FormGroup>
                {this.state.ErrorMsg.length > 0 && <span style={this.style}>{this.state.ErrorMsg}</span>}
            </FormGroup>
            <Button type="submit" value="submit" color="primary">Login</Button>
        </Form> 
        </Modal>
      </div>
         
    );
  }
}

export default Login;
