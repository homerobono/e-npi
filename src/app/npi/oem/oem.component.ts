import { Component, Inject, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
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
  
  npiForm: FormGroup;
  npiObservable: Observable<Npi>

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private messenger: MessageService,
    private utils: UtilService,
    private npiComponent: NpiComponent
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
      'fiscals': null,
      'investment': null,
      'projectCost': fb.group({
        'cost': null,
        'annex': null
      }),
      'inStockDateType': null,
      'inStockDate': fb.group({
        'fixed': null,
        'offset': null
      }),
      'oemActivities': fb.array([])
    })
  }

  ngOnInit() {
    console.log(this.npi)

    this.insertOemActivities();
    this.fillFormData()

    if (this.npi.isCriticallyAnalised() ||
      !this.npiComponent.editFlag)
      this.npiForm.disable()

    this.npiComponent.resetFormFlagSubject.subscribe(
      () => {
        console.log('Reseting, bitches')
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
