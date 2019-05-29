import { Component, OnInit, Input } from '@angular/core';
import { NpiComponent } from '../../npi/npi.component';
import { ActivitiesComponent } from '../../npi/activities/activities.component';
import { AbstractControl } from '@angular/forms';
import { UploaderComponent } from '../uploader/uploader.component';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { FileManagerComponent } from '../file-manager.component';
import { UploadService } from '../../services/upload.service';
import { UtilService } from 'src/app/services/util.service';

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
  @Input() npiId: String
  @Input() npiNumber: Number
  @Input() npiVersion: Number
  @Input() class: String

  private modalRef: BsModalRef

  constructor(
    private modalService: BsModalService,
    public uploadService: UploadService,
    public utilService: UtilService
  ) { }

  ngOnInit() {
   }

  openFileAction(field) {
    console.log(field)
    if (field.annex && !field.annex.length && this.npiId)
      this.openFileManager(field)
    this.openUploadModal(field)
  }

  openFileManager(field : string) {
    const initialState = {
      npiId: this.npiId,
      npiNumber: this.npiNumber,
      npiVersion: this.npiVersion,
      field,
      editFlag: this.editFlag && this.canEdit
    }
    this.modalRef = this.modalService.show( FileManagerComponent,
      {
        initialState,
        class: "modal-lg"
      });
  }

  openUploadModal(field : string) {
    this.modalRef = this.modalService.show(UploaderComponent, {
      initialState: { field },
      class: 'modal-lg modal-dialog-centered upload-modal'
    });
  }

  get field() : string{
    return (this.parent ? `${this.parent}.` : '') + this.fieldLabel
  }

}
