import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import Npi from '../../../models/npi.model';
import { ActivatedRoute } from '@angular/router';
import { NpiComponent } from '../../npi.component';
import { OemComponent } from '../oem.component';
import { UploadService } from 'src/app/services/upload.service';
import { UploaderComponent } from 'src/app/file-manager/uploader/uploader.component';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.scss']
})
export class ClientComponent implements OnInit {

  @Input() npi: Npi
  @Output() npiFormOutput = new EventEmitter<FormGroup>()

  @Input() set toggleEdit(edit: Boolean) {
    if (edit && this.npi.stage == 3 && this.npi.isCriticallyApproved()  && !(this.npi.activities && this.npi.activities.length)) {
      this.npiForm.enable()
      this.npiForm.updateValueAndValidity()
    }
    else this.npiForm.disable()
  }

  npiForm: FormGroup
  deny: FormControl
  isFormEnabled: Boolean = true
  modalRef: BsModalRef

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    public npiComponent: NpiComponent,
    public uploadService: UploadService,
    private modalService: BsModalService,
  ) {
    this.npiForm = fb.group({
      'clientApproval': fb.group({
        'approval': null,
        'comment': null,
        'annex': []
      })
    })
  }

  ngOnInit() {
    this.isFormEnabled =
      this.npiComponent.editFlag &&
      this.npi.stage == 3 &&
      this.npi.isCriticallyApproved()

    if (!this.isFormEnabled)
      this.npiForm.disable()

    this.npiFormOutput.emit(this.npiForm)
    this.deny = (this.npiForm.get("clientApproval") as FormGroup).controls['approval'] as FormControl

    this.fillFormData()

    this.npiComponent.resetFormFlagSubject.subscribe(
      () => { this.fillFormData() }
    )

    this.npiForm.get('clientApproval').valueChanges.subscribe(
      () => {
        this.npiForm.updateValueAndValidity()
        this.npiFormOutput.emit(this.npiForm)
      }
    )
  }

  fillFormData() {
    this.npiForm.get("clientApproval").setValue({
      'approval': this.npi.clientApproval.approval,
      'comment': this.npi.clientApproval.comment,
      'annex': this.npi.clientApproval.annex,
    })
  }

  toggleNewVersion() {
    this.npiComponent.newFormVersionFlag = !this.npiComponent.newFormVersionFlag
    this.npiComponent.newFormVersion.next(this.npiComponent.newFormVersionFlag)
    window.scrollTo({ left: 0, top: 120, behavior: 'smooth' });
  }

  openFileAction(field) {
    if (!this.npi[field].annex || !this.npi[field].annex.length)
      this.npiComponent.openFileUploader(field)
    else this.npiComponent.openFileManager(field)
  }

  fieldHasErrors(field) {
    let propsArr = field.split(".")
    let control = this.npiForm.get(propsArr[0])
    for (let i = 1; i < propsArr.length; i++) {
      control = control.get(propsArr[i])
    }
    return control.hasError('required')
  }

}
