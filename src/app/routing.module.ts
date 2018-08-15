import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { ProfileComponent } from './profile/profile.component';
import { UsersComponent } from './users/users.component';
import { UserComponent } from './user/user.component';
import { RegisterComponent } from './register/register.component';
import { ForgotComponent } from './forgot/forgot.component';
import { ResetComponent } from './reset/reset.component';
import { ErrorComponent } from './error/error.component';
import { NpiComponent } from './npi/npi.component';
import { CreateComponent } from './npi/create/create.component';

import { AuthGuardService as AuthGuard } from './services/auth.guard.service'
import { AccessGuardService as AccessGuard } from './services/access.guard.service'

const appRoutes: Routes = [
  { path: '', redirectTo : '/home', pathMatch : 'full' },
  { path: 'home',  component: HomeComponent, canActivate: [AuthGuard] },
  { 
    path: 'login',  component: LoginComponent,
    canActivate: 
    [
      AuthGuard,
    ],
    data: { mustNotBeLogged: true }
  },
  { path: 'profile',  component: ProfileComponent, canActivate: [AuthGuard] },
  { 
    path: 'users', 
    component: UsersComponent, 
    children: 
    [{ 
      path: ':userId', 
      redirectTo: '/user/:userId' 
    }],
    canActivate: 
    [
      AuthGuard,
      AccessGuard
    ],
    data: { allowedLevel: 1 }
  },
  { 
    path: 'user/:userId', component: UserComponent,
    canActivate: 
    [
      AuthGuard, 
      AccessGuard
    ],
    data: { allowedLevel: 1 }
  },
  {
    path: 'register', component: RegisterComponent,
    canActivate: 
    [
      AuthGuard, 
      AccessGuard
    ],
    data: { allowedLevel: 2 }
  },
  { 
    path: 'forgot', component: ForgotComponent ,
    canActivate: 
    [
      AuthGuard,
    ],
    data: { mustNotBeLogged: true }
  },
  { 
    path: 'reset/:resetToken', component: ResetComponent,
    canActivate: 
    [
      AuthGuard,
    ],
    data: { mustNotBeLogged: true }
  },
  { path: 'npis', redirectTo: '/home' },
  { path: 'npi/create', component: CreateComponent },
  { 
    path: 'npi',
    canActivate: [AuthGuard],
    children: 
    [{ 
      path: ':npiNumber', 
      component: NpiComponent,
    }], 
  },
  { path: 'error', component: ErrorComponent },
  { path: '**', redirectTo: '/home' }
];

@NgModule({  
  imports: [ RouterModule.forRoot(appRoutes) ],
  exports: [ RouterModule ],
})
export class RoutingModule { }
