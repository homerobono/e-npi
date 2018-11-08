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
  
  npi : Npi
  @Input() set npiSetter(npi: Npi) {
    this.npi = npi;
    this.fillFormData()
  }
  @Input() npis: Npi[]
  @Output() npiFormOutput = new EventEmitter<FormGroup>()
  
  objectkeys = Object.keys

  npiForm: FormGroup;
  npiObservable: Observable<Npi>

  public standardRegulationsArray : any
  public oemActivitiesControlsArray :  any

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private messenger: MessageService,
    public utils: UtilService,
    public npiComponent: NpiComponent
  ) {

    this.npis = new Array<Npi>()

    this.npiForm = fb.group({
      'npiRef': null,
      'complexity': null,
      'client': null,
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
      'inStockDateType': null,
      'inStockDate': fb.group({
        'fixed': null,
        'offset': null
      }),
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
      'oemActivities': fb.array([])
    })
    let regulations = utils.getRegulations()
    let additionalArray = this.npiForm.get('regulations').get('standard') as FormGroup
    regulations.forEach(reg => {
      additionalArray.addControl(reg.value, fb.control(null))
    })
  }

  ngOnInit() {
    console.log(this.npi)

    this.insertOemActivities();


    this.standardRegulationsArray = (this.npiForm.get('regulations').get('standard') as FormGroup).controls
    this.oemActivitiesControlsArray = (this.npiForm.get("oemActivities") as FormGroup).controls

    this.npiForm.get('npiRef').valueChanges.subscribe(res => { this.npiComponent.loadNpiRef(res) })
    this.fillFormData()

    if (this.npi.isCriticallyTouched() ||
      !this.npiComponent.editFlag)
      this.npiForm.disable()

    this.npiComponent.resetFormFlagSubject.subscribe(
      () => {
        this.fillFormData()
      }
    )

    this.npiComponent.newFormVersion.subscribe(
      (flag) => {
        if (flag) this.editForm()
        else this.npiForm.disable()
      }
    )

    this.npiFormOutput.emit(this.npiForm)
  }

  insertOemActivities() {
    var oemActivitiesArray = this.npiForm.get('oemActivities') as FormArray
    var arrLength = this.utils.getOemActivities().length
    for (var i = 0; i < arrLength; i++) {
      oemActivitiesArray.push(this.fb.group(
        this.npi.oemActivities[i]
      ))
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
    let fieldsArr = field.split(".")
    let control = this.npiForm.get(fieldsArr[0])
    for (let i = 1; i < fieldsArr.length; i++) {
      control = control.get(fieldsArr[i])
    }
    return control.hasError('required')
  }

  updateParentForm() {
    this.npiFormOutput.emit(this.npiForm)
  }

  editForm() {
    this.npiForm.enable()
    this.updateParentForm()
  }

}
