import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { UsersService} from '../../services/users.service'
import { ValidatePasswordMatch } from '../../validate-password-match'

import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MessageService } from '../../services/message.service';
import User from '../../models/user.model';

@Component({
  selector: 'app-complete-registration',
  templateUrl: './complete-registration.component.html',
  styleUrls: ['./complete-registration.component.scss']
})
export class CompleteRegistrationComponent implements OnInit {

  sendingRegister: Boolean = false;
  registerSent: Boolean = false;
  registerToken: String;

  completeForm : FormGroup;
  tokenIsValid : Boolean
  user: User

  constructor( fb : FormBuilder,
              private userService: UsersService,
              private authService: AuthService,
              private router: Router,
              private route: ActivatedRoute,
              private messenger: MessageService
            ) { 
    this.completeForm = fb.group({
      'firstName' : [null, Validators.required],
      'lastName': [null, Validators.required],
      'email' : 
      [
        null, Validators.compose([
        Validators.email,
        Validators.required
        ])
      ],
      'newPassword' : 
      [
        null,
        Validators.compose(
          [
            Validators.required,
            Validators.minLength(4)
          ])
      ],
      'confPassword' : 
      [
        null,
        Validators.compose(
          [
            Validators.required,
            Validators.minLength(4),
          ])
      ],
      'phone' : 
      [
        null, Validators.compose
          ([
            Validators.pattern( '(\\+?\\d{2})?((\\(\\d{2}\\))||\\d{2})\\d{4,5}-?\\d{4}' ),
            Validators.required
          ])
      ],
    },
    {
      validator: ValidatePasswordMatch.MatchPassword
    }
    )
    this.user = new User()
  }

  ngOnInit() {
    this.tokenIsValid = false
    this.registerToken = this.route.snapshot.paramMap.get('registerToken');
    console.log(this.registerToken)
    this.authService.verifyRegisterToken(this.registerToken)
        .subscribe(
          res =>
          {
            this.tokenIsValid=true
            this.user = res['user']
            this.fillForm()
            console.log(res['user'])
          }
          , err => {
            console.log(err);
            this.messenger.set({
              type: 'error',
              head: 'Token Inválido', 
              message: 'Token de cadastro inválido ou expirado',
              log: err.error.message
            });
            this.router.navigate(['/error'])
        });
  }

  fillForm() {
    this.completeForm.patchValue({
      email : this.user.email,
    })
  }

  registerUser(userForm : any): void {
    this.sendingRegister = true
    userForm.userId = this.user._id
    this.userService.completeRegistration(this.registerToken, userForm).
    subscribe(() => {
      this.messenger.set(
        {
          type: 'success',
          message:'Seus dados foram registrados com sucesso. Entre com seu e-mail e senha para efetuar o login.'
        }
      )
      this.router.navigateByUrl('/login')
      this.registerSent = true;
      this.sendingRegister = false;
      this.clearFields();
    }, err => {
      console.log(err);
      this.messenger.set(
        {
          type: 'error',
          message: err.error.message,
          log: err.error.message
        }
      )
      this.registerSent = false;
      this.sendingRegister = false;
    });
  }

  clearFields(){
    this.completeForm.patchValue({
      firstName : null,
      lastName : null,
      phone : null,
      newPassword : null,
      confPassword : null
    });
    this.completeForm.markAsPristine();
    this.completeForm.markAsUntouched();
  }

  isFieldValid(controlName){
    return (!(
      this.completeForm.controls[controlName].invalid &&
      this.completeForm.controls[controlName].touched &&
      this.completeForm.controls[controlName].dirty &&
      !this.completeForm.controls[controlName].pending
    ))
  }
}

function ageRangeValidator(confPass: String): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } | null => {
      if (control.value !== undefined && (isNaN(control.value) || control.value == confPass)) {
          return { 'confPassword': true };
      }
      return null;
  };
}