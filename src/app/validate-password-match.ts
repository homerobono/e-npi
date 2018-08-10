import {AbstractControl, Validators} from '@angular/forms';

export class ValidatePasswordMatch{

    static MatchPassword(AC: AbstractControl) {
       let password = AC.get('newPassword').value; // to get value in input tag
       let confirmPassword = AC.get('confPassword').value; // to get value in input tag
        if(password != confirmPassword) {
            console.log('Passwords doesnt match.');
            AC.get('confPassword').setErrors( { MatchPassword: true } )
        } else {
            console.log('Passwords match.');
            return null
        }
    }
}
