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

  npi : Npi
  @Input() set npiSetter(npi: Npi) {
    this.npi = npi;
    this.fillFormData()
  }
  @Output() npiFormOutput = new EventEmitter<FormGroup>()

  npiForm: FormGroup;

  objectkeys = Object.keys

  constructor(
    fb: FormBuilder,
    private npiComponent: NpiComponent,
    private utils: UtilService
  ) {
    this.npi = new Npi(null)

    this.npiForm = fb.group({
      'complexity': null,
      'client': null,
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
      'regulations': fb.group({
        standard: fb.group({}),
        additional: null
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
        currency: null
      }),
      'projectCost': fb.group({
        value: null,
        currency: null,
        annex: null
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

    if (this.npi.isCriticallyAnalised() ||
      !this.npiComponent.editFlag)
      this.npiForm.disable()

    this.npiComponent.resetFormFlagSubject.subscribe(
      () => { this.fillFormData() }
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
    return this.npiForm.get(field).hasError('required')
  }

}
