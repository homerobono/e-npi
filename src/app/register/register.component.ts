import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { UsersService} from '../services/users.service'
import { ValidatePasswordMatch } from '../validate-password-match'

import { NavbarComponent } from '../navbar/navbar.component';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})

export class RegisterComponent implements OnInit {
  
  sendingRegister: Boolean = false;
  registerSent: Boolean = false;
  registerResponse: String;

  registerForm : FormGroup;
  departments = [ 'Comercial',
    'Compras',
    'Engenharia de Produção',
    'Engenharia de Processos',
    'Financeiro',
    'P&D',
    'Produção',
    'R.H.' ]

  constructor( fb : FormBuilder,
              private userService: UsersService,
              private authService: AuthService,
              private router: Router
            ) { 
    this.registerForm = fb.group({
      'firstName' : [null, Validators.required],
      'lastName': [null, Validators.required],
      'email' : 
      [
        null, Validators.compose([
        Validators.pattern('.+@.+\\..+'),
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
            Validators.minLength(4)
          ])
      ],
      'department' : [ 'Comercial', Validators.required],
      'phone' : 
      [
        null, Validators.compose
          ([
            Validators.pattern( '(\\+?\\d{2})?((\\(\\d{2}\\))||\\d{2})\\d{4,5}-?\\d{4}' ),
            Validators.required
          ])
      ],
      'level' : ['0', Validators.required],
    },
    {
      validator: ValidatePasswordMatch.MatchPassword
    }
    )}

  ngOnInit() {
    let session_token = localStorage.getItem('id_token');
    if (!session_token) this.router.navigate(['login']);
    this.authService.verifySessionToken().do(
      null,
      err => {this.router.navigate(['/login'])}
    );
    if (parseInt(localStorage.getItem('userLevel')) < 2)
      this.router.navigate(['/error', {type:'Nível de permissão', 
      message:'Usuário não tem permissão para realizar a operação'}]);
  }

  registerUser(userForm : any): void {
    this.sendingRegister = true
    this.userService.registerUser(userForm).
    subscribe(res => {
      this.registerResponse = 'Usuário cadastrado com sucesso';
      this.registerSent = true;
      this.sendingRegister = false;
      this.clearFields();
    }, err => {
      console.log(err);
      if ((err.error.message).includes("Error, expected `email` to be unique."))
        this.registerResponse = "Já existe uma conta cadastrada com e-mail " +
        this.registerForm.get('email').value + "."
      else
        this.registerResponse = err.error.message;
      this.registerSent = false;
      this.sendingRegister = false;
    });
  }

  clearFields(){
    this.registerForm.patchValue({
      firstName : null,
      lastName : null,
      email : null,
      phone : null,
      department : 'Comercial',
      newPassword : null,
      confPassword : null,
      level: '0'
    });
    this.registerForm.markAsPristine();
    this.registerForm.markAsUntouched();
  }
}
