import { Component, Inject, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, FormArray, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker'
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
import { Observable } from 'rxjs';

@Component({
  selector: 'app-oem',
  templateUrl: './oem.component.html',
  styleUrls: ['./oem.component.scss']
})

export class OemComponent implements OnInit {

  npi: Npi
  @Input() set npiSetter(npi: Npi) {
    this.npi = npi;
    this.fillFormData()
  }
  @Input() npis: Npi[]
  @Input() set toggleEdit(edit: Boolean) {
    if (edit && this.npiComponent.amITheOwner() &&
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
  npiObservable: Observable<Npi>
  objectkeys = Object.keys

  public standardRegulationsArray: any
  public oemActivitiesControlsArray: any

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private messenger: MessageService,
    public utils: UtilService,
    public npiComponent: NpiComponent
  ) {

    this.npis = new Array<Npi>()

    this.npiForm = fb.group({
      'client': null,
      'npiRef': null,
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
      'inStockDateType': null,
      'inStockDate': fb.group({
        'fixed': null,
        'offset': null
      }),
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
    this.standardRegulationsArray = (this.npiForm.get('regulations').get('standard') as FormGroup).controls

    this.npiFormOutput.emit(this.npiForm)
    this.npiForm.get('npiRef').valueChanges.subscribe(
      res => { this.npiComponent.loadNpiRef(res) })
    this.fillFormData()

    if (this.npi.isCriticallyTouched() ||
      !this.npiComponent.editFlag)
      this.npiForm.disable()

    this.npiComponent.resetFormFlagSubject.subscribe(
      () => this.fillFormData())

    this.npiComponent.newFormVersion.subscribe(
      flag => flag ? this.editForm() : this.npiForm.disable()
    )
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
      projectCost: this.npi.projectCost ?
        {
          value: this.npi.projectCost.value ?
            this.npi.projectCost.value.toFixed(2).toString().replace('.', ',')
            : null,
          currency: this.npi.projectCost.currency ?
            this.npi.projectCost.currency : null,
          annex: this.npi.projectCost.annex ?
            this.npi.projectCost.annex : []
        } : null,
      investment: this.npi.investment ?
        {
          value: this.npi.investment.value ?
            this.npi.investment.value.toFixed(2).toString().replace('.', ',')
            : null,
          currency: this.npi.investment.currency ?
            this.npi.investment.currency : null,
          annex: this.npi.investment.annex ?
            this.npi.investment.annex : []
        } : null,
      inStockDateType: this.npi.inStockDate ?
        this.npi.inStockDate instanceof (Date || String) ? null :
          this.npi.inStockDate.fixed ? 'fixed' :
            this.npi.inStockDate.offset ? 'offset' : null : null,
      inStockDate: {
        fixed:
          this.npi.inStockDate ?
            this.npi.inStockDate.fixed ?
              new Date(this.npi.inStockDate.fixed) :
              null : null,
        offset:
          this.npi.inStockDate ?
            this.npi.inStockDate.offset ?
              this.npi.inStockDate.offset : null : null
      }
    });
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

  editForm() {
    this.npiForm.enable()
    this.updateParentForm()
  }

  setChild(form) {
    Object.keys(form.controls).forEach((field: string) => {
      this.npiForm.addControl(field, form.get(field))
    });
    this.npiForm.updateValueAndValidity()
    this.updateParentForm()
  }

}
