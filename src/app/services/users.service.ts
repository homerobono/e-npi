import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { Globals } from 'config';

import User from '../models/user.model';
import 'rxjs/add/operator/map';

@Injectable({
  providedIn: 'root'
})

export class UsersService {
  api_url = Globals.ENPI_SERVER_URL
  usersUrl = `${this.api_url}/users`;
  userUrl = `${this.api_url}/user/`;
  registerPendingUserUrl = `${this.api_url}/users/register`;
  completeRegistrationUrl = `${this.api_url}/complete-registration/`;

  constructor(private http: HttpClient) { }

  getUser(userId: String): Observable<User> {
    return this.http.get(this.userUrl + userId)
      .map(res => this.capitalizeUserName(res as User))
      .shareReplay();
  }

  getUsers(): Observable<User[]> {
    return this.http.get(this.usersUrl)
      .map(res => (res['data'] as User[]).map(user => this.capitalizeUserName(user)))
      .shareReplay();
  }

  registerPendingUser(user: User): Observable<any> {
    console.log('registering user');
    console.log(user);
    return this.http.post(this.registerPendingUserUrl, user);
  }

  reSendRegisterToken(userId: String): Observable<any> {
    console.log('registering user');
    return this.http.put(this.registerPendingUserUrl, { userId });
  }

  completeRegistration(registerToken: String, user: User): Observable<any> {
    console.log('completing user registration');
    return this.http.put(this.completeRegistrationUrl + registerToken, user);
  }

  updateUser(userId, user: User): Observable<any> {
    console.log('updating user');
    return this.http.put(this.usersUrl, { userId, user });
  }

  deleteUser(userId: String): Observable<any> {
    console.log('deleting user');
    return this.http.delete(this.usersUrl + '/' + userId);
  }

  capitalizeUserName(user: User) {
    if (user.firstName) {
      let subnames = user.firstName.split(' ')
      user.firstName = ''
      for (let i = 0; i < subnames.length; i++) {
        user.firstName += (i == 0 ? '' : ' ') + subnames[i].charAt(0).toUpperCase() + subnames[i].slice(1).toLowerCase()
      }
    }
    if (user.lastName) {
      let subnames = user.lastName.split(' ')
      user.lastName = ''
      for (let i = 0; i < subnames.length; i++) {
        user.lastName += (i == 0 ? '' : ' ') + subnames[i].charAt(0).toUpperCase() + subnames[i].slice(1).toLowerCase()
      }
    }
    return user
  }
}
