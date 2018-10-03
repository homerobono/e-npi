import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
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
  @Output() criticalForm = new EventEmitter<FormGroup>()

  criticalFormGroup: FormGroup
  signatures: Array<any>
  finalSignature: String
  isFormEnabled: Boolean

  constructor(
    private fb: FormBuilder,
    private utils: UtilService,
    private route: ActivatedRoute,
    private npiComponent: NpiComponent
  ) {
    this.criticalFormGroup = fb.group({
      'critical': fb.array([]),
      'finalApproval': fb.group({
        status: null,
        comment: null
      })
    })
    this.npi = npiComponent.npi
    this.signatures = new Array<String>(this.npi.critical.length)
  }

  ngOnInit() {
    this.insertCriticalAnalisys()

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

  loadSignatures() {
    for (var i = 0; i < this.npi.critical.length; i++) {
      var row = this.npi.critical[i]
      if (row.signature && row.signature.date && row.signature.user) {
        var signature = row.signature.user.firstName +
          (row.signature.user.lastName ?
            ' ' + row.signature.user.lastName :
            ''
          ) + ', ' + new Date(row.signature.date).toLocaleDateString('pt-br') +
          ', às ' + new Date(row.signature.date).toLocaleTimeString('pt-br')

        this.signatures[i] = signature
      }
      else this.signatures[i] = null
    }
    var final = this.npi.finalApproval.signature
    if (final && final.date && final.user)
      this.finalSignature = final.user.firstName +
        (final.user.lastName ?
          ' ' + final.user.lastName :
          ''
        ) + ', ' + new Date(final.date).toLocaleDateString('pt-br') +
        ', às ' + new Date(final.date).toLocaleTimeString('pt-br')
    else
      this.finalSignature = null
  }

  insertCriticalAnalisys() {
    var criticalFormArray = (this.criticalFormGroup.get('critical') as FormArray).controls
    var criticalModelArray = this.npi.critical

    criticalModelArray.forEach(analisys => {
      var criticalControl = this.fb.group(
        {
          _id: analisys._id,
          status: analisys.status,
          comment: analisys.comment
        }
      )
      criticalControl.valueChanges.subscribe(
        () => this.updateParentForm())

      criticalFormArray.push(criticalControl)
    });

    this.loadSignatures()
  }

  fillFormData() {
    var criticalFormArray =
      (this.criticalFormGroup.get('critical') as FormArray).controls

    criticalFormArray.forEach(analisys => {
      var criticalRow = this.getCriticalRow(analisys.get('_id').value)
      //console.log(criticalRow)
      analisys.patchValue(
        {
          status: criticalRow.status,
          comment: criticalRow.comment
        }
      )
    });

    this.loadSignatures()
  }

  getCriticalRow(id) {
    for (let i = 0; i < this.npi.critical.length; i++) {
      let critical = this.npi.critical[i]
      if (critical._id == id) return critical
    }
  }

  updateParentForm() {
    this.criticalForm.emit(this.criticalFormGroup)
  }

  toggleStatus(i, event) {
    event.stopPropagation()
    var statusControl =
      ((this.criticalFormGroup.get('critical') as FormArray)
        .controls[i] as FormGroup).get('status')
    if (event.target.value == statusControl.value) statusControl.setValue(null)
  }

  clearForm() {
    var criticalFormArray =
      (this.criticalFormGroup.get('critical') as FormArray).controls

    criticalFormArray.forEach(analisys => {
      var criticalRow = this.getCriticalRow(analisys.get('_id').value)
      console.log(criticalRow)
      analisys.patchValue(
        {
          status: null,
          comment: null,
          signature: null
        }
      )
    });
  }

  fieldHasErrors(field) {
    let fieldsArr = field.split(".")
    let control = this.criticalFormGroup.get(fieldsArr[0])
    for (let i = 1; i < fieldsArr.length; i++) {
      control = control.get(fieldsArr[i])
    }
    return control.hasError('required')
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
