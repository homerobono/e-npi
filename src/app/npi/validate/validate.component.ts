import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import Npi from '../../models/npi.model';
import { ActivatedRoute } from '@angular/router';
import { NpiComponent } from '../npi.component';

@Component({
  selector: 'app-validate',
  templateUrl: './validate.component.html',
  styleUrls: ['./validate.component.scss']
})
export class ValidateComponent implements OnInit {

  @Input() npi: Npi
  @Output() npiFormOutput = new EventEmitter<FormGroup>()

  validateForm: FormGroup
  deny: FormControl
  isFormEnabled: Boolean

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private npiComponent: NpiComponent
  ) {
    this.validateForm = fb.group({
      'validation': fb.group({
        'pilot': ['Aprovação Piloto', Validators.required],
        'product': ['Aprovação Produto', Validators.required],
        'final': ['Parecer Final', Validators.required],
      })
    })
  }

  ngOnInit() {
    this.isFormEnabled =
      !this.route.snapshot.data['readOnly'] &&
      this.npi.stage == 3 &&
      this.npi.isCriticallyApproved()

    if (!this.isFormEnabled)
      this.validateForm.disable()

    this.validateForm.get('validation').valueChanges.subscribe(
      () => {
        this.validateForm.updateValueAndValidity()
        this.updateParentForm()
      }
    )

    this.fillFormData()

    this.npiFormOutput.emit(this.validateForm)

    this.npiComponent.resetFormFlagSubject.subscribe(
      () => { this.fillFormData() }
    )
  }

  fillFormData() {
    if (this.npi.validation)
      this.validateForm.get("validation").setValue({
        'pilot': this.npi.validation.pilot ? this.npi.validation.pilot : null,
        'product': this.npi.validation.product ? this.npi.validation.product : null,
        'final': this.npi.validation.final ? this.npi.validation.final : null,
      })
  }

  fieldHasErrors(field) {
    this.validateForm.updateValueAndValidity()
    return (this.validateForm.get("validation") as FormGroup)
    .controls[field].hasError('required')
  }

  finalizeNpi(){
    this.npiComponent.finalizeNpi()
  }

  updateParentForm() {
    this.npiFormOutput.emit(this.validateForm)
  }

}
