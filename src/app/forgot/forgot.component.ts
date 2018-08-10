import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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
              fb : FormBuilder ) { 
    this.emailForm = fb.group({
      'email' :
      [
        null,
        Validators.compose(
          [
            Validators.required,
            Validators.pattern('.+@.+\\..+')
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
    .subscribe(res => {
      this.tokenResponse='Um e-mail foi enviado para o endereço especificado com um link e instruções para alterar sua senha.';
      this.tokenSent = true;
      this.sendingToken = false;
      this.actionLabel = "Enviar Novamente";
    },
    err => {
      this.tokenResponse = err.error.error;
      this.tokenSent = false;
      this.sendingToken = false;
    }
    );  
    this.sendingToken = true;
  }

}
