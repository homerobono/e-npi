import { Injectable } from '@angular/core';
import { FileUploader, FileUploaderOptions } from 'ng2-file-upload';
import { Globals } from 'config';
import { Subject } from 'rxjs';

const uploadUrl = Globals.ENPI_SERVER_URL + '/files/upload'

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  public uploader : FileUploader
  public onCompleteUpload : Subject<any>

  constructor() {
    this.uploader = new FileUploader(
      {
        url: uploadUrl,
        authToken : localStorage.getItem('id_token')
      }
    )
    this.onCompleteUpload = new Subject<any>()

    this.uploader.onAfterAddingFile = (file) => { file.withCredentials = false; };
       
    this.uploader.onCompleteAll = () => {
      console.log("All files uploaded.")
      this.onCompleteUpload.next()
    };

  }

  getUploader() : FileUploader {
    return this.uploader
  }
  
  upload(destinationPath: String) {
    this.uploader.onBuildItemForm = (fileItem, form) => {
      form.append('destination', destinationPath)
    }
    this.uploader.uploadAll()
  }
}
