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
  userLevel: Number = 0;
  path: String

  constructor(
    private authService: AuthService, 
    private route: ActivatedRoute
  ) { 
    if (this.authService.isLoggedIn()) {
      this.userIsLogged = true;
      this.nameOfUser = authService.getFirstName();
      this.userLevel = authService.getUserLevel();
    }
    this.route.url.subscribe(res => {this.path = res[0].path})
  }

  ngOnInit() {
  }
  
  logout() {
    this.authService.logout();
  }

}
