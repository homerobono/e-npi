import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { NpiService } from '../../services/npi.service'

import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MessageService } from '../../services/message.service';

import { conformToMask } from 'angular2-text-mask/dist/angular2TextMask';
import { createNumberMask } from 'text-mask-addons/dist/textMaskAddons';

import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker' 

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})

export class CreateComponent implements OnInit {
  
  sendingCreate: Boolean = false;
  createSent: Boolean = false;
  createResponse: String;
  response : any
  date : Date
  
  public currencyMask = {
    mask : 
      createNumberMask({
        prefix : '',
        includeThousandsSeparator : true,
        thousandsSeparatorSymbol : '.',
        requireDecimal : true,
        decimalSymbol : ',',
        allowNegative : false,
      }),
    guide : false,
  }  
  public dateMask = {
    mask : ['/\d/','/','/\d/','/']
  }

  datePickerConfig: Partial<BsDatepickerConfig>;

  createForm : FormGroup;
  departments = [ 'Comercial',
    'Compras',
    'Engenharia de Produção',
    'Engenharia de Processos',
    'Financeiro',
    'P&D',
    'Produção',
    'R.H.' ]

  constructor( fb : FormBuilder,
              private npiService: NpiService,
              private authService: AuthService,
              private router: Router,
              private messenger: MessageService
            ) 
  {
    this.datePickerConfig = Object.assign(
      {},
      { 
        containerClass : 'theme-dark-blue',
        showWeekNumbers: false,
        dateInputFormat: 'DD/MM/YYYY'
      }
    )
    this.createForm = fb.group({
      'date' : new Date().toLocaleDateString(),
      'name' : 'Projetaço',
      'entry' : 'pixel',
      'cost' : '',
      'price' : '',
      'investment' : '',
      'inStockDate' : null,
      'npiRef' : ''
    })
  }

  ngOnInit() {
    this.messenger.response.subscribe(
      res => { this.response = res }
    )
  }

  createNpi(): void {
    this.unMaskFields()
    this.sendingCreate = true
    this.npiService.createNpi(this.createForm.value).
    subscribe(res => {
      this.messenger.set({
         'type' : 'success',
         'message' : 'NPI cadastrado com sucesso' 
      });
      this.createSent = true;
      this.sendingCreate = false;
      this.clearFields();
      this.router.navigateByUrl('home')
    }, err => {
      console.log(this.response);
      this.createSent = false;
      this.sendingCreate = false;
    });
  }

  clearFields(){
    this.createForm.patchValue({
      firstName : null,
      lastName : null,
      email : null,
      phone : null,
      department : 'Comercial',
      newPassword : null,
      confPassword : null,
      level: '0'
    });
    this.createForm.markAsPristine();
    this.createForm.markAsUntouched();
  }

  unMaskFields(){
    var moneyString
    if (this.createForm.controls['cost'].value) {
      moneyString = this.createForm.controls['cost'].value.replace(/\./g,'').replace(/,/,'.')
      this.createForm.controls['cost'].setValue(parseFloat(moneyString as string))
    }
    if (this.createForm.controls['price'].value) {
      moneyString = this.createForm.controls['price'].value.replace(/\./g,'').replace(/,/,'.')
      this.createForm.controls['price'].setValue(parseFloat(moneyString as string))
    }
    if (this.createForm.controls['investment'].value) {
      moneyString = this.createForm.controls['investment'].value.replace(/\./g,'').replace(/,/,'.')
      this.createForm.controls['investment'].setValue(parseFloat(moneyString as string))
    }
  }
}
