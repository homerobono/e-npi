import { Injectable } from '@angular/core';
import { FileUploader, FileUploaderOptions } from 'ng2-file-upload';
import { Globals } from 'config';

const uploadUrl = Globals.ENPI_SERVER_URL + '/files/upload'

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  public uploader : FileUploader

  constructor() {
    this.uploader = new FileUploader(
      {
        url: uploadUrl,
        authToken : localStorage.getItem('id_token')
      }
    )

    this.uploader.onAfterAddingFile = (file)=> { file.withCredentials = false; };
       
    this.uploader.onCompleteItem = (item:any, response:any, status:any, headers:any) => {
      console.log("File upload: uploaded: ", item, status, response);
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
