import { Component, OnInit } from '@angular/core';
import { OktaAuthService } from '@okta/okta-angular';

@Component({
  selector: 'app-login-status',
  templateUrl: './login-status.component.html',
  styleUrls: ['./login-status.component.css']
})
export class LoginStatusComponent implements OnInit {

  isAuthenticated: boolean =false;
  userFullName: string;
  storage: Storage = sessionStorage;

  constructor(private oktaAuthService: OktaAuthService) { }

  ngOnInit(): void {
    //TODO Subscribe to the authentication state changes
    this.oktaAuthService.$authenticationState.subscribe(
      (result) => {
        this.isAuthenticated = result;
        this.getUserDetails();
      })
  }
  getUserDetails() {
    if(this.isAuthenticated){
      //TODO Fetch the logged in user details (user's claims)
            //TODO  user full name is expose as a property name
      this.oktaAuthService.getUser().then(
        (response) =>{
          this.userFullName = response.name;

          //TODO retrieve the user's email from  authentification response 
          const theEmail = response.email;
          
          //TODO now storage the email in browser storage 
          this.storage.setItem('userEmail',JSON.stringify(theEmail));
        }
      )
    }
  }

  logout(){
    //TODO Terminates the sesion with okta and removes current tokens
    this.oktaAuthService.signOut();
  }

}
