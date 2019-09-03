import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs/Rx';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Response } from '@angular/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '../../environments/environment'

import 'rxjs/add/operator/do';
import 'rxjs/add/operator/shareReplay';

import { Globals } from 'config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

    api_url = environment.enpiServerUrl;
    loginUrl = `${this.api_url}/login`;
    resetUrl = `${this.api_url}/reset/`;
    forgotUrl = `${this.api_url}/forgot/`;
    verifyRegisterTokenUrl = `${this.api_url}/complete-registration/`;
    verifyResetTokenUrl = `${this.api_url}/reset/`;
    verifySessionTokenUrl = `${this.api_url}/`;

    isLoggedStatus: BehaviorSubject<Boolean>

    jwtHelper = new JwtHelperService()
 
  constructor(
    private http: HttpClient,
  ){ 
    this.isLoggedStatus = new BehaviorSubject(false)
    this.isLoggedStatus.next(this.isLoggedIn())
  }
    
  login(email:string, password:string ) {
    //console.log('service: trying to login');
    return this.http.post <{message, token}>
      (this.loginUrl, {email: email, password: password})
      .do( res => this.setSession(res.token))
      .shareReplay();
}

  private setSession( sessionToken ) {
    //console.log(sessionToken)
    const tokenPayload = this.jwtHelper.decodeToken(sessionToken);
    localStorage.setItem('id_token', sessionToken);
    localStorage.setItem('first_name', tokenPayload.data.firstName);
    localStorage.setItem('user_level', tokenPayload.data.level);
    localStorage.setItem("expires_at", tokenPayload.exp);
    this.isLoggedStatus.next(true)
  }          

  logout() {
      localStorage.removeItem("id_token");
      localStorage.removeItem("first_name");
      localStorage.removeItem("user_level");
      localStorage.removeItem("expires_at");
      this.isLoggedStatus.next(false)
      //console.log('user logged out')
  }

  public isLoggedIn() {
    return !this.jwtHelper.isTokenExpired(this.getToken());
  }

  isLoggedOut() {
      return !this.isLoggedIn();
  }

  getUser() {
    return this.jwtHelper.decodeToken(this.getToken()).data
  }
  
  getToken() {
    return localStorage.getItem("id_token");
  }    

  getExpiration() {
      return localStorage.getItem("expires_at");
  }    

  getUserLevel() {
    return parseInt(localStorage.getItem("user_level"));
  }

  getFirstName() {
    return localStorage.getItem("first_name");
  }
  
  verifyRegisterToken(token: String){
    //console.log(token)
    return this.http.get(this.verifyRegisterTokenUrl+token);
  }

  verifyResetToken(token: String){
    //console.log(token)
    return this.http.get(this.verifyResetTokenUrl+token);
  }

  verifySessionToken(){
    return this.http.get(this.verifySessionTokenUrl);
  }

  resetPassword(token: String, resetFormData){
    return this.http.post(this.resetUrl+token, { password : resetFormData.newPassword});
  }

  sendToken(email){
    return this.http.get(this.forgotUrl+email);
  }

}
