import { Component, OnInit } from '@angular/core';
import { UploadService } from '../../services/upload.service';
import { BsModalRef } from 'ngx-bootstrap';

@Component({
  selector: 'app-sending-form-modal',
  templateUrl: './sending-form-modal.component.html',
  styleUrls: ['./sending-form-modal.component.scss']
})
export class SendingFormModalComponent implements OnInit {

  finished = false

  constructor(
    public uploadService: UploadService,
    private modalRef: BsModalRef
  ) { }

  ngOnInit() {
    this.uploadService.onCompleteUpload.subscribe( 
    (res) => {
      if (res){
        console.log('Closing Modal: onCompleteUploadReplay called')
        this.finished = true
        this.modalRef.hide()
      }
    })
    if (!this.uploadService.isUploading || this.finished)
      this.modalRef.hide()
  }

  abort(){
    this.uploadService.abort()
    this.modalRef.hide()
  }

}
