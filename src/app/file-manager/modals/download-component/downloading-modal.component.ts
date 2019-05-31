import { Component, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { HttpEventType } from '@angular/common/http';
import { BsModalRef } from 'ngx-bootstrap';
import { saveAs } from 'file-saver'

@Component({
  selector: 'app-downloading-modal',
  templateUrl: './downloading-modal.component.html',
  styleUrls: ['./downloading-modal.component.scss']
})
export class DownloadingModalComponent implements OnInit {
  public downloading = false
  public complete = false
  public name: String
  public size: number = 0
  public speed: number = 0
  public progress: number = 0
  public oldProgress: number = 0

  private downloadItself: Subscription
  private prevTime

  constructor(
    public modalRef: BsModalRef
  ) { }

  ngOnInit() {
  }

  startUpload(downloadObservable, element) {
    console.log(element)
    this.prevTime = Date.now()
    let fileName = element.name + (element.isFolder() ? '.zip' : '')
    this.name = element.name
    this.size = element.size ? element.size : 0
    this.downloadItself = downloadObservable.subscribe((event: any) => {
      //console.log(event);
      switch (event.type) {
        case HttpEventType.Sent:
          console.log('Request sent!');
          break;
        case HttpEventType.ResponseHeader:
          console.log('Response header received!');
          break;
        case HttpEventType.DownloadProgress:
          //const kbLoaded = Math.round(event.loaded / 1024);
          let actTime = Date.now()
          let timeDiff = (actTime - this.prevTime) / 1000
          let progress = event.loaded
          this.progress = progress
          if (timeDiff > 1) {
            this.updateSpeed(this.oldProgress, progress, timeDiff)
            this.prevTime = actTime
            this.oldProgress = progress
          }
          //console.log(`Download in progress! ${kbLoaded}Kb loaded`);
          break;
        case HttpEventType.Response:
          console.log('😺 Done!', event.body);
          this.complete = true
          this.downloading = false
          saveAs(event.body, fileName)
          var downloadUrl = window.URL.createObjectURL(event.body);
          window.open(downloadUrl)
          setTimeout(() => this.modalRef.hide(), 200)
          break
      }
      /*
        saveAs(data, fileName)
        var downloadUrl = window.URL.createObjectURL(data);
        window.open(downloadUrl)
        this.downloadModalRef.hide()
        //return downloadUrl*/
    })
  }

  updateSpeed(progress1, progress2, timeDiff) {
    let speed = Math.abs(Math.round((progress2 - progress1) / timeDiff / 1024)) // kB/s
    //console.log(progress2, progress1, this.totalSize / 1024)
    this.speed = Math.round(this.speed == 0 ? speed : (this.speed + speed) / 2)
    //this.speed = speed < 1024 ? speed + 'kB/s' : (speed / 1024).toFixed(1) + 'MB/s'
  }

  abort() {
    this.downloadItself.unsubscribe()
    this.modalRef.hide()
  }
}
