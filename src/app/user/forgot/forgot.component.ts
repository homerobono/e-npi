import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from '../../services/message.service';

@Component({
  selector: 'app-forgot',
  templateUrl: './forgot.component.html',
  styleUrls: ['./forgot.component.scss']
})
export class ForgotComponent implements OnInit {

emailForm : FormGroup
resetToken : String
sendingToken : Boolean = false
tokenSent = false
tokenResponse : String
actionLabel : String = "Solicitar Alteração de Senha"

  constructor( private authService : AuthService,
              private messenger : MessageService,
              fb : FormBuilder, ) { 
    this.emailForm = fb.group({
      'email' :
      [
        null,
        Validators.compose(
          [
            Validators.required,
            Validators.email
          ]
        )
      ],
    });
  }

  ngOnInit() {
  }

  sendResetToken(){
    this.tokenResponse = null;
    this.authService.sendToken(this.emailForm.value.email)
    .subscribe(() => {
      this.tokenResponse='Um e-mail foi enviado para o endereço especificado com um link e instruções para alterar sua senha.';
      this.tokenSent = true;
      this.sendingToken = false;
      this.actionLabel = "Enviar Novamente";
    },
    err => {
      this.messenger.set({
          type: 'error',
          message: 'Token não enviado: '+ err.error.error
      }
      )
      this.tokenSent = false;
      this.sendingToken = false;
    }
    );  
    this.sendingToken = true;
  }

  isFieldValid(controlName){
    return (!(
      this.emailForm.controls[controlName].invalid &&
      this.emailForm.controls[controlName].touched &&
      this.emailForm.controls[controlName].dirty &&
      !this.emailForm.controls[controlName].pending
    ))
  }

}
