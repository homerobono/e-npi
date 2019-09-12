import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import FileElement from '../models/file.model';
import { Observable } from 'rxjs/Observable';
import { FileService } from '../services/file.service';
import { saveAs } from 'file-saver'
import { BsModalRef, BsModalService, ModalDirective } from 'ngx-bootstrap';
import { InputDialogComponent } from './modals/input-dialog/input-dialog.component';
import { FileUploader, FileItem } from 'ng2-file-upload';
import { Globals } from 'config';
import { UploadService } from '../services/upload.service';
import { PreviewComponent } from './modals/preview/preview.component';
import { UploaderComponent } from './uploader/uploader.component';
import { DownloadingModalComponent } from './modals/download-component/downloading-modal.component';
import { HttpEventType, HttpEvent } from '@angular/common/http';
import { UtilService } from '../services/util.service';
import { Subject, of } from 'rxjs';

@Component({
  selector: 'app-file-manager',
  templateUrl: './file-manager.component.html',
  styleUrls: ['./file-manager.component.scss']
})
export class FileManagerComponent implements OnInit {

  onConfirm = new Subject<any>()
  files: Observable<FileElement[]>;
  filesToUpload: Observable<FileElement[]>;
  folders: Observable<FileElement[]>;
  rootPath: String;
  npiId: String;
  field: String;
  npiNumber: Number;
  npiVersion: Number;
  relativePath: String;
  currentPath: String;
  canNavigateUp = false;
  editFlag: Boolean;
  title: string
  footer: string
  
  constructor(
    public modalRef: BsModalRef,
    public downloadModalRef: BsModalRef,
    public subModalRef: BsModalRef,
    private modalService: BsModalService,
    private fileService: FileService,
    private uploader: UploadService,
    private utils: UtilService
  ) {
  }

  ngOnInit() {
    this.rootPath = this.npiId + '/' + this.field + '/'
    this.currentPath = this.rootPath
    this.relativePath = '/'
    this.updateFileQuery();
    console.log(this.rootPath)
    //setTimeout(() => this.openPreview(files[0]), 400)
  }

  openNewFolderDialog() {
    this.subModalRef = this.modalService.show(InputDialogComponent, {
      initialState: {
        actionLabel: 'Digite o nome da pasta:'
      },
      class: "modal-sm shadow-lg vertically-centered"
    }
    );
    this.subModalRef.content.onConfirm.subscribe(name => {
      if (name != "") {
        this.addFolder({ name });
      }
    });
  }

  openPreview(element: FileElement) {
    console.log(element)
    this.subModalRef = this.modalService.show(PreviewComponent, {
      initialState: {
        currentPath: this.currentPath,
        element,
      },
      class: "shadow-lg mt-5 p-0 text-center preview-modal"
    });
  }

  addFolder(event: { name: String }) {
    this.fileService.add(this.currentPath, event.name).subscribe(
      res => this.updateFileQuery(),
      err => console.log(err)
    )
  }

  uploadElements() {
    this.uploader.upload(this.currentPath)
    this.uploader.onCompleteUpload.subscribe(
      () => {
        this.updateFileQuery()
      }
    )
  }

  downloadAll() {
    let fieldLabel = this.utils.getLabel(this.field)
    console.log(fieldLabel)
    let fileName = `NPI-${this.npiNumber}-v${this.npiVersion}-${fieldLabel.replace(/ /g, '_')}-Anexos.zip`
    console.log(fileName)
    /*this.fileService.download(this.currentPath, '').subscribe(
      data => {
        console.log('saving data')
        saveAs(data, fileName)
        this.downloadModalRef.hide()
      }
    )*/
    this.downloadModalRef = this.modalService.show(DownloadingModalComponent, {
      class: 'modal-md modal-dialog-centered',
      backdrop: 'static',
      keyboard: false
    })
    this.downloadModalRef.content.downloading = true
    this.downloadModalRef.content.downloadObservable =
      //this.fileService.getData(this.currentPath, element.name)
      this.downloadModalRef.content.startUpload(this.fileService.download(this.currentPath, ''), new FileElement({ name: fileName }))
  }

  downloadElement(element: FileElement) {
    //this.openDownloadModal()
    this.downloadModalRef = this.modalService.show(DownloadingModalComponent, {
      class: 'modal-md modal-dialog-centered',
      backdrop: 'static',
      keyboard: false
    })
    this.downloadModalRef.content.downloading = true
    this.downloadModalRef.content.downloadObservable =
      //this.fileService.getData(this.currentPath, element.name)
      this.downloadModalRef.content.startUpload(this.fileService.download(this.currentPath, element.name), element)
  }

  removeElement(element: FileElement) {
    this.fileService.delete(this.currentPath, element.name).subscribe(
      res => this.updateFileQuery(),
      err => console.log(err)
    )
  }

  moveElement(event: { element: FileElement; moveTo: FileElement }) {
    this.fileService.move(this.currentPath, event.element.name,
      (event.moveTo ? this.currentPath + event.moveTo.name : this.popFromPath(this.currentPath))
    ).subscribe(
      res => this.updateFileQuery(),
      err => console.log(err)
    )
  }

  renameElement(event: { element: FileElement, newName: String }) {
    this.fileService.rename(this.currentPath, event.element.name, event.newName).subscribe(
      res => this.updateFileQuery(),
      err => console.log(err)
    )
  }

  updateFileQuery() {
    this.files = this.fileService.list(this.currentPath, null)
    if (this.uploader.uploaders[this.field as string] && this.uploader.uploaders[this.field as string].queue)
      this.filesToUpload = of(
        this.uploader.uploaders[this.field as string].queue
          .map((fI: FileItem) => new FileElement(fI.file))
      )
    this.folders = this.files.map((files) => files.filter(e => e.isFolder()))
  }

  navigateUp() {
    if (this.canNavigateUp) {
      this.currentPath = this.popFromPath(this.currentPath);
      this.relativePath = this.popFromPath(this.relativePath);
      this.updateFileQuery();
      if (this.rootPath == this.currentPath) {
        this.canNavigateUp = false;
      }
    }
  }

  navigateToFolder(path: String) {
    this.currentPath = this.pushToPath(this.currentPath, path);
    this.relativePath = this.pushToPath(this.relativePath, path);
    this.updateFileQuery();
    this.canNavigateUp = true;
  }

  pushToPath(path: String, folderName: String) {
    let p = path ? path : '';
    p += `${folderName}/`;
    return p;
  }

  popFromPath(path: String) {
    let p = path ? path : '';
    let split = p.split('/');
    split.splice(split.length - 2, 1);
    p = split.join('/');
    return p;
  }

  openUploadModal() {
    this.subModalRef = this.modalService.show(UploaderComponent, {
      initialState: { field: this.field },
      class: 'modal-lg modal-dialog-centered upload-modal'
    });
  }

  openDownloadModal() {
    this.downloadModalRef = this.modalService.show(DownloadingModalComponent, {
      class: 'modal-md modal-dialog-centered',
      backdrop: 'static',
      keyboard: false
    })
    this.downloadModalRef.content.downloading = true
  }

  cancel() {
    this.onConfirm.next(false)
    this.modalRef.hide()
  }

  close() {
    this.onConfirm.next(null)
    this.modalRef.hide()
  }

  confirm() {
    this.onConfirm.next(true)
    this.close()
  }

}
