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
  path: String

  constructor(
    private authService: AuthService, 
    private route: ActivatedRoute
  ) { 
    console.log('navbar was constructed')
    this.userIsLogged = this.authService.isLoggedIn()
    this.authService.isLoggedStatus.subscribe(
      status => 
      {
        this.userIsLogged = status 
        if (this.userIsLogged) {
          console.log('logged')
          //this.userIsLogged = true;
          this.nameOfUser = authService.getFirstName();
          this.userLevel = authService.getUserLevel();
        } else 
          console.log('logged out')
      },
      error => console.log('ooops :(')
    )
    this.route.url.subscribe(res => {this.path = res[0].path})
  }

  ngOnInit() {
  }
  
  logout() {
    this.authService.logout();
  }

}
