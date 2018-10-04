import { BrowserModule } from '@angular/platform-browser';
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { DatepickerModule, BsDatepickerModule, ModalModule } from 'ngx-bootstrap';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { JwtModule } from '@auth0/angular-jwt';
import { TextMaskModule } from 'angular2-text-mask';
import { ClickOutsideModule } from 'ng4-click-outside';
import { PaginationModule } from 'ngx-bootstrap';

import { RoutingModule } from './routing.module';
import { FileManagerModule } from './file-manager/file-manager.module'

import { MessageService } from './services/message.service';
import { NpiService } from './services/npi.service';
import { UtilService } from './services/util.service';
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
import { CreateComponent } from './npi/create/create.component';
import { NpiComponent } from './npi/npi.component';
import { OemComponent } from './npi/oem/oem.component';
import { InternalComponent } from './npi/internal/internal.component';
import { CustomComponent } from './npi/custom/custom.component';
import { PixelComponent } from './npi/pixel/pixel.component';
import { CriticalComponent } from './npi/critical/critical.component';
import { ClientComponent } from './npi/oem/client/client.component';
import { ActivitiesComponent } from './npi/activities/activities.component';
import { NpiChooserModalComponent } from './npi/npi-chooser-modal/npi-chooser-modal.component';
import { ValidateComponent } from './npi/validate/validate.component';
import { AlertComponent } from './alert/alert.component';
import { CompleteRegistrationComponent } from './complete-registration/complete-registration.component';
import { FileManagerComponent } from './file-manager/file-manager.component';
import { SendingFormModalComponent } from './npi/sending-form-modal/sending-form-modal.component';
import { UploaderComponent } from './file-manager/uploader/uploader.component';
import { UploadService } from './services/upload.service';
import { BlinkDirective } from './blink.directive';
import { ActivityRowDirective } from './app-activity-row.directive';

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
    OemComponent,
    PixelComponent,
    CustomComponent,
    InternalComponent,
    AlertComponent,
    CriticalComponent,
    ActivitiesComponent,
    NpiChooserModalComponent,
    ValidateComponent,
    ClientComponent,
    SendingFormModalComponent,
    BlinkDirective,
    ActivityRowDirective
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule, 
    ReactiveFormsModule,
    BrowserModule, BrowserAnimationsModule,
    ModalModule.forRoot(),
    JwtModule,
    TextMaskModule,
    DatepickerModule.forRoot(),
    BsDatepickerModule.forRoot(),
    ClickOutsideModule,
    PaginationModule.forRoot(),
    RoutingModule,
    FileManagerModule
  ],
  providers: [
    UsersService,
    AuthService,
    NpiService,
    MessageService,
    UtilService,
    UploadService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
  ],
  schemas: [ NO_ERRORS_SCHEMA ],
  bootstrap: [AppComponent],
  entryComponents: [
    FileManagerComponent, 
    NpiChooserModalComponent,
    UploaderComponent,
    SendingFormModalComponent
  ]
})
export class AppModule { }
