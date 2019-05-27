import { Component, Inject, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, FormArray } from '@angular/forms';

import Npi from '../../models/npi.model';
import { NpiComponent } from '../npi.component';
import { UtilService } from '../../services/util.service';


@Component({
  selector: 'app-pixel',
  templateUrl: './pixel.component.html',
  styleUrls: ['./pixel.component.scss']
})
export class PixelComponent implements OnInit {

  npi: Npi
  @Input() set npiSetter(npi: Npi) {
    this.npi = npi;
    this.fillFormData()
  }
  @Input() set toggleEdit(edit: Boolean) {
    if (edit && this.amITheOwner() &&
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
    fb: FormBuilder,
    public npiComponent: NpiComponent,
    public utils: UtilService
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
        none: null,
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
  }

  ngOnInit() {
    this.npiFormOutput.emit(this.npiForm)
    this.npiForm.get('npiRef').valueChanges.subscribe(
      res => this.npiComponent.loadNpiRef(res)
    );

    let regulations = this.utils.getRegulations()
    let additionalArray = this.npiForm.get('regulations').get('standard') as FormGroup
    regulations.forEach(reg => {
      additionalArray.addControl(reg.value, new FormControl({
        value: false, disabled: this.npiForm.get("regulations").get("none").value
      }))
    })
    this.npiForm.valueChanges.subscribe(value => { //for edit flag enable effect
      if (this.npiForm.get("regulations").get("none").value) {
        this.npiForm.get("regulations").get("standard").disable()
        this.npiForm.get("regulations").get("additional").disable()
        this.npiForm.get("regulations").get("description").disable()
      }
    })

    this.npiForm.get("regulations").get("none").valueChanges.subscribe(value => {
      let action = value ? 'disable' : 'enable'
      this.npiForm.get("regulations").get("standard")[action]()
      this.npiForm.get("regulations").get("additional")[action]()
      this.npiForm.get("regulations").get("description")[action]()
    })

    this.fillFormData()
    //console.log(this.npiForm.value)

    if (this.npi.isCriticallyTouched() ||
      !this.npiComponent.editFlag)
      this.npiForm.disable()

    this.npiComponent.resetFormFlagSubject.subscribe(
      () => this.fillFormData())
  }

  amITheOwner(): Boolean {
    return this.npi.requester._id == this.npiComponent.user._id
  }

  fillNestedFormData(form: FormGroup | FormArray, model) {
    if (!this.npiComponent.editFlag) form.disable()
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
      price: this.npi.price ? {
        value: this.npi.price.value ?
          this.npi.price.value.toFixed(2).toString().replace('.', ',')
          : null,
        currency: this.npi.price.currency ?
          this.npi.price.currency : null,
      } : null,
      cost: this.npi.cost ? {
        value: this.npi.cost.value ?
          this.npi.cost.value.toFixed(2).toString().replace('.', ',')
          : null,
        currency: this.npi.cost.currency ?
          this.npi.cost.currency : null,
      } : null,
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

}
