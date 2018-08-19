import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { UsersService} from '../services/users.service'
import { ValidatePasswordMatch } from '../validate-password-match'

import { NavbarComponent } from '../navbar/navbar.component';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-complete-registration',
  templateUrl: './complete-registration.component.html',
  styleUrls: ['./complete-registration.component.scss']
})
export class CompleteRegistrationComponent implements OnInit {

  sendingRegister: Boolean = false;
  registerSent: Boolean = false;
  registerResponse: String;
  registerToken: String;

  registerForm : FormGroup;
  tokenIsValid : Boolean
  userEmail : String
  userId : String

  constructor( fb : FormBuilder,
              private userService: UsersService,
              private authService: AuthService,
              private router: Router,
              private route: ActivatedRoute,
            ) { 
    this.userEmail = ''

    this.registerForm = fb.group({
      'firstName' : ['Nome', Validators.required],
      'lastName': ['Sobrenome', Validators.required],
      'email' : 
      [
        this.userEmail, Validators.compose([
        Validators.pattern('.+@.+\\..+'),
        Validators.required
        ])
      ],
      'newPassword' : 
      [
        '1234',
        Validators.compose(
          [
            Validators.required,
            Validators.minLength(4)
          ])
      ],
      'confPassword' : 
      [
        '1234',
        Validators.compose(
          [
            Validators.required,
            Validators.minLength(4)
          ])
      ],
      'phone' : 
      [
        '12345678', Validators.compose
          ([
            Validators.pattern( '(\\+?\\d{2})?((\\(\\d{2}\\))||\\d{2})\\d{4,5}-?\\d{4}' ),
            Validators.required
          ])
      ],
    },
    {
      validator: ValidatePasswordMatch.MatchPassword
    }
    )}

  ngOnInit() {
    this.tokenIsValid = false
    this.registerToken = this.route.snapshot.paramMap.get('registerToken');
    console.log(this.registerToken)
    this.authService.verifyRegisterToken(this.registerToken)
        .subscribe(
          res =>
          {
            this.tokenIsValid=true
            this.userEmail = res['user'].email
            this.userId = res['user']._id
            this.registerForm.patchValue({
              email : this.userEmail
            })
            console.log(res['user'])
          }
          , err => {
          console.log(err);
          this.router.navigate(['/error', {type: 'Token Inválido', message: 'Token de cadastro inválido ou expirado'}]);
        });
  }

  registerUser(userForm : any): void {
    this.sendingRegister = true
    userForm.userId = this.userId
    this.userService.completeRegistration(this.registerToken, userForm).
    subscribe(res => {
      this.registerResponse = 'Usuário cadastrado com sucesso';
      this.registerSent = true;
      this.sendingRegister = false;
      this.clearFields();
    }, err => {
      console.log(err);
      this.registerResponse = err.error.message;
      this.registerSent = false;
      this.sendingRegister = false;
    });
  }

  clearFields(){
    this.registerForm.patchValue({
      firstName : null,
      lastName : null,
      phone : null,
      newPassword : null,
      confPassword : null
    });
    this.registerForm.markAsPristine();
    this.registerForm.markAsUntouched();
  }
}
