import { Component, OnInit } from '@angular/core';
import { UsersService } from '../services/users.service';
import { Response } from '@angular/http';

import User from '../models/user.model';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MessageService } from '../services/message.service';
import { UtilService } from '../services/util.service'

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {

  usersList: User[];
  userLevel: Number = 0;
  response = null

  constructor(
    private authService : AuthService,
    private usersService : UsersService,
    private router : Router,
    private route : ActivatedRoute,
    private messenger : MessageService,
    private utils : UtilService
  ) { 
    this.response = this.messenger.getAndClear();
    console.log(utils.getDepartment('COM'))
  }

  ngOnInit(): void {
    this.userLevel = this.authService.getUserLevel();
    console.log(this.userLevel)
    
    console.log('getting users');
    this.usersService.getUsers()
      .subscribe(users => { 
        console.log(users)
        this.usersList = users.filter(user => user.status != 'disabled');
        this.formatDate();
      })
  }

  editProfile(userId:String) {
    this.router.navigate(['/user/'+userId]);
  }

  formatDate(): void {
    this.usersList.forEach(user => {
      user.createdString = new Date(user.created).toLocaleString();
    });
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

}
