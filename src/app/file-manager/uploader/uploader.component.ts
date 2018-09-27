import { Component, OnInit, HostListener } from '@angular/core';
import { FileUploader } from 'ng2-file-upload';
import { Observable } from 'rxjs/Observable';
import { FileService } from '../../services/file.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { UploadService } from '../../services/upload.service';
import { Globals } from 'config';
import FileElement from '../../models/file.model';
import { UtilService } from '../../services/util.service';

const URL = Globals.ENPI_SERVER_URL

@Component({
  selector: 'app-uploader',
  templateUrl: './uploader.component.html',
  styleUrls: ['./uploader.component.scss']
})
export class UploaderComponent implements OnInit {

  public uploader: FileUploader = new FileUploader({})
  public field: string
  public hasBaseDropZoneOver: boolean = false;

  public fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }

  constructor(
    private uploadService: UploadService,
    private modalRef: BsModalRef,
    private utils: UtilService
  ) { }

  ngOnInit() {
    if (this.uploadService.uploaders[this.field])
      this.uploader = this.uploadService.uploaders[this.field]
  }

  @HostListener('window:keyup', ['$event'])
  keyUpEvent(e) {
    e.stopPropagation()
    if (e.keyCode == 13){
      this.confirm()
    }
  }

  confirm() {
    this.uploadService.addUploader(this.field, this.uploader)
    this.modalRef.hide()
  }

}
