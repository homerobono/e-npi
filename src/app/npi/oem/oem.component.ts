import { Component, Inject, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { createNumberMask } from 'text-mask-addons/dist/textMaskAddons';
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker'
import { defineLocale } from 'ngx-bootstrap/chronos';

import { AuthService } from '../../services/auth.service';
import { MessageService } from '../../services/message.service';
import { NpiService } from '../../services/npi.service'
import { UploadService } from '../../services/upload.service'
import { FileUploader } from 'ng2-file-upload';

import Npi from '../../models/npi.model';
import { Location } from '@angular/common';
import { NpiComponent } from '../npi.component';
import { UtilService } from '../../services/util.service';
import { Globals } from 'config';

@Component({
  selector: 'app-oem',
  templateUrl: './oem.component.html',
  styleUrls: ['./oem.component.scss']
})

export class OemComponent implements OnInit {

  @Input() npi: Npi
  @Output() npiFormOutput = new EventEmitter<FormGroup>()

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
    private uploadService: UploadService,
    private utils: UtilService,
    private npiComponent: NpiComponent
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
      'complexity': null,
      'client': null,
      'investment': null,
      'projectCost': fb.group({
        'cost': null,
        'annex': null
      }),
      'inStockDateType': null,
      'inStockFixedDate': null,
      'inStockOffsetDate': null,
      'npiRef': null,
      'oemActivities': fb.array([])
    })
  }

  ngOnInit() {
    this.messenger.response.subscribe(
      res => { this.response = res }
    )
    this.npiNumber = this.npi.number
    console.log(this.npi)

    this.npiForm.valueChanges.subscribe(
      () => { 
        this.updateParentForm() 
      }
    )
    this.insertOemActivities();
    this.fillFormData(this.npiForm, this.npi)

    if (this.npi.isCriticallyAnalised()) 
      this.npiForm.disable()
  }

  insertOemActivities(){
    var oemActivitiesArray = this.npiForm.get('oemActivities') as FormArray
    var arrLength = this.utils.getOemActivities().length
    for (var i = 0; i < arrLength; i++) {
      oemActivitiesArray.push(this.fb.group({
          _id : this.npi.oemActivities[i]._id,
          date : this.npi.oemActivities[i].date,
          comment : this.npi.oemActivities[i].comment,
      }))
    }
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

  updateParentForm(){
    this.npiFormOutput.emit(this.npiForm)
  }

}
