import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { UsersService} from '../services/users.service'
import { ValidatePasswordMatch } from '../validate-password-match'

import { NavbarComponent } from '../navbar/navbar.component';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MessageService } from '../services/message.service';
import { Globals } from 'config';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})

export class RegisterComponent implements OnInit {
  
  sendingRegister: Boolean = false;
  registerSent: Boolean = false;
  triedToSubmit = false

  registerForm : FormGroup;
  departments = [{value:null, label:null}].concat(Globals.DEPARTMENTS)

  constructor( fb : FormBuilder,
              private userService: UsersService,
              private authService: AuthService,
              private router: Router,
              private messenger: MessageService
            ) { 
    this.registerForm = fb.group({
      'email' : 
      [
        null, Validators.compose([
        Validators.email,
        Validators.required
        ])
      ],
      'department' : [null, Validators.required],
      'level' : ['0'],
    },
    )}

  ngOnInit() {}

  registerUser(userForm : any): void {
    this.triedToSubmit = true
    this.sendingRegister = true
    this.registerForm.disable()
    this.userService.registerPendingUser(userForm).
    subscribe(res => {
      this.triedToSubmit = false
      this.messenger.set(
        {
          type: 'success',
          message: 'Usuário cadastrado com sucesso'
        }
      )
      this.registerSent = true;
      this.sendingRegister = false;
      this.clearFields();
      this.registerForm.enable()
      document.getElementById('email').focus()
    }, err => {
      console.log(err);
      if ((err.error.message).includes("email")) {
        this.messenger.set(
          {
            type: 'error',
            message: "Já existe uma conta cadastrada com o e-mail " + 
              this.registerForm.get('email').value + "."
          })
        this.registerForm.controls['email'].setErrors({notUnique: true})
      }
      else {
        this.messenger.set(
          {
            type: 'error',
            message: err.error.message
          })
      }
      this.triedToSubmit = false
      this.registerSent = false;
      this.sendingRegister = false;
      this.registerForm.enable()
    }
    );
  }

  clearFields(){
    this.registerForm.patchValue({
      email : null,
      department : 'Comercial',
      level: '0'
    });
    this.registerForm.markAsPristine();
    this.registerForm.markAsUntouched();
  }

  isFieldValid(controlName){
    return (!(
      this.registerForm.controls[controlName].invalid &&
      this.registerForm.controls[controlName].touched &&
      this.registerForm.controls[controlName].dirty &&
      !this.registerForm.controls[controlName].pending
    ))
  }
}
