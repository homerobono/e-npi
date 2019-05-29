import { Component, OnInit } from '@angular/core';
import FileElement from '../../../models/file.model';
import { FileService } from '../../../services/file.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { BsModalRef } from 'ngx-bootstrap';
import { HttpEventType } from '@angular/common/http';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss']
})
export class PreviewComponent implements OnInit {

  currentPath: String
  element: FileElement
  dataUrl: SafeUrl

  constructor(
    private sanitizer: DomSanitizer,
    private fileService: FileService,
    public modalRef: BsModalRef
  ) { }

  ngOnInit() {
    this.fileService.download(this.currentPath, this.element.name).subscribe(
      (event: any) => {
        if (event.type == HttpEventType.Response) {
          console.log('File downloaded')
          this.dataUrl = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(event.body));
          //this.dataUrl = window.URL.createObjectURL(data);
        }
      })
  }

  getFileType() {
    if (this.element) {
      let extension = this.element.name.split('.').pop()
      if (['pdf'].some(ext => extension.includes(ext)))
        return 'pdf'
      else if (['jpg', 'jpeg', 'bmp', 'png', 'gif'].some(ext => extension.includes(ext)))
        return 'image'

    }
    return null
  }

}
