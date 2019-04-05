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

  npi: Npi
  @Input() set npiSetter(npi: Npi) {
    this.npi = npi;
    this.fillFormData()
  }

  @Input() set toggleEdit(edit: Boolean) {
    this.toggleFields(edit)
    this.isFormEnabled = edit
    this.editFlag = edit
  }
  @Output() npiFormOutput = new EventEmitter<FormGroup>()

  public pilotDate: string
  validateForm: FormGroup
  deny: FormControl
  isFormEnabled: Boolean
  editFlag: Boolean
  finalSignature: { 'date', 'user' }
  disapprovalSignatures: Array<{ 'date', 'user' }>

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private npiComponent: NpiComponent
  ) {
    this.validateForm = fb.group({
      validation: fb.group({
        final: ['Parecer Final', Validators.required],
      })
    })
  }

  ngOnInit() {
    this.npi.activities.find
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
    this.pilotDate =
      new Date(this.npi.activities.find(a => a.activity == "PILOT").signature.date)
        .toLocaleDateString('pt-br')

    this.fillFormData()

    this.npiFormOutput.emit(this.validateForm)

    this.npiComponent.resetFormFlagSubject.subscribe(
      () => { this.fillFormData() }
    )
  }

  fillFormData() {
    if (this.npi.validation)
      this.validateForm.get("validation").patchValue({
        'final': this.npi.validation.final ? this.npi.validation.final : null,
      })
  }

  fieldHasErrors(field) {
    let propsArr = field.split(".")
    let control = this.validateForm.get('validation')
    for (let i = 0; i < propsArr.length; i++) {
      control = control.get(propsArr[i])
    }
    return control.hasError('required')
  }

  finalizeNpi() {
    this.npiComponent.finalizeNpi()
  }

  updateParentForm() {
    this.npiFormOutput.emit(this.validateForm)
  }

  toggleFields(edit: Boolean) {
    if (edit) {
      if (this.amITheValidator()) {
        this.validateForm.get('validation').get('final').enable({ emitEvent: false })
      }
    } else {
      this.validateForm.get('validation').get('final').disable({ emitEvent: false })
    }
  }

  toggleNewVersion() {
    this.npiComponent.newFormVersionFlag = !this.npiComponent.newFormVersionFlag
    this.npiComponent.newFormVersion.next(this.npiComponent.newFormVersionFlag)
    window.scrollTo({ left: 0, top: 120, behavior: 'smooth' });
  }

  amITheValidator() {
    return this.npiComponent.user.level == 2 || (
      this.npiComponent.user.level == 1 && (
        (this.npi.entry != 'oem' && this.npiComponent.user.department == "MPR") ||
        (this.npi.entry == 'oem' && this.npiComponent.user.department == "COM")
      )
    )
  }

}