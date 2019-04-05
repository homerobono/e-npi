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
  selector: 'app-custom',
  templateUrl: './custom.component.html',
  styleUrls: ['./custom.component.scss']
})
export class CustomComponent implements OnInit {
  
  npi : Npi
  @Input() set npiSetter(npi: Npi) {
    this.npi = npi;
    this.fillFormData()
  }
  @Input() set toggleEdit(edit: Boolean) {
    if (edit && this.npi.amITheOwner(this.npiComponent.user._id) &&
      (this.npi.stage == 1 || (this.npi.stage == 2 && !this.npi.isCriticallyApproved()
        && (this.npi.hasCriticalDisapproval() || !this.npi.hasCriticalApproval())
      ))) {
      this.npiForm.enable()
      this.npiForm.updateValueAndValidity()
    }
    else this.npiForm.disable()
  }
  @Output() npiFormOutput = new EventEmitter<FormGroup>()

  npiForm: FormGroup;
  objectkeys = Object.keys

  constructor(
    private fb: FormBuilder,
    public utils: UtilService,
    public npiComponent: NpiComponent
  ) {
    this.npi = new Npi(null)

    this.npiForm = fb.group({
      'client': null,
      'npiRef': null,
      'designThinking': fb.group({
        'apply': null,
        'annex': []
      }),
      'description': fb.group({
        'description': null,
        'annex': []
      }),
      'resources': fb.group({
        'description': null,
        'annex': []
      }),
      'regulations': fb.group({
        standard: fb.group({}),
        additional: null,
        'description': null,
        'annex': []
      }),
      'cost': fb.group({
        value: '30,00',
        currency: 'BRL'
      }),
      'price': fb.group({
        value: null,
        currency: null
      }),
      'inStockDate': null,
      'investment': fb.group({
        value: null,
        currency: null,
        annex: []
      }),
      'projectCost': fb.group({
        value: null,
        currency: null,
        annex: []
      }),
      'demand': fb.group({
        'amount': null,
        'period': null
      }),
      'fiscals': null,
    })

    let regulations = utils.getRegulations()
    let additionalArray = this.npiForm.get('regulations').get('standard') as FormGroup
    regulations.forEach(reg => {
      additionalArray.addControl(reg.value, fb.control(null))
    })
  }

  ngOnInit() {
    this.npiFormOutput.emit(this.npiForm)
    this.npiForm.get('npiRef').valueChanges.subscribe(res => { this.npiComponent.loadNpiRef(res) })
    this.fillFormData()

    if (this.npi.isCriticallyTouched() ||
      !this.npiComponent.editFlag)
      this.npiForm.disable()

    this.npiComponent.resetFormFlagSubject.subscribe(
      () => this.fillFormData()
    )
  }

  fillNestedFormData(form: FormGroup | FormArray, model) {
    if (!this.npiComponent.editFlag) form.disable()
    Object.keys(form.controls).forEach((field: string) => {
      const control = form.get(field)
      if ((control instanceof FormGroup || control instanceof FormArray)
        && model[field]) {
        this.fillNestedFormData(control, model[field])
      } else
        if (model[field] != null && model[field] != undefined && !(model[field] instanceof Object)) {
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
      price: this.npi.price ? {
        value: this.npi.price.value ? 
          this.npi.price.value.toFixed(2).toString().replace('.', ',')
          :null,
        currency: this.npi.price.currency ? 
          this.npi.price.currency:null,
      } : null,
      cost: this.npi.cost ? {
        value: this.npi.cost.value ? 
          this.npi.cost.value.toFixed(2).toString().replace('.', ',')
          :null,
        currency: this.npi.cost.currency ? 
          this.npi.cost.currency:null,
      } : null,
      projectCost: this.npi.projectCost ?
        {
          value: this.npi.projectCost.value ?
            this.npi.projectCost.value.toFixed(2).toString().replace('.', ',')
            : null,
          currency: this.npi.projectCost.currency ? 
            this.npi.projectCost.currency:null,
          annex: null
        } : null,
      investment: this.npi.investment ?
      {
        value: this.npi.investment.value ?
          this.npi.investment.value.toFixed(2).toString().replace('.', ',')
          : null,
        currency: this.npi.investment.currency ? 
          this.npi.investment.currency:null,
        annex: null
      } : null,
    })
  }

  fieldHasErrors(field) {
    return this.npiComponent.invalidFields.find(f => f == field)
  }

  isRegulationApplyable() {
    return Object.keys((this.npiForm.get("regulations").get("standard") as FormArray).controls)
      .some(reg => this.npiForm.get("regulations").get("standard").get(reg).value == true)
  }
  
  openFileAction(field) {
    if (!this.npi[field].annex || !this.npi[field].annex.length)
      this.npiComponent.openFileUploader(field)
    else this.npiComponent.openFileManager(field)
  }
  
  updateParentForm() {
    this.npiFormOutput.emit(this.npiForm)
  }

}

