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
  selector: 'app-pixel',
  templateUrl: './pixel.component.html',
  styleUrls: ['./pixel.component.scss']
})
export class PixelComponent implements OnInit {

  @Input() npi: Npi
  @Output() npiFormOutput = new EventEmitter<FormGroup>()

  npiForm: FormGroup;

  constructor(fb: FormBuilder,
    private npiService: NpiService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private messenger: MessageService,
    private localeService: BsLocaleService,
    private location: Location,
    private npiComponent: NpiComponent,
    private uploadService: UploadService
  ) {
    this.npi = new Npi(null)

    this.npiForm = fb.group({
      'complexity': null,
      'client': null,
      'projectCost': fb.group({
        'cost': null,
        'annex': null
      }),
      'price': null,
      'investment': null,
      'inStockDate': null,
      'npiRef': null
    })
  }

  ngOnInit() {
    this.localeService.use('pt-br');

    this.npiFormOutput.emit(this.npiForm)
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
      price: this.npi.price ?
        this.npi.price.toFixed(2).toString().replace('.', ',')
        : null,
      projectCost: this.npi.projectCost ?
        {
          cost: this.npi.projectCost.cost ?
            this.npi.projectCost.cost.toFixed(2).toString().replace('.', ',')
            : null,
          annex: null
        } : null,
      investment: this.npi.investment ?
        this.npi.investment.toFixed(2).toString().replace('.', ',')
        : null
    })
  }

  fieldHasErrors(field) {
    return this.npiForm.get(field).hasError('required')
  }

}
