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
    this.loadSignatures()
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
        finalApproval: fb.group({
          status: null,
          comment: null
        }),
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
    this.loadSignatures()

    this.npiFormOutput.emit(this.validateForm)

    this.npiComponent.resetFormFlagSubject.subscribe(
      () => { this.fillFormData() }
    )
  }

  fillFormData() {
    if (this.npi.validation)
      this.validateForm.get("validation").patchValue({
        'finalApproval': {
          status: null,
          comment: null
        },
        'final': this.npi.validation.final ? this.npi.validation.final : null,
      })
  }

  fieldHasErrors(field) {
    this.validateForm.updateValueAndValidity()
    //console.log(this.validateForm.get("validation") as FormGroup)
    return (this.validateForm.get("validation") as FormGroup)
      .controls[field].hasError('required')
  }

  finalizeNpi() {
    this.npiComponent.finalizeNpi()
  }

  updateParentForm() {
    this.npiFormOutput.emit(this.validateForm)
  }

  toggleStatus(i, event) {
    event.stopPropagation()
    var statusControl = this.validateForm.get("validation").get("finalApproval").get('status')
    if (event.target.value == statusControl.value) statusControl.setValue(null)
  }

  loadSignatures() {
    var disapprovals = this.npi.validation.disapprovals
    this.disapprovalSignatures = new Array()
    for (let i = 0; i < disapprovals.length; i++) {
      if (disapprovals[i].signature.date && disapprovals[i].signature.user)
        this.disapprovalSignatures.push({
          date: new Date(disapprovals[i].signature.date).toLocaleDateString('pt-br'),
          user: disapprovals[i].signature.user.firstName +
            (disapprovals[i].signature.user.lastName ?
              ' ' + disapprovals[i].signature.user.lastName :
              ''
            )
        })
    }
    var final = this.npi.validation.finalApproval
    if (final && final.signature && final.signature.date && final.signature.user)
      this.finalSignature = {
        date: new Date(final.signature.date).toLocaleDateString('pt-br'),
        user: final.signature.user.firstName +
          (final.signature.user.lastName ?
            ' ' + final.signature.user.lastName :
            ''
          )
      }
    else
      this.finalSignature = null
    console.log(this.disapprovalSignatures)
  }

  toggleFields(edit: Boolean) {
    if (edit) {
      if (this.npiComponent.amITheOwner()) {
        this.validateForm.get('validation').get('final').enable({ emitEvent: false })
      }
      if (this.npiComponent.user.level >= 1) {
        this.validateForm.get('validation').get('finalApproval').enable({ emitEvent: false })
      }
    } else {
      this.validateForm.get('validation').get('final').disable({ emitEvent: false })
      this.validateForm.get('validation').get('finalApproval').disable({ emitEvent: false })
    }
  }

  toggleNewVersion() {
    this.npiComponent.newFormVersionFlag = !this.npiComponent.newFormVersionFlag
    this.npiComponent.newFormVersion.next(this.npiComponent.newFormVersionFlag)
    window.scrollTo({ left: 0, top: 120, behavior: 'smooth' });
  }

  amITheValidator() {
    return true
  }

}