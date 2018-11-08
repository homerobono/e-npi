import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { MessageService } from '../services/message.service';
import { Observable, Observer } from 'rxjs/Rx';
import { slideInOutTopAnimation, scaleUpDownAnimation } from '../_animations/slide_in_out.animation'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  animations: [slideInOutTopAnimation, scaleUpDownAnimation],
})

export class LoginComponent {
  loginForm: FormGroup;
  operationResponse
  
  constructor(
      private fb: FormBuilder,
      private authService: AuthService, 
      private router: Router,
      public messenger : MessageService
    ) { 
    this.operationResponse = messenger.getAndClear()
    this.messenger.response.subscribe(
        (res) => { this.operationResponse = res},
        (err) => { this.messenger.set(
            {
                type:'error', 
                message:'Ocorreu um erro ao obter o status da operação',
                head: 'Serviço de mensagens',
                log:err
            }) 
        }
    );

    this.loginForm = fb.group({
        email: ['', Validators.required],
        password: ['', [Validators.required, Validators.minLength(4)]]
      });
    }

    login() {
        const val = this.loginForm.value;
        if (val.email && val.password) {
            console.log('trying to login');
            this.messenger.clear()
            this.authService.login(val.email, val.password)
            .subscribe(
                (res) => {
                    console.log("User is logged in");
                    this.router.navigateByUrl('/home');
                    },
                (err) => {
                    console.log(err);
                    this.loginForm.controls['password'].patchValue(null);
                    this.loginForm.markAsPristine();
                    //this.operationResponse = this.messenger.getAndClear()
                }
            );
        }
        else {
            alert ('Preencha os campos e-mail e senha');
        }
    }
}
