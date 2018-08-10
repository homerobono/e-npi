import { Component, OnInit } from '@angular/core';
import { UsersService } from '../services/users.service';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MessageService } from '../services/message.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  userLevel : Number = 0
  response = null

  constructor( private usersService : UsersService,
               private router : Router,
               private authService : AuthService,
               private messenger : MessageService,
  ) { 
    this.response = this.messenger.getAndClear();
    this.userLevel = this.authService.getUserLevel();
  }

  ngOnInit() { }

}
