import { Injectable } from '@angular/core';
import { FileUploader } from 'ng2-file-upload';
import { Globals } from 'config';

const uploadUrl = Globals.ENPI_SERVER_URL + '/files'

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  public uploader : FileUploader

  constructor() { 
    this.uploader = new FileUploader(
      {
        url: uploadUrl,
        authTokenHeader : "Authorization",
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
}
