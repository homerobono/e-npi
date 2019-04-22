import { Injectable } from '@angular/core';
import { FileUploader, FileUploaderOptions, FileItem } from 'ng2-file-upload';
import { Globals } from 'config';
import { Subject, BehaviorSubject, of, Observable } from 'rxjs';
import { BsModalService } from 'ngx-bootstrap';
import { SendingFormModalComponent } from '../npi/sending-form-modal/sending-form-modal.component';
import { isNgTemplate } from '@angular/compiler';

const uploadUrl = Globals.ENPI_SERVER_URL + '/files/upload'

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  public uploaders: Object = new Object()
  public onCompleteUpload: BehaviorSubject<any>
  public onCompleteUploadReplay: Observable<any>
  public totalSize: number
  public progress: Number = 0
  public isUploading: Boolean = false
  public uploadingFileItem: FileItem
  public _id: Number
  public evolve = false
  public speed: number = 0
  private prevTime: number = Date.now()

  constructor() {
    console.log("Constructing uploader Service")
    this.onCompleteUpload = new BehaviorSubject<Boolean>(false)
    this.onCompleteUploadReplay = this.onCompleteUpload.asObservable()
    this.uploaders = new Object()
  }

  getUploaders() {
    return this.uploaders
  }

  sortByTotalSize() {
    let sizeOfUploader = this.totalUploaderSize
    let getUploader = (field) => { return this.uploaders[field] }
    return function (a, b) {
      return (sizeOfUploader(getUploader(a)) - sizeOfUploader(getUploader(b)))
    }
  }

  upload(id) {
    this._id = id
    let fields = Object.keys(this.uploaders)

    if(!fields.length) {
      this.onCompleteUpload.next(true)
      this.onCompleteUpload.next(false)
      return of(['No uploads to make'])
    }

    fields.sort(this.sortByTotalSize())
    //console.log(fields)

    this.uploaders[fields[0]].uploadAll()
    for (let i = 1; i < fields.length; i++) {
      console.log('setting ' + fields[i])
      let previous = fields[i - 1]
      let actual = fields[i]
      this.uploaders[previous].onCompleteAll = (res) => {
        console.log('uploading another one', res)
        setTimeout(() => this.uploaders[actual].uploadAll(), 100)
      }
    }
    this.prevTime = Date.now()
    this.uploaders[fields[0]].uploadAll()

    return this.onCompleteUpload
  }

  addUploader(subject: string, uploader: FileUploader) {
    if (!uploader.queue.length) {
      if (this.upload[subject])
        this.upload[subject].destroy()
      delete this.uploaders[subject]
      return
    }

    uploader.setOptions(
      {
        url: uploadUrl,
        authToken: localStorage.getItem('id_token')
      }
    )

    uploader.onAfterAddingFile = (file) => { file.withCredentials = false; };
    uploader.onProgressAll = () => this.updateProgress()
    uploader.onBeforeUploadItem = (fileItem) => {
      this.isUploading = true
      this.uploadingFileItem = fileItem
    }
    uploader.onCompleteAll = () => {
      if (Object.values(this.uploaders).every((uploader: FileUploader) => !uploader.getNotUploadedItems.length)) {
        console.log("All files uploaded.")
        this.isUploading = false
        this.onCompleteUpload.next(true)
        this.onCompleteUpload.next(false)
        this.cleanUp()
      }
    };

    uploader.onErrorItem = (file, res) => { console.log(res) }
    uploader.onBuildItemForm = (_, form) => {
      form.append('destination', this._id + '/' + subject)
      form.append('_id', this._id)
      form.append('evolve', this.evolve)
    }
    Object.assign(this.uploaders, { [subject]: uploader })
    this.updateTotalSize()
    console.log (subject, this.uploaders)
  }

  cleanUp() {
    for (var field in this.uploaders) {
      if (this.uploaders.hasOwnProperty(field)) {
        this.uploaders[field].destroy()
        delete this.uploaders[field]
      }
    }
    this.progress = 0
    this.totalSize = 0
    this.speed = 0
    delete this.uploadingFileItem
    delete this._id
  }

  updateSpeed(progress1, progress2, timeDiff) {
      let speed = Math.abs(Math.round((progress2 - progress1) * this.totalSize / timeDiff / 100 / 1024)) // kB/s
      console.log(progress2, progress1, this.totalSize/1024)
      this.speed = Math.round(this.speed == 0 ? speed : (this.speed+speed)/2)
      //this.speed = speed < 1024 ? speed + 'kB/s' : (speed / 1024).toFixed(1) + 'MB/s'
  }

  updateProgress() {
    let progress = 0
    Object.values(this.uploaders).forEach(uploader => {
      try {
        progress += uploader.progress * this.totalUploaderSize(uploader)
      } catch (e) { console.error(e) }
    })
    progress = Math.round(progress / this.totalSize)
    let actTime = Date.now()
    let timeDiff = (actTime - this.prevTime) / 1000
    //if (timeDiff > 1) {
      this.prevTime = actTime
      this.updateSpeed(this.progress, progress, timeDiff)
    //}
    this.progress = progress
    //console.log(progress)
//    console.log(this.uploadingFileItem)
  }

  totalUploaderSize(uploader) {
    let totalSize = 0
    let queue = uploader.queue
    for (let i = 0; i < queue.length; i++)
      totalSize += queue[i].file.size
    //console.log('totalSize: '+ totalSize)
    return totalSize
  }

  updateTotalSize() {
    let totalSize = 0
    let uploadersArr = Object.values(this.uploaders)
    for (let i = 0; i < uploadersArr.length; i++) {
      totalSize += this.totalUploaderSize(uploadersArr[i])
    }
    console.log('totalSize: '+ totalSize)
    this.totalSize = totalSize
  }

  abort() {
    Object.values(this.uploaders).forEach((uploader: FileUploader) => {
      uploader.cancelAll()
    })
  }

  ngOnDestroy() {
    console.log("Destroying Uploader service")
  }
}
