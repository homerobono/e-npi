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
    console.log(this.npi)

    this.npiFormOutput.emit(this.npiForm)
    this.insertOemActivities();
    this.fillFormData()

    if (this.npi.isCriticallyAnalised() ||
      this.route.snapshot.data['readOnly'])
      this.npiForm.disable()

    this.npiComponent.resetFormFlagSubject.subscribe(
      () => this.fillFormData()
    )
  }

  insertOemActivities() {
    var oemActivitiesArray = this.npiForm.get('oemActivities') as FormArray
    var arrLength = this.utils.getOemActivities().length
    for (var i = 0; i < arrLength; i++) {
      oemActivitiesArray.push(this.fb.group({
        _id: this.npi.oemActivities[i]._id,
        date: this.npi.oemActivities[i].date,
        comment: this.npi.oemActivities[i].comment,
      }))
    }
  }

  fillNestedFormData(form: FormGroup | FormArray, model) {
    Object.keys(form.controls).forEach((field: string) => {
      const control = form.get(field)
      if ((control instanceof FormGroup || control instanceof FormArray)
        && model[field]) {
        this.fillNestedFormData(control, model[field])
      } else
        if (model[field] != null && model[field] != undefined) {
          try {
            control.setValue(model[field])
          }
          catch { }
        }
    })
  }

  fillFormData() {
    this.fillNestedFormData(this.npiForm, this.npi)

    this.npiForm.patchValue({
      npiRef: this.npi.npiRef ? this.npi.npiRef.number : null,
      projectCost: {
        cost: this.npi.projectCost.cost != null ?
          this.npi.projectCost.cost.toFixed(2).toString().replace('.', ',') : null,
        annex: this.npi.projectCost.annex
      },
      investment: this.npi.investment != null ?
        this.npi.investment.toFixed(2).toString().replace('.', ',') : null,
      inStockDateType: this.npi.inStockDate ?
        this.npi.inStockDate instanceof (Date || String) ? null :
          this.npi.inStockDate.fixed ? 'fixed' :
            this.npi.inStockDate.offset ? 'offset' : null : null,
      inStockFixedDate: this.npi.inStockDate ?
        this.npi.inStockDate instanceof (Date || String) ?
          new Date(this.npi.inStockDate) :
          this.npi.inStockDate.fixed ?
            new Date(this.npi.inStockDate.fixed) :
            null : null,
      inStockOffsetDate: this.npi.inStockDate ?
        (!(this.npi.inStockDate instanceof (Date || String))) ?
          this.npi.inStockDate.offset ?
            this.npi.inStockDate.offset : null : null : null
    });
  }

  fieldHasErrors(field) {
    return this.npiForm.controls[field].hasError('required')
  }

  updateParentForm() {
    this.npiFormOutput.emit(this.npiForm)
  }

}
