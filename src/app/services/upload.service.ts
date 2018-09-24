import { Injectable } from '@angular/core';
import { FileUploader, FileUploaderOptions, FileItem } from 'ng2-file-upload';
import { Globals } from 'config';
import { Subject, BehaviorSubject } from 'rxjs';
import { BsModalService } from 'ngx-bootstrap';
import { SendingFormModalComponent } from '../npi/sending-form-modal/sending-form-modal.component';
import { isNgTemplate } from '@angular/compiler';

const uploadUrl = Globals.ENPI_SERVER_URL + '/files/upload'

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  public uploaders: Object = new Object()
  public onCompleteUpload: Subject<any>
  public progress: Number = 0
  public isUploading: Boolean = false
  public queue: Array<FileItem> = new Array()

  constructor(
    private modalService: BsModalService
  ) {
    console.log("Constructing uploader Service")
    this.onCompleteUpload = new Subject<any>()
  }

  getUploaders() {
    return this.uploaders
  }

  upload(npiNumber) {
    Object.keys(this.uploaders).forEach(subject => {
      console.log('Setting ' + subject)
      this.uploaders[subject].onBuildItemForm = (item, form) => {
        form.append('destination', npiNumber + '/' + subject)
      }
      this.uploaders[subject].uploadAll()
      console.log('is this async?')
    })
    return this.onCompleteUpload
  }

  addUploader(subject: string, uploader: FileUploader) {
    console.log('appending ' + uploader.queue.length + ' items')
    uploader.setOptions(
      {
        url: uploadUrl,
        authToken: localStorage.getItem('id_token')
      }
    )

    //uploader.onAfterAddingFile = (file) => { file.withCredentials = false; };
    this.queue.concat(uploader.queue)
    console.log(this.queue)
    uploader.onProgressAll = () => this.updateProgress()
    uploader.onBeforeUploadItem = () => this.isUploading = true
    uploader.onCompleteAll = () => {
      if (Object.values(this.uploaders).every((uploader: FileUploader) => !uploader.getNotUploadedItems.length)) {
        console.log("All files uploaded.")
        this.isUploading = false
        this.onCompleteUpload.next()
      }
    };

    uploader.onErrorItem = (file, res) => { console.log(res); throw Error(res) }
    Object.assign(this.uploaders, { [subject]: uploader })
  }

  updateProgress() {
    console.log('updating')
    let progress = 0
    Object.values(this.uploaders).forEach(uploader => {
      try {
      progress += uploader.progress * this.totalUploaderSize(uploader)
      } catch(e) { console.error(e)}
    })
    this.progress = progress / (this.totalSize() *1024 * 1024)
    console.log(progress)
  }

  totalUploaderSize(uploader) {
    let totalSize = 0
    let queue = uploader.queue
    for (let i = 0; i < queue.length; i++)
      totalSize += queue.file.size
    console.log('totalSize: '+ totalSize)
    return totalSize
  }

  totalSize() {
    let totalSize = 0
    let uploadersArr = Object.values(this.uploaders)
    for (let i = 0; i < uploadersArr.length; i++) {
      this.totalUploaderSize(uploadersArr[i])
    }
    console.log('totalSize: '+ totalSize)
    return totalSize
  }

  abort(){
    Object.values(this.uploaders).forEach((uploader: FileUploader) => {
      uploader.cancelAll()
    })
  }

  ngOnDestroy() {
    console.log("Destroying Uploader service")
  }
}
