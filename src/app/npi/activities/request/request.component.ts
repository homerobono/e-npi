import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, AbstractControl } from '@angular/forms';
import { UtilService } from '../../../services/util.service';
import { ActivatedRoute } from '@angular/router';
import { NpiComponent } from '../../npi.component';
import Npi from '../../../models/npi.model';

@Component({
  selector: 'app-request',
  templateUrl: './request.component.html',
  styleUrls: ['./request.component.scss']
})
export class RequestComponent implements OnInit {

  npi: Npi
  request: any
  requestClass: String

  @Input() set npiSetter(npi: Npi) {
    this.npi = npi;
  }

  @Input() set requestClassSetter(requestClass: String) {
    this.requestClass = requestClass
    console.log(this.requestClass)
    this.request = this.npiComponent.npi.requests.find(r => r.class == this.requestClass)
    if (this.request) {
      console.log(this.request.analysis)
      this.signatures = new Array<String>(this.request.analysis.length)
      this.fillFormData()
      if (!this.analysisFormArray.length)
        this.insertRequestAnalysis()
    }
  }

  @Input() set toggleEdit(edit: Boolean) {
    if (edit) {
      if (this.requestClass == "DELAYED_RELEASE" && (this.npi.stage == 2 || this.npi.stage == 3))
        this.analysisFormArray.controls.forEach(control => {
          //if (this.amITheAnalysisGestor(control))
          if (this.amITheRequestAnalyser(control))
            control.enable()
        })
      this.requestFormGroup.get('class').enable()
      //this.requestFormGroup.get('_id').enable()
    }
    else this.requestFormGroup.disable()
  }

  @Output() requestForm = new EventEmitter<FormGroup>()

  analysisFormArray: FormArray
  requestFormGroup: FormGroup
  signatures: Array<any>
  finalSignature: String
  isFormEnabled: Boolean

  constructor(
    private fb: FormBuilder,
    private utils: UtilService,
    private route: ActivatedRoute,
    public npiComponent: NpiComponent
  ) {
    this.analysisFormArray = fb.array([])
    this.requestFormGroup = fb.group({
      '_id': '',
      'class': '',
      'analysis': this.analysisFormArray,
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

  insertRequestAnalysis() {
    this.requestFormGroup.patchValue(
      { class: this.requestClass }
    )

    var analysisModelArray = this.request.analysis

    analysisModelArray.forEach(analysis => {
      var analysisControl = this.fb.group(
        {
          _id: analysis._id,
          status: analysis.status,
          comment: analysis.comment
        }
      )
      analysisControl.valueChanges.subscribe(
        () => this.updateParentForm())

      this.analysisFormArray.push(analysisControl)
    });

    //this.loadSignatures()
  }

  loadSignatures() {
    for (var i = 0; i < this.request.analysis.length; i++) {
      var row = this.request.analysis[i]
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
    var requestFormArray =
      this.analysisFormArray.controls

    requestFormArray.forEach(analysis => {
      var requestRow = this.getRequestRow(analysis.get('_id').value)
      //console.log(requestRow)
      analysis.patchValue(
        {
          status: requestRow.status,
          comment: requestRow.comment
        }
      )
    });

    //this.loadSignatures()
  }

  getRequestRow(id) {
    return this.request.analysis.find(request => request._id == id)
  }

  updateParentForm() {
    //console.log(this.requestFormGroup.value)
    this.requestForm.emit(this.requestFormGroup)
  }

  toggleStatus(i, event) {
    event.stopPropagation()
    var statusControl =
      (this.analysisFormArray
        .controls[i] as FormGroup).get('status')
    if (event.target.value == statusControl.value) statusControl.setValue(null)
  }

  clearForm() {
    var requestFormArray =
      this.analysisFormArray.controls

    requestFormArray.forEach(analysis => {
      var requestRow = this.getRequestRow(analysis.get('_id').value)
      console.log(requestRow)
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
    let controls = this.analysisFormArray.controls.filter(control => control.enabled)
    let control = controls[fieldIndex]
    if (control) {
      control = control.get('comment')
      return control.hasError('required')
    }
    else return null
  }

  amITheAnalysisGestor(analysis: AbstractControl): Boolean {
    return (this.getRequestRow(analysis.get('_id').value).responsible == this.npiComponent.user.department
      && (this.npiComponent.user.level == 1 || this.npiComponent.user.level == 2))
  }

  amITheRequestAnalyser(analysis: AbstractControl): Boolean {
    return (this.getRequestRow(analysis.get('_id').value).responsible == this.npiComponent.user._id ||
      this.amITheAnalysisGestor(analysis))
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
    this.npiComponent.finalApprove()
  }
}
