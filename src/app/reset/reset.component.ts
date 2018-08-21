import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { switchMap, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { NavbarComponent } from '../navbar/navbar.component';
import { AuthService } from '../services/auth.service'
import { ValidatePasswordMatch } from '../validate-password-match'

@Component({
  selector: 'app-reset',
  templateUrl: './reset.component.html',
  styleUrls: ['./reset.component.scss']
})
export class ResetComponent implements OnInit {

  resetForm: FormGroup;
  resetToken: String;

  tokenIsValid: Boolean = false;
  sendingPassword: Boolean = false;
  passwordSent: Boolean = false;
  resetResponse: String;

  constructor( 
    fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService, 
  ) { 
    this.resetForm = fb.group({
      'newPassword' :
      [
        null,
        Validators.compose(
          [
            Validators.required,
            Validators.minLength(4)
          ]
        )
      ],
      'confPassword' :
      [
        null,
        Validators.compose(
          [
            Validators.required,
            Validators.minLength(4)
          ]
        )
      ]
    },
    {
      validator: ValidatePasswordMatch.MatchPassword
    }
    )
  }

  ngOnInit() {
    this.resetToken = this.route.snapshot.paramMap.get('resetToken');
    this.authService.verifyResetToken(this.resetToken)
        .subscribe(res=>{this.tokenIsValid=true}, err => {
          console.log(err);
          this.router.navigate(['/error', {type: 'Token Inválido', message: 'Token inválido ou expirado'}]);
        });
  }

  resetPassword(){
    this.sendingPassword = true;
    this.resetForm.disable()
    this.authService.resetPassword(this.resetToken, this.resetForm.value)
    .subscribe(res => {
      console.log(res);
      this.resetResponse = 'Sua senha foi alterada com sucesso.'
      this.passwordSent = true;
      this.sendingPassword = false;
    }, err => {
      console.log(err);
      this.resetResponse = err;
      this.passwordSent = false;
      this.sendingPassword = false;
    });  
  }

}
