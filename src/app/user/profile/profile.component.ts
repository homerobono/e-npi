import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { UsersService } from '../../services/users.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ValidatePasswordMatch } from '../../validate-password-match'
import User from '../../models/user.model';
import { Globals } from 'config';
import { MessageService } from '../../services/message.service';

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

  departments = Globals.DEPARTMENTS

  passwordSent: Boolean = false
  passwordResponse: String

 constructor( private fb : FormBuilder ,
              private userService: UsersService,
              private authService: AuthService,
              private router: Router,
              private messenger: MessageService
            ) {
    this.userLevel = authService.getUserLevel();
    console.log(authService.getUserLevel());

    this.profileForm = fb.group({
      'firstName' : [null, Validators.required],
      'lastName': [null, Validators.required],
      'email' : 
      [
        { value:null, disabled: true }, 
        Validators.compose([
          Validators.email,
          Validators.required
        ])
      ],
      'department' : [{value: null, disabled: this.userLevel<2}, Validators.required],
      'phone' : 
      [
        null, Validators.compose
          ([
            Validators.pattern( '(\\+?\\d{2})?((\\(\\d{2}\\))||\\d{2})\\d{4,5}-?\\d{4}' ),
            Validators.required
          ])
      ],
      'notify' : null,
      'level' : [{value: null, disabled: this.userLevel<2}, Validators.required],
    });
    
    this.passwordForm = fb.group({
      'password' : 
      [
        null,
        Validators.compose(
          [
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
    },
    {
      validator: ValidatePasswordMatch.MatchPassword
    }
    )}

  ngOnInit() {
    this.getMyProfile()
  }

  getMyProfile() {
    this.userService.getUser('').subscribe(
      res => { 
        this.user = res;
        if (this.user.email == 'admin') 
          this.profileForm.disable()
        else 
          this.autoFillData();
      },
      err => { console.log(err) }
    );
  }

  autoFillData(){
    this.profileForm.setValue({
      firstName : this.user.firstName,
      lastName : this.user.lastName ? this.user.lastName : null,
      email : this.user.email,
      phone : this.user.phone ? this.user.phone : null,
      department : this.user.department,
      notify : this.user.notify,
      level : this.user.level.toString(),
    }
    );
  }

  updateUser(profileForm) {
    if (this.profileForm.invalid) {
      this.messenger.set({
        type: 'error',
        message: 'Preencha todos os campos antes de salvar as alterações'
      })
      return
    }
    this.sendingProfile = true;
    console.log('updating user')
    this.userService.updateUser(this.user._id, profileForm).
    subscribe(res => {
      console.log(res);
      this.getMyProfile()
      this.messenger.set({
        type: 'success',
        message: 'Perfil alterado com sucesso'
      })
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
      this.passwordResponse = err.error.message
      this.passwordSent = false;
    }
    );
  }

  fieldHasErrors(field){
    if (field == 'confPassword')
      return (
        (this.passwordForm.controls[field].touched || this.passwordForm.controls[field].dirty) &&
        this.passwordForm.controls['newPassword'].value != this.passwordForm.controls[field].value &&
        this.passwordForm.controls[field].invalid
      )
    return this.profileForm.controls[field].touched &&
      this.profileForm.controls[field].dirty &&
      this.profileForm.controls[field].invalid
  }

}
