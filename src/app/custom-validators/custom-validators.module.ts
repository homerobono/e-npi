import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, AbstractControl, ValidatorFn } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: []
})
export class CustomValidatorsModule {

  passwordValidator(confPass: String): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
        if (control.value !== undefined && (isNaN(control.value) || control.value == confPass)) {
            return { 'confPassword': true };
        }
        return null;
    }
  }

}