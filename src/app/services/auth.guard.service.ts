import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { Location } from '@angular/common';
import { MessageService } from './message.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate{

  constructor( 
    private auth: AuthService,
    private router: Router,
    private location : Location,
    private messenger : MessageService
  ) { }

  canActivate(route: ActivatedRouteSnapshot): boolean {
    var notLogged : Boolean = this.auth.isLoggedOut();
    var mustNot : Boolean = route.data.mustNotBeLogged;
    if ( (notLogged && mustNot) || !(notLogged || mustNot) ){
      console.log('auth allowed')
      return true;
    }
    if(notLogged){
      console.log('not logged')  
      this.messenger.set({
        type : 'error',
        message : 'É preciso efetuar o login para acessar essa página'
      })
      this.router.navigate(['/login'])
    } else {
      console.log('must be logged') 
      this.messenger.set({
        type : 'error',
        message : 'É necessário encerrar a sua sessão para acessar essa página'
      })
      this.location.back();
    }
    return false;
  }
}
