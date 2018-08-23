import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})

export class AccessGuardService implements CanActivate{

  constructor( 
    public auth: AuthService,
    public router: Router,
  ) { }

  canActivate(route: ActivatedRouteSnapshot): boolean {
    //console.log('verifying');
    let userLevel = this.auth.getUserLevel();
    if (userLevel >= route.data.allowedLevel){
      //console.log('allowed');
      return true;
    }
    //console.log('not allowed');
    this.router.navigate([
      '/error', 
      {
        type:'Nível de acesso', 
        message:'Usuário não nível de permissão para realizar a operação'
      }
    ])
    return true;
  }
}