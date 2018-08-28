import { Component, Inject, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { createNumberMask } from 'text-mask-addons/dist/textMaskAddons';
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker'
import { defineLocale } from 'ngx-bootstrap/chronos';

import { AuthService } from '../../../services/auth.service';
import { MessageService } from '../../../services/message.service';
import { NpiService } from '../../../services/npi.service'
import { UploadService } from '../../../services/upload.service'
import { FileUploader } from 'ng2-file-upload';

import Npi from '../../../models/npi.model';
import { Location } from '@angular/common';
import { NpiComponent } from '../../npi.component';
import { UtilService } from '../../../services/util.service';
import { Globals } from 'config';

@Component({
  selector: 'app-edit-oem',
  templateUrl: './oem.component.html',
  styleUrls: ['./oem.component.scss']
})

export class OemComponent implements OnInit {

  @Input() npi: Npi

  response: any
  date: Date
  npiNumber: Number
  authorName: String
  authorId: String

  sendingForm: Boolean = false;
  formSent: Boolean = false;
  editResponse: String

  currency = createNumberMask({
    prefix: '',
    includeThousandsSeparator: true,
    thousandsSeparatorSymbol: '.',
    requireDecimal: true,
    decimalSymbol: ',',
    allowNegative: false,
  })

  public currencyMask = {
    mask: this.currency,
    guide: false,
  }

  public dateMask = {
    mask: ['/\d/', '/', '/\d/', '/']
  }

  datePickerConfig: Partial<BsDatepickerConfig>;
  npiForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private npiService: NpiService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private messenger: MessageService,
    private localeService: BsLocaleService,
    private location: Location,
    private npiComponent: NpiComponent,
    private uploadService: UploadService,
    private utils: UtilService,
  ) {
    this.npi = new Npi(null)
    this.datePickerConfig = Object.assign(
      {},
      {
        containerClass: 'theme-default',
        showWeekNumbers: false,
        dateInputFormat: 'DD/MM/YYYY',
        minDate: new Date()
      }
    )
    this.npiForm = fb.group({
      'complexity': '',
      'client': 'Pixel',
      'cost': '',
      'price': '',
      'investment': null,
      'projectCost': fb.group({
        'cost': null,
        'annex': null
      }),
      'inStockDateType': null,
      'inStockFixedDate': null,
      'inStockOffsetDate': null,
      'npiRef': null,
      'oemActivities': fb.array([]),
      'critical': fb.array([])
    })
  }

  ngOnInit() {
    this.messenger.response.subscribe(
      res => { this.response = res }
    )

    this.npiNumber = this.npi.number
    console.log(this.npi)
    this.insertOemActivities();
    if (this.npi.stage > 1){
      if (this.npi.critical)
        this.insertCriticalAnalisys();
    }
    this.fillFormData(this.npiForm, this.npi)
  }

  insertOemActivities(){
    var oemActivitiesArray = this.npiForm.get('oemActivities') as FormArray
    var arrLength = this.utils.getOemActivities().length
    for (var i = 0; i < arrLength; i++) {
      oemActivitiesArray.push(this.fb.group(
        { 
          date: this.npi.oemActivities[i].date,
          comment: 'asd' 
        }
      ))
    }
  }
  
  insertCriticalAnalisys(){
    var criticalForm = this.npiForm.get('critical') as FormArray
    var criticalModelArray = this.npi.critical

    criticalModelArray.forEach(analisys => {
      criticalForm.push(this.fb.group(
        { 
          status: analisys.status,
          comment: analisys.comment, 
          signature: analisys.signature 
        }
      ))      
    });
  }

  editNpi(npiForm): void {
    this.sendingForm = true

    npiForm.inStockDate =
      {
        'fixed': npiForm.inStockDateType == 'fixed' ?
          new Date(npiForm.inStockFixedDate) : null,
        'offset': npiForm.inStockDateType == 'offset' ?
          npiForm.inStockOffsetDate : null
      }
    npiForm.id = this.npi.id
    console.log(npiForm)

    this.npiComponent.updateNpi(npiForm).
      subscribe(() => {
        this.formSent = true;
        this.sendingForm = false;
        this.router.navigate(['../view'], { relativeTo: this.route })
      }, err => {
        var invalidFieldsMessage = 'Preencha os seguintes campos: '
        for (let prop in err.error.message.invalidFields) {
          console.log(prop)
          this.npiForm.controls[prop].setErrors({ 'required': true })
          invalidFieldsMessage += Globals.LABELS[prop] + ', '
        }
        console.log(err);
        this.messenger.set({
          type: 'error',
          message: invalidFieldsMessage
        })
        this.formSent = false;
        this.sendingForm = false;
      });
  }

  fillFormData(form: FormGroup | FormArray, model) {
    if (this.route.snapshot.data['readOnly']) form.disable()
    Object.keys(form.controls).forEach((field: string) => {
      const control = form.get(field)
      if ((control instanceof FormGroup || control instanceof FormArray)
        && model[field]) {
        this.fillFormData(control, model[field])
      } else
        if (model[field] != null && model[field] != undefined) {
          try {
            control.setValue(model[field])
          }
          catch { }
        }
    })

    this.npiForm.get('projectCost').patchValue({
      cost: this.npi.projectCost.cost != null ?
        this.npi.projectCost.cost.toFixed(2).toString().replace('.', ',') : null,
    })
    this.npiForm.patchValue({
      investment: this.npi.investment != null ?
        this.npi.investment.toFixed(2).toString().replace('.', ',') : null,
      inStockDateType: this.npi.inStockDate ?
        this.npi.inStockDate instanceof (Date || String) ? null :
          this.npi.inStockDate.fixed ? 'fixed' :
            this.npi.inStockDate.offset ? 'offset' : null : null,
      inStockFixedDate: this.npi.inStockDate ?
        this.npi.inStockDate instanceof (Date || String) ?
          new Date(this.npi.inStockDate):
          this.npi.inStockDate.fixed ?
            new Date(this.npi.inStockDate.fixed) :
            null : null,
      inStockOffsetDate: this.npi.inStockDate ?
        (!(this.npi.inStockDate instanceof (Date || String))) ?
          this.npi.inStockDate.offset ?
            this.npi.inStockDate.offset : null : null : null
    });
    if (this.npi.entry != 'internal' && this.npi.entry != 'oem')
      this.npiForm.patchValue({
        price:
          this.npi.price.toFixed(2).toString().replace('.', ','),
        cost:
          this.npi.cost.toFixed(2).toString().replace('.', ','),
      })

    if (this.npi.investment)
      this.npiForm.patchValue({
      })
  }

  fieldHasErrors(field) {
    return this.npiForm.controls[field].hasError('required')
  }
  
  submitToAnalisys(npiForm){
    npiForm.stage = 2
    this.editNpi(npiForm)
  }

  cancelNpi(){
    //this.clearFields()
  }

  setCriticalForm(form){
    console.log(form)
    this.npiForm.setControl('critical', form)
    console.log(this.npiForm)
  }

}
