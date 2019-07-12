import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, AbstractControl } from '@angular/forms';
import { UtilService } from '../../../services/util.service';
import { ActivatedRoute } from '@angular/router';
import { NpiComponent } from '../../npi.component';
import Npi from '../../../models/npi.model';
import { ActivitiesComponent } from '../activities.component';

const DAYS = 24 * 60 * 60 * 1000 // in milisecs

@Component({
  selector: 'app-request',
  templateUrl: './request.component.html',
  styleUrls: ['./request.component.scss']
})

export class RequestComponent implements OnInit {
  npi: Npi
  request: any
  requestClass: String
  delayValue: Number

  @Input() set npiSetter(npi: Npi) {
    this.npi = npi;
  }

  @Input() set requestClassSetter(requestClass: String) {
    this.requestClass = requestClass
    console.log(this.requestClass)
    this.request = this.npiComponent.npi.requests.find(r => r.class == this.requestClass)
    if (this.request) {
      console.log(this.request)
      this.signatures = new Array<String>(this.request.analisys.length)
      this.fillFormData()
      if (!this.analisysFormArray.length)
        this.insertRequestanalisys()
      if (this.requestClass == "DELAYED_RELEASE") {
        this.delayValue = Math.ceil((this.activitiesComponent.releaseDate.valueOf() - this.activitiesComponent.inStockDate.valueOf()) / DAYS)
      }
    }
  }

  @Input() set toggleEdit(edit: Boolean) {
    if (edit) {
      if (this.requestClass == "DELAYED_RELEASE" && (this.npi.stage == 2 || this.npi.stage == 3)) {
        this.analisysFormArray.controls.forEach(control => {
          //if (this.amITheanalisysGestor(control))
          if (this.amITheRequestAnalyser(control))
            control.enable()
        })
        if (this.npiComponent.user.level == 2 && this.npi.isRequestDisapproved("DELAYED_RELEASE"))
          this.requestFormGroup.get('finalApproval').enable()
        else this.requestFormGroup.get('finalApproval').disable()
      }
      this.requestFormGroup.get('class').enable()
      //this.requestFormGroup.get('_id').enable()
    }
    else this.analisysFormArray.disable()
  }

  @Output() requestForm = new EventEmitter<FormGroup>()

  analisysFormArray: FormArray
  requestFormGroup: FormGroup
  signatures: Array<any>
  finalSignature: String
  isFormEnabled: Boolean

  constructor(
    private fb: FormBuilder,
    private utils: UtilService,
    private route: ActivatedRoute,
    public npiComponent: NpiComponent,
    public activitiesComponent: ActivitiesComponent
  ) {
    this.analisysFormArray = fb.array([])
    this.requestFormGroup = fb.group({
      '_id': '',
      'class': '',
      'analisys': this.analisysFormArray,
      'finalApproval': fb.group({
        status: null,
        comment: null
      })
    })
    //this.npi = npiComponent.npis
  }

  ngOnInit() {

    this.isFormEnabled =
      this.npiComponent.editFlag &&
      this.npi.stage == 2

    if (!this.isFormEnabled)
      this.requestFormGroup.disable()

    this.updateParentForm()

    this.npiComponent.resetFormFlagSubject.subscribe(
      () => this.fillFormData()
    )

    this.npiComponent.newFormVersion.subscribe(
      (flag) => {
        if (flag) {
          this.clearForm()
          this.requestFormGroup.disable()
        }
        else this.fillFormData()
      }
    )
  }

  insertRequestanalisys() {
    this.requestFormGroup.patchValue(
      {
        _id: this.request._id,
        class: this.requestClass
      }
    )

    var analisysModelArray = this.request.analisys

    analisysModelArray.forEach(analisys => {
      console.log(analisys._id)
      var analisysControl = this.fb.group(
        {
          _id: analisys._id,
          status: analisys.status,
          comment: analisys.comment
        }
      )
      analisysControl.valueChanges.subscribe(
        () => this.updateParentForm())

      this.analisysFormArray.push(analisysControl)
    });
    this.requestFormGroup.get('finalApproval').valueChanges
      .subscribe(() => this.updateParentForm())

    this.loadSignatures()
  }

  loadSignatures() {
    for (var i = 0; i < this.request.analisys.length; i++) {
      let row = this.request.analisys[i]
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
    var final = this.request.finalApproval.signature
    if (final && final.date && final.user)
      this.finalSignature = (this.request.approval ? "Aprovado por " : "Reprovado por ") +
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
    var requestFormArray =
      this.analisysFormArray.controls

    requestFormArray.forEach(analisys => {
      var requestRow = this.getRequestRow(analisys.get('_id').value)
      //console.log(requestRow)
      analisys.patchValue(
        {
          status: requestRow.status,
          comment: requestRow.comment
        }
      )
    });

    this.requestFormGroup.get('finalApproval').setValue({
      status: this.request.finalApproval.status,
      comment: this.request.finalApproval.comment
    })

    //this.loadSignatures()
  }

  getRequestRow(id) {
    return this.request.analisys.find(request => request._id == id)
  }

  updateParentForm() {
    //console.log(this.requestFormGroup.value)
    this.requestForm.emit(this.requestFormGroup)
  }

  toggleStatus(i, event) {
    event.stopPropagation()
    var statusControl =
      (this.analisysFormArray
        .controls[i] as FormGroup).get('status')
    if (event.target.value == statusControl.value) statusControl.setValue(null)
  }

  clearForm() {
    var requestFormArray =
      this.analisysFormArray.controls

    requestFormArray.forEach(analisys => {
      var requestRow = this.getRequestRow(analisys.get('_id').value)
      console.log(requestRow)
      analisys.patchValue(
        {
          status: null,
          comment: null,
          signature: null
        }
      )
    });
  }

  fieldHasErrors(fieldIndex) {
    let controls = this.analisysFormArray.controls.filter(control => control.enabled)
    let control = controls[fieldIndex]
    if (control) {
      control = control.get('comment')
      return control.hasError('required')
    }
    else return null
  }

  amITheanalisysGestor(analisys: AbstractControl): Boolean {
    return (this.getRequestRow(analisys.get('_id').value).responsible == this.npiComponent.user.department
      && (this.npiComponent.user.level == 1 || this.npiComponent.user.level == 2))
  }

  amITheRequestAnalyser(analisys: AbstractControl): Boolean {
    return (this.getRequestRow(analisys.get('_id').value).responsible == this.npiComponent.user._id ||
      this.amITheanalisysGestor(analisys))
  }

  cancelNpi() {
    this.requestFormGroup.get("finalApproval").patchValue({
      status: 'deny'
    })
    this.npiComponent.cancelNpi()
  }

  finalApprove() {
    this.requestFormGroup.get("finalApproval").patchValue({
      status: 'accept'
    })
    this.npiComponent.finalApprove('request')
  }
}
