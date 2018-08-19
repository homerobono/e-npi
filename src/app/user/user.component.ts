import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import User from '../models/user.model';
import { UsersService } from '../services/users.service';
import { AuthService } from '../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Observable } from 'rxjs';
import { MessageService } from '../services/message.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {

  userForm : FormGroup
  passwordForm : FormGroup
  userId : String
  user : User = new User()
  userLevel : Number = 0
  
  edit: Boolean = false
  userSent: Boolean = false
  userResponse: String
  sendingUser: Boolean = false
  deleteResponse: String

  departments = [ 'Comercial',
    'Compras',
    'Engenharia de Produção',
    'Engenharia de Processos',
    'Financeiro',
    'P&D',
    'Produção',
    'R.H.' ]

  constructor( private fb : FormBuilder ,
    private userService: UsersService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private messenger: MessageService
  ) { 

    this.user = new User();
    this.userLevel = authService.getUserLevel();
    this.userForm = fb.group({
      'firstName' : [this.user.firstName, Validators.required],
      'lastName': [this.user.lastName?this.user.lastName:null, Validators.required],
      'email' : 
      [
        this.user.email, Validators.compose([
        Validators.pattern('.+@.+\\..+'),
        Validators.required
        ])
      ],
      'department' : [ {value: this.user.department?this.user.department:null, disabled: this.userLevel<2}, Validators.required],
      'phone' : 
      [
        this.user.phone?this.user.phone:null, Validators.compose
          ([
            Validators.pattern( '(\\+?\\d{2})?((\\(\\d{2}\\))||\\d{2})\\d{4,5}-?\\d{4}' ),
            Validators.required
          ])
      ],
      'level' : [ {value: this.user.level, disabled: this.userLevel<1}, Validators.required],
    });
    }

  ngOnInit() {
    this.getUser(this.route.snapshot.paramMap.get('userId'));
  }

  getUser(userId){
    console.log('getting user ' + userId)
    this.userService.getUser(userId)
    .subscribe(user => {
      this.user = user;
      this.user.createdString = new Date(user.created).toLocaleString();
      this.fillFormData();
    })
  }

  fillFormData(){
    this.userForm.setValue({
      firstName : this.user.firstName,
      lastName : this.user.lastName?this.user.lastName:null,
      email : this.user.email,
      phone : this.user.phone?this.user.phone:null,
      department : this.user.department?this.user.department:null,
      level : this.user.level.toString(),
    });
  }

  updateUser(userForm) {
    this.sendingUser = true;
    this.userService.updateUser(this.user._id, userForm).
    subscribe(res => {
      this.getUser(this.route.snapshot.paramMap.get('userId'));
      this.userResponse = "Usuário alterado com sucesso";
      this.userSent = true;
      this.userForm.markAsPristine();
      this.userForm.markAsUntouched();
      this.sendingUser = false;
      this.edit = false;
    }, err => {
      this.userResponse = err.error.message;
      this.userSent = false;
      this.sendingUser = false;
    }
    );
  }

  editUser(){
    this.edit = this.edit ? false : true
    this.userForm.markAsPristine();
    this.userForm.markAsUntouched();
    if(this.edit) {

    }
  }

  deleteUser(){
    if (!confirm("Tem certeza que deseja remover o usuário "+this.user.firstName+' '+this.user.lastName+' ('+this.user.email+') ?')) return;
    this.userService.deleteUser(this.user._id)
    .subscribe( res => {
      console.log(res);
      this.messenger.set(
        {
          type: 'success', 
          message: 'Usuário removido com sucesso'
        }
      )
      this.router.navigate(['/users'])
    }, err => {
      this.deleteResponse = 'Usuário não removido: '+err;
    });
  }
  
  reSendRegisterToken(){
    this.userService.reSendRegisterToken(this.user._id)
    .subscribe( res => {
      console.log(res);
      this.messenger.set(
        {
          type: 'success', 
          message: 'E-mail enviado com sucesso'
        }
      )
      this.router.navigate(['/users'])
    }, err => {
      this.deleteResponse = 'E-mail não enviado: '+err;
    });
  }
}
