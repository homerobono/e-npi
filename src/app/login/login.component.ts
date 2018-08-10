import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { trigger, style, animate, transition } from '@angular/animations';
import { MessageService } from '../services/message.service';
import { Observable, Observer } from 'rxjs/Rx';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({height: 0}),
          animate('1000ms ease-in-out', style({transform: '100px'}))
        ]),
        transition(':leave', [
          animate('500ms ease-in-out', style({height: '30px'}))
        ])
      ]
    )
  ],
})

export class LoginComponent {
  loginForm: FormGroup;
  operationResponse
  
  constructor(
      private fb: FormBuilder,
      private authService: AuthService, 
      private router: Router,
      private messenger : MessageService
) {
    this.loginForm = fb.group({
        email: ['', Validators.required],
        password: ['', [Validators.required, Validators.minLength(4)]]
      });
    }

    login() {
        const val = this.loginForm.value;
        if (val.email && val.password) {
            console.log('trying to login');
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
                    this.operationResponse = {'type':'error', 'message': err.error.message};
                    if (err.status==0){
                        this.messenger.set( 
                        {
                        type:'Erro de comunicação', 
                        message:'Não foi possível obter resposta do servidor.'
                        })
                        this.router.navigate(['/error'])
                    }
                }
            );
        }
        else {
            alert ('Preencha os campos e-mail e senha');
        }
    }
}
