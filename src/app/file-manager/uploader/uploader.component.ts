import { Component, OnInit } from '@angular/core';
import { FileUploader } from 'ng2-file-upload';
import { Observable } from 'rxjs/Observable';
import { FileService } from '../../services/file.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { UploadService } from '../../services/upload.service';
import { Globals } from 'config';
import FileElement from '../../models/file.model';

const URL = Globals.ENPI_SERVER_URL

@Component({
  selector: 'app-uploader',
  templateUrl: './uploader.component.html',
  styleUrls: ['./uploader.component.scss']
})
export class UploaderComponent implements OnInit {

  public uploader: FileUploader
  public hasBaseDropZoneOver: boolean = false;

  public fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }

  constructor(
    private uploadService: UploadService,
    private modalRef: BsModalRef,
  ) {
    this.uploader = new FileUploader({})
  }

  ngOnInit() {}

  confirm() {
    this.uploadService.append(this.uploader.queue)
    this.modalRef.hide()
  }

}
