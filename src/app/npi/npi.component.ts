import { Component, OnInit, ViewChildren, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { BsLocaleService, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { createNumberMask } from 'text-mask-addons/dist/textMaskAddons';

import { NpiService } from '../services/npi.service';
import { AuthService } from '../services/auth.service';
import { MessageService } from '../services/message.service';

import Npi from '../models/npi.model';
import { Location } from '@angular/common';
import { Subject, Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import { UtilService } from '../services/util.service';
import { Globals } from 'config';

@Component({
  selector: 'app-npi',
  templateUrl: './npi.component.html',
  styleUrls: ['./npi.component.scss']
})

export class NpiComponent implements OnInit {

  resetFormFlagSubject = new Subject<Boolean>()
  resetFormFlag = true

  path: String
  response: any
  date: Date
  npiNumber: Number
  npiSubject = new Subject<Npi>()
  npi: Npi
  authorName: String
  authorId: String

  titleEdit = false
  titleField: String

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
    public route: ActivatedRoute,
    private messenger: MessageService,
    private localeService: BsLocaleService,
    private location: Location,
    private utils: UtilService
  ) {
    this.npi = new Npi(null)
    this.npiForm = fb.group({})
    //this.titleField = this.npi.name
    this.datePickerConfig = Object.assign(
      {},
      {
        containerClass: 'theme-default',
        showWeekNumbers: false,
        dateInputFormat: 'DD/MM/YYYY',
        minDate: new Date()
      }
    )
  }

  ngOnInit() {
    //console.log(this.route.snapshot)
    this.messenger.response.subscribe(
      res => { this.response = res }
    )
    this.localeService.use('pt-br');
    this.route.params.subscribe(
      params => {
        this.npiNumber = params.npiNumber
        this.getNpi(this.npiNumber)
      }
    )
    if (this.route.snapshot.data['readOnly'])
      this.npiForm.disable()

    setTimeout(() => console.log(this.npiForm.value), 1000)
    //changes.subscribe(res => {this.path = res[0].path; console.log('CHANGED ROUTE!')})
    //console.log(this.route.firstChild.snapshot.routeConfig.path.includes('edit'))
  }

  getNpi(npiNumber) {
    //console.log('getting npi ' + npiNumber)
    this.npiService.getNpi(npiNumber)
      .subscribe(
        npi => {
          console.log(npi)
          this.npiSubject.next(npi);
          this.npi = npi
          this.titleField = npi.name
          this.authorId = npi.requester._id
          this.authorName = npi.requester.firstName +
            (npi.requester.lastName ? ' ' + npi.requester.lastName : '')
        }, err => {
          this.location.replaceState(null)
          this.router.navigateByUrl('/error')
        }
      )
  }

  submitNpi(npiForm): void {
    this.sendingForm = true

    npiForm.name = this.titleField

    console.log(npiForm)
    if (this.npi.entry == 'oem' && npiForm.inStockDateType)
      npiForm.inStockDate =
        {
          'fixed': npiForm.inStockDateType == 'fixed' ?
            npiForm.inStockFixedDate ?
              new Date(npiForm.inStockFixedDate) : null : null,
          'offset': npiForm.inStockDateType == 'offset' ?
            npiForm.inStockOffsetDate : null
        }

    npiForm.id = this.npi.id
    console.log(npiForm)
    this.npiService.updateNpi(npiForm).
      subscribe(res => {
        console.log(res)
        this.formSent = true;

        if (Object.keys(res.data.changedFields).length > 0)
          this.messenger.set({
            'type': 'success',
            'message': 'NPI atualizada com sucesso'
          });
        else
          this.messenger.set({
            'type': 'info',
            'message': 'Nenhum campo modificado'
          });
        this.sendingForm = false;
        this.router.navigate(['/npi/' + this.npi.number], { relativeTo: this.route })
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
      this.npiForm.controls[prop].setErrors({ 'required': true })
      invalidFieldsMessage += Globals.LABELS[prop] +
        (i < errorFields.length - 1 ? i < errorFields.length - 2 ? ', ' : ' e ' : '. ')
    }
    console.log(errors);
    this.messenger.set({
      type: 'error',
      message: invalidFieldsMessage
    })
  }

  toggleTitleEdit(event) {
    if (this.route.snapshot.routeConfig.path.includes("/edit"))
      if (event.target.id == 'titleLabel')
        this.titleEdit = true
      else
        this.titleEdit = false
  }

  changeTitle(event: KeyboardEvent) {
    switch (event.key) {
      case "Enter":
        console.log('saving title')
        this.titleEdit = false
        break
      case "Escape":
        console.log('Escape')
        this.titleEdit = false
        this.titleField = this.npi.name
        break
      default:
    }
  }

  saveNpi(npiForm) {
    this.npiForm.setErrors(null)
  }

  submitToAnalisys(npiForm) {
    npiForm.stage = 2
    this.submitNpi(npiForm)
  }

  fieldHasErrors(field) {
    return this.npiForm.controls[field].hasError('required')
  }

  cancelNpi() {
    //this.clearFields()
  }

  reset() {
    this.resetFormFlagSubject.next(!this.resetFormFlag)
    this.resetFormFlag = !this.resetFormFlag
    console.log(this.resetFormFlag)
  }

  setChild(form) {
    Object.keys(form.controls).forEach((field: string) => {
      this.npiForm.addControl(field, form.get(field))
    });
  }

}
