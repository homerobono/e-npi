import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { NpiService } from '../../services/npi.service'

import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MessageService } from '../../services/message.service';

import { conformToMask } from 'angular2-text-mask/dist/angular2TextMask';
import { createNumberMask } from 'text-mask-addons/dist/textMaskAddons';

import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker' 
import { listLocales, defineLocale } from 'ngx-bootstrap/chronos';
import { ptBrLocale } from 'ngx-bootstrap/locale';
import Npi from '../../models/npi.model';

defineLocale('pt-br', ptBrLocale)

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
              private messenger: MessageService,
              private localeService: BsLocaleService
            ) 
  {
    this.datePickerConfig = Object.assign(
      {},
      { 
        containerClass : 'theme-default',
        showWeekNumbers: false,
        dateInputFormat: 'DD/MM/YYYY',
        minDate: new Date()
      }
    )

    this.createForm = fb.group({
      'date' : new Date().toLocaleDateString(),
      'name' : 'Projetaço',
      'entry' : 'oem',
      'cost' : '',
      'price' : '',
      'investment' : '',
      'inStockDateType' : 'fixed',
      'inStockDate' : null,
      'npiRef' : ''
    })
  }

  ngOnInit() {
    this.messenger.response.subscribe(
      res => { this.response = res }
    )
    this.localeService.use('pt-br');
  }

  createNpi(npiForm): void {
    this.sendingCreate = true
    this.npiService.createNpi(npiForm).
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

  toNpiModel(){
    var model = new Npi(this.createForm.value)
    return model
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

}
