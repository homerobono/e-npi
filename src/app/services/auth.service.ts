import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Response } from '@angular/http';
import { JwtHelperService } from '@auth0/angular-jwt';

import 'rxjs/add/operator/do';
import 'rxjs/add/operator/shareReplay';

import { Globals } from 'config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
    api_url = Globals.ENPI_SERVER_URL;
    loginUrl = `${this.api_url}/login`;
    resetUrl = `${this.api_url}/reset/`;
    forgotUrl = `${this.api_url}/forgot/`;
    verifyResetTokenUrl = `${this.api_url}/reset/`;
    verifySessionTokenUrl = `${this.api_url}/`;

    jwtHelper = new JwtHelperService()
 
  constructor(
    private http: HttpClient,
  ){ }
    
  login(email:string, password:string ) {
    console.log('service: trying to login');
    return this.http.post <{message, token}>(this.loginUrl, {email: email, password: password})
    .do( res => { this.setSession(res.token) })
    .shareReplay();
}

  private setSession( sessionToken ) {
    const tokenPayload = this.jwtHelper.decodeToken(sessionToken);
    localStorage.setItem('id_token', sessionToken);
    localStorage.setItem('first_name', tokenPayload.data.firstName);
    localStorage.setItem('user_level', tokenPayload.data.level);
    localStorage.setItem("expires_at", tokenPayload.exp);
  }          

  logout() {
      localStorage.removeItem("id_token");
      localStorage.removeItem("first_ame");
      localStorage.removeItem("user_level");
      localStorage.removeItem("expires_at");
      console.log('user logged out')
  }

  public isLoggedIn() {
    return !this.jwtHelper.isTokenExpired(this.getToken());
  }

  isLoggedOut() {
      return !this.isLoggedIn();
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

  verifyResetToken(token: String){
    console.log(token)
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