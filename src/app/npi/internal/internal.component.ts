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
  selector: 'app-internal',
  templateUrl: './internal.component.html',
  styleUrls: ['./internal.component.scss']
})
export class InternalComponent implements OnInit {
  
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

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private messenger: MessageService,
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
      'fiscals': null,
      'investment': fb.group({
        value: null,
        currency: null,
        annex: []
      }),
      'projectCost': fb.group({
        value: null,
        currency: null,
        annex: []
      })
    })
  }

  ngOnInit() {

    this.npiFormOutput.emit(this.npiForm)
    this.npiForm.get('npiRef').valueChanges.subscribe(
      res => { this.npiComponent.loadNpiRef(res) }
    )
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

  updateParentForm() {
    this.npiFormOutput.emit(this.npiForm)
  }

  openFileAction(field) {
    if (!this.npi[field].annex || !this.npi[field].annex.length)
      this.npiComponent.openFileUploader(field)
    else this.npiComponent.openFileManager(field)
  }
}
