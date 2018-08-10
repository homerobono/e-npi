import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { UsersService } from '../services/users.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { ValidatePasswordMatch } from '../validate-password-match'
import User from '../models/user.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  profileForm : FormGroup
  passwordForm : FormGroup
  user : User
  userLevel : Number = 0
  
  profileSent: Boolean = false
  profileResponse: String
  sendingProfile: Boolean = false

  departments = [ 'Comercial',
    'Compras',
    'Engenharia de Produção',
    'Engenharia de Processos',
    'Financeiro',
    'P&D',
    'Produção',
    'R.H.' ]

  passwordSent: Boolean = false
  passwordResponse: String

 constructor( private fb : FormBuilder ,
              private userService: UsersService,
              private authService: AuthService,
              private router: Router
            ) {
    this.userLevel = authService.getUserLevel();
    console.log(authService.getUserLevel());

    this.profileForm = fb.group({
      'firstName' : [null, Validators.required],
      'lastName': [null, Validators.required],
      'email' : 
      [
        {value:null, disabled: this.userLevel<2 }, Validators.compose([
        Validators.pattern('.+@.+\\..+'),
        Validators.required
        ])
      ],
      'department' : [{value: 'Comercial', disabled: this.userLevel<2}, Validators.required],
      'phone' : 
      [
        null, Validators.compose
          ([
            Validators.pattern( '(\\+?\\d{2})?((\\(\\d{2}\\))||\\d{2})\\d{4,5}-?\\d{4}' ),
            Validators.required
          ])
      ],
      'level' : [{value: null, disabled: this.userLevel<2}, Validators.required],
    });
    this.passwordForm = fb.group({
      'password' : 
      [
        null,
        Validators.compose(
          [
            Validators.required,
            Validators.minLength(4)
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
    },
    {
      validator: ValidatePasswordMatch.MatchPassword
    }
    )}

  ngOnInit() {
    /*let session_token = localStorage.getItem('id_token');
    if (!session_token) this.router.navigate(['login']);
    this.authService.verifySessionToken().do(
      null,
      err => {this.router.navigate(['/login'])}
    );*/
    this.userService.getUser('').subscribe(
      res => { 
        this.user = res; 
        this.autoFillData();
      },
      err => { console.log(err) }
    );
  }

  autoFillData(){
    this.profileForm.setValue({
      firstName : this.user.firstName,
      lastName : this.user.lastName,
      email : this.user.email,
      phone : this.user.phone,
      department : this.user.department,
      level : this.user.level.toString(),
    }
    );
  }

  updateUser(profileForm) {
    this.sendingProfile = true;
    this.userService.updateUser(this.user._id, profileForm).
    subscribe(res => {
      console.log(res);
      this.profileResponse = "Perfil alterado com sucesso";
      this.profileSent = true;
      this.profileForm.markAsPristine();
      this.profileForm.markAsUntouched();
      this.sendingProfile = false;
    }, err => {
      this.profileResponse = err.error.message;
      this.profileSent = false;
      this.sendingProfile = false;
    }
    );
  }

  changePassword(passwordForm) {
    this.userService.updateUser(this.user._id, passwordForm).
    subscribe(res => {
      console.log('updated user password')
      console.log(res);
      this.passwordResponse = 'Senha alterada com sucesso'
      this.passwordSent = true;
      this.passwordForm.patchValue({
        password : null,
        newPassword : null,
        confPassword : null
      })
      this.passwordForm.markAsPristine()
      this.passwordForm.markAsUntouched()
    }, err => {
      console.log(err);
      if (err.error.message == "Wrong password")
      this.passwordResponse = 'Senha incorreta'
      this.passwordSent = false;
    }
    );
  }

}
