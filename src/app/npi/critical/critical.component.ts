import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, AbstractControl } from '@angular/forms';
import { UtilService } from '../../services/util.service';
import { ActivatedRoute } from '@angular/router';
import { NpiComponent } from '../npi.component';
import Npi from '../../models/npi.model';

@Component({
  selector: 'app-critical',
  templateUrl: './critical.component.html',
  styleUrls: ['./critical.component.scss']
})
export class CriticalComponent implements OnInit {

  npi: Npi
  @Input() set npiSetter(npi: Npi) {
    this.npi = npi;
    this.fillFormData()
  }
  @Input() set toggleEdit(edit: Boolean) {
    if (edit && this.npi.stage == 2 && !this.npi.isCriticallyApproved()) {
      if (this.npiComponent.user.level > 1)
        this.criticalFormGroup.get("finalApproval").enable()
      this.criticalFormArray.controls.forEach(control => {
        if (this.amITheAnalysisGestor(control))
          control.enable()
      })
    }
    else this.criticalFormGroup.disable()

    if (this.npiComponent.user.level == 2 && this.npi.isCriticallyDisapproved() && this.npi.stage == 2 && !this.npi.isApproved())
      this.criticalFormGroup.get('finalApproval').enable()
    else this.criticalFormGroup.get('finalApproval').disable()
  }

  @Output() criticalForm = new EventEmitter<FormGroup>()

  criticalFormArray: FormArray
  criticalFormGroup: FormGroup
  signatures: Array<any>
  finalSignature: String
  isFormEnabled: Boolean

  constructor(
    private fb: FormBuilder,
    private utils: UtilService,
    private route: ActivatedRoute,
    public npiComponent: NpiComponent
  ) {
    this.criticalFormArray = fb.array([])
    this.criticalFormGroup = fb.group({
      'critical': this.criticalFormArray,
      'finalApproval': fb.group({
        status: null,
        comment: null
      })
    })
    this.npi = npiComponent.npi
    this.signatures = new Array<String>(this.npi.critical.length)
  }

  ngOnInit() {
    this.insertCriticalAnalysis()

    this.isFormEnabled =
      this.npiComponent.editFlag &&
      this.npi.stage == 2

    if (!this.isFormEnabled)
      this.criticalFormGroup.disable()

    this.updateParentForm()

    this.npiComponent.resetFormFlagSubject.subscribe(
      () => this.fillFormData()
    )

    this.npiComponent.newFormVersion.subscribe(
      (flag) => {
        if (flag) {
          this.clearForm()
          this.criticalFormGroup.disable()
        }
        else this.fillFormData()
      }
    )
  }

  insertCriticalAnalysis() {
    this.criticalFormArray = this.fb.array([])
    this.criticalFormGroup = this.fb.group({
      'critical': this.criticalFormArray,
      'finalApproval': this.fb.group({
        status: null,
        comment: null
      })
    })
    var criticalModelArray = this.npi.critical

    criticalModelArray.forEach(analysis => {
      var criticalControl = this.fb.group(
        {
          _id: analysis._id,
          status: analysis.status,
          comment: analysis.comment
        }
      )
      criticalControl.valueChanges.subscribe(
        () => this.updateParentForm())

      this.criticalFormArray.push(criticalControl)
    });

    this.loadSignatures()
  }

  loadSignatures() {
    for (var i = 0; i < this.npi.critical.length; i++) {
      var row = this.npi.critical[i]
      if (row.signature && row.signature.date && row.signature.user) {
        var signature = (row.status == 'accept' ? "Aprovado por " : "Reprovado por ") +
          row.signature.user.firstName +
          (row.signature.user.lastName ?
            ' ' + row.signature.user.lastName :
            ''
          )// + ', ' + new Date(row.signature.date).toLocaleDateString('pt-br') +
        //', às ' + new Date(row.signature.date).toLocaleTimeString('pt-br')

        this.signatures[i] = signature
      }
      else this.signatures[i] = null
    }
    var final = this.npi.finalApproval.signature
    if (final && final.date && final.user)
      this.finalSignature = (row.status == 'accept' ? "Aprovado por " : "Reprovado por ") +
        final.user.firstName +
        (final.user.lastName ?
          ' ' + final.user.lastName :
          ''
        )// + ', ' + new Date(final.date).toLocaleDateString('pt-br') +
    //', às ' + new Date(final.date).toLocaleTimeString('pt-br')
    else
      this.finalSignature = null
  }


  fillFormData() {
    var criticalFormArray =
      this.criticalFormArray.controls

    criticalFormArray.forEach(analysis => {
      var criticalRow = this.getCriticalRow(analysis.get('_id').value)
      //console.log(criticalRow)
      analysis.patchValue(
        {
          status: criticalRow.status,
          comment: criticalRow.comment
        }
      )
    });

    this.criticalFormGroup.get("finalApproval").patchValue({
      comment: this.npi.finalApproval.comment
    })

    this.loadSignatures()
  }

  getCriticalRow(id) {
    return this.npi.critical.find(critical => critical._id == id)
  }

  updateParentForm() {
    this.criticalForm.emit(this.criticalFormGroup)
  }

  toggleStatus(i, event) {
    event.stopPropagation()
    var statusControl =
      (this.criticalFormArray
        .controls[i] as FormGroup).get('status')
    if (event.target.value == statusControl.value) statusControl.setValue(null)
  }

  clearForm() {
    var criticalFormArray =
      this.criticalFormArray.controls

    criticalFormArray.forEach(analysis => {
      var criticalRow = this.getCriticalRow(analysis.get('_id').value)
      console.log(criticalRow)
      analysis.patchValue(
        {
          status: null,
          comment: null,
          signature: null
        }
      )
    });
  }

  fieldHasErrors(fieldIndex) {
    let controls = this.criticalFormArray.controls.filter(control => control.enabled)
    let control = controls[fieldIndex]
    if (control) {
      control = control.get('comment')
      return control.hasError('required')
    }
    else return null
  }

  amITheAnalysisGestor(analysis: AbstractControl): Boolean {
    return this.getCriticalRow(analysis.get('_id').value).dept == this.npiComponent.user.department
      && (this.npiComponent.user.level == 1 || this.npiComponent.user.level == 2)
  }

  cancelNpi() {
    this.criticalFormGroup.get("finalApproval").patchValue({
      status: 'deny'
    })
    this.npiComponent.cancelNpi()
  }

  finalApprove() {
    this.criticalFormGroup.get("finalApproval").patchValue({
      status: 'accept'
    })
    this.npiComponent.finalApprove()
  }
}
