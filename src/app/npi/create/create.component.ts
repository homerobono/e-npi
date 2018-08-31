import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { createNumberMask } from 'text-mask-addons/dist/textMaskAddons';
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker'
import { defineLocale } from 'ngx-bootstrap/chronos';

import { AuthService } from '../../services/auth.service';
import { MessageService } from '../../services/message.service';
import { NpiService } from '../../services/npi.service'
import { UploadService } from '../../services/upload.service'
import { FileUploader } from 'ng2-file-upload';

import Npi from '../../models/npi.model';

import { ptBrLocale } from 'ngx-bootstrap/locale';
import { UtilService } from '../../services/util.service';
import { Globals } from 'config';
defineLocale('pt-br', ptBrLocale)

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})

export class CreateComponent implements OnInit {

  sendingForm: Boolean = false;
  formSent: Boolean = false;
  createResponse: String;

  public currencyMask = {
    mask:
      createNumberMask({
        prefix: '',
        includeThousandsSeparator: true,
        thousandsSeparatorSymbol: '.',
        requireDecimal: true,
        decimalSymbol: ',',
        allowNegative: false,
      }),
    guide: false,
  }
  public dateMask = {
    mask: ['/\d/', '/', '/\d/', '/']
  }

  datePickerConfig: Partial<BsDatepickerConfig>;
  createForm: FormGroup;

  constructor(fb: FormBuilder,
    private npiService: NpiService,
    private authService: AuthService,
    private router: Router,
    private messenger: MessageService,
    private localeService: BsLocaleService,
    private uploadService: UploadService,
    private utils: UtilService
  ) {
    this.datePickerConfig = Object.assign(
      {},
      {
        containerClass: 'theme-default',
        showWeekNumbers: false,
        dateInputFormat: 'DD/MM/YYYY',
        minDate: new Date()
      }
    )
    var oemDefaultDeadLine = new Date(Date.now() + 3600000 * 24 * 30)
    this.createForm = fb.group({
      'date': new Date().toLocaleDateString('pt-br'),
      'complexity': null,
      'client': 'Pixel',
      'name': 'Validação no Servidor',
      'entry': 'oem',
      'cost': null,
      'price': null,
      'investment': null,
      'projectCost': fb.group({
        'cost': null,
        'annex': String
      }),
      'inStockDateType': 'fixed',
      'inStockDate': null,
      'npiRef': null,
      'description': null,
      'norms': fb.group({
        'description': null,
        'annex': null
      }),
      'resources': fb.group({
        'description': null,
        'annex': null
      }),
      'fiscals': null,
      'oemActivities': fb.array([])
    })

    var oemActivities = utils.getOemActivities()
    for (var i = 0; i < oemActivities.length; i++) {
      (this.createForm.get('oemActivities') as FormArray).
        push(fb.group({
          date: oemDefaultDeadLine,
          comment: null,
          dept: oemActivities[i].dept,
          title: oemActivities[i].title,
        }))
    }
  }

  ngOnInit() {
    this.localeService.use('pt-br');
  }

  createNpi(npiForm): void {
    this.sendingForm = true
    this.npiService.createNpi(npiForm).
      subscribe(res => {
        this.messenger.set({
          'type': 'success',
          'message': 'NPI cadastrado com sucesso'
        });
        this.formSent = true;
        this.sendingForm = false;
        this.clearFields();
        this.router.navigateByUrl('/npi/' + res.data.number)
      }, err => {
        if (err.error.message.errors)
          this.invalidFieldsError(err.error.message.errors)
        this.formSent = false;
        this.sendingForm = false;
      }
      )
  }

  invalidFieldsError(errors) {
    var errorFields = Object.keys(errors)
    var invalidFieldsMessage = 'Corrija o' +
      (errorFields.length == 1 ? ' campo ' : 's campos ')
    for (let i = 0; i < errorFields.length; i++) {
      let prop = errorFields[i]
      console.log(prop)
      this.createForm.controls[prop].setErrors({ 'required': true })
      invalidFieldsMessage += Globals.LABELS[prop] +
        (i < errorFields.length - 1 ? i < errorFields.length - 2 ? ', ' : ' e ' : '. ')
    }
    console.log(errors);
    this.messenger.set({
      type: 'error',
      message: invalidFieldsMessage
    })
  }
  saveNpi(npiForm) {
    npiForm.stage = 1
    this.createNpi(npiForm)
  }

  submitToAnalisys(npiForm) {
    npiForm.stage = 2
    this.createNpi(npiForm)
  }

  cancelNpi() {
    this.clearFields()
  }

  clearFields() {
    this.createForm.patchValue({
    });
    this.createForm.markAsPristine();
    this.createForm.markAsUntouched();
  }

  selectFiles(event) {
    event.stopPropagation()
  }

  fieldHasErrors(field) {
    return this.createForm.controls[field].hasError('required')
  }
}
