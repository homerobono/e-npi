import { Component, OnInit, Input } from '@angular/core';
import { NpiComponent } from '../../npi/npi.component';
import { ActivitiesComponent } from '../../npi/activities/activities.component';
import { AbstractControl } from '@angular/forms';
import { UploaderComponent } from '../uploader/uploader.component';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { FileManagerComponent } from '../file-manager.component';
import { UploadService } from '../../services/upload.service';

@Component({
  selector: 'app-file-button',
  templateUrl: './file-button.component.html',
  styleUrls: ['./file-button.component.scss']
})
export class FileButtonComponent implements OnInit {

  @Input() fieldControl: AbstractControl
  @Input() fieldLabel: String
  @Input() parent: String = ''
  @Input() editFlag: Boolean = true
  @Input() canEdit: Boolean = true
  @Input() npiNumber: Number

  private modalRef: BsModalRef

  constructor(
    private modalService: BsModalService,
    public uploadService: UploadService
  ) { }

  ngOnInit() { }

  openFileAction(field) {
    if (field.annex && !field.annex.length && this.npiNumber)
      this.openFileManager(field)
    this.openUploadModal(field)
  }

  openFileManager(field) {
    const initialState = {
      npiNumber: this.npiNumber,
      field
    }
    this.modalRef = this.modalService.show( FileManagerComponent,
      {
        initialState,
        class: "modal-lg"
      });
  }

  openUploadModal(field) {
    this.modalRef = this.modalService.show(UploaderComponent, {
      initialState: { field },
      class: 'modal-lg modal-dialog-centered upload-modal'
    });
  }

  get field() {
    return (this.parent ? `${parent}.` : '') + this.fieldLabel
  }

}
