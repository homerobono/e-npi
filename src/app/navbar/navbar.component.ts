import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  
  nameOfUser: String;
  userIsLogged: Boolean = false;
  userLevel: Number;
  path: String;
  user

  constructor(
    private authService: AuthService, 
    private route: ActivatedRoute
  ) { 
    this.userIsLogged = this.authService.isLoggedIn()
    this.authService.isLoggedStatus.subscribe(
      status => 
      {
        this.userIsLogged = status 
        if (this.userIsLogged) {
          //this.userIsLogged = true;
          this.nameOfUser = authService.getFirstName();
          this.userLevel = authService.getUserLevel();
          this.user = authService.getUser()
          console.log(this.user)
        } else 
          console.log('logged out')
      },
      error => console.log('navbar constructor error: ' + error)
    )
    this.route.url.subscribe(res => {this.path = res[0].path})
  }

  ngOnInit() {
  }
  
  logout() {
    this.authService.logout();
  }

}
