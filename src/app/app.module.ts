import { BrowserModule } from '@angular/platform-browser';
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { DatepickerModule, BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { JwtModule } from '@auth0/angular-jwt';
import { TextMaskModule } from 'angular2-text-mask';
import { FileUploadModule } from 'ng2-file-upload/ng2-file-upload';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { AuthService } from './services/auth.service';
import { AuthInterceptor } from './services/auth.interceptor';
import { UsersComponent } from './users/users.component';
import { UsersService } from './services/users.service';
import { RegisterComponent } from './register/register.component';
import { ResetComponent } from './reset/reset.component';
import { NavbarComponent } from './navbar/navbar.component';
import { ProfileComponent } from './profile/profile.component';
import { UserComponent } from './user/user.component';
import { ErrorComponent } from './error/error.component';
import { HomeComponent } from './home/home.component';
import { ForgotComponent } from './forgot/forgot.component';
import { NavButtonsComponent } from './nav-buttons/nav-buttons.component';
import { RoutingModule } from './routing.module';
import { MessageService } from './services/message.service';
import { NpiService } from './services/npi.service';
import { CreateComponent } from './npi/create/create.component';
import { NpiComponent } from './npi/npi.component';
import { AlertComponent } from './alert/alert.component';
import { CompleteRegistrationComponent } from './complete-registration/complete-registration.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    UsersComponent,
    RegisterComponent,
    CompleteRegistrationComponent,
    ResetComponent,
    NavbarComponent,
    ProfileComponent,
    HomeComponent,
    ErrorComponent,
    ForgotComponent,
    UserComponent,
    NavButtonsComponent,
    CreateComponent,
    NpiComponent,
    AlertComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule, 
    ReactiveFormsModule,
    BrowserModule, BrowserAnimationsModule,
    RoutingModule, 
    JwtModule,
    TextMaskModule,
    DatepickerModule.forRoot(),
    BsDatepickerModule.forRoot(),
    FileUploadModule
  ],
  providers: [
    UsersService,
    AuthService,
    NpiService,
    MessageService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
  ],
  schemas: [ NO_ERRORS_SCHEMA ],
  bootstrap: [AppComponent]
})
export class AppModule { }
