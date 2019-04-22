import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import FileElement from '../models/file.model';
import { Observable } from 'rxjs/Observable';
import { FileService } from '../services/file.service';
import { saveAs } from 'file-saver'
import { BsModalRef, BsModalService, ModalDirective } from 'ngx-bootstrap';
import { InputDialogComponent } from './modals/input-dialog/input-dialog.component';
import { FileUploader } from 'ng2-file-upload';
import { Globals } from 'config';
import { UploadService } from '../services/upload.service';
import { PreviewComponent } from './modals/preview/preview.component';
import { UploaderComponent } from './uploader/uploader.component';

@Component({
  selector: 'app-file-manager',
  templateUrl: './file-manager.component.html',
  styleUrls: ['./file-manager.component.scss']
})
export class FileManagerComponent implements OnInit {

  files: Observable<FileElement[]>;
  folders: Observable<FileElement[]>;
  rootPath: String;
  npiId: String;
  field: String;
  relativePath: String;
  currentPath: String;
  canNavigateUp = false;

  constructor(
    public modalRef: BsModalRef,
    private modalService: BsModalService,
    private fileService: FileService,
    private uploader: UploadService
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
    this.modalRef = this.modalService.show(InputDialogComponent, {
      initialState: {
        actionLabel: 'Digite o nome da pasta:'
      },
      class: "modal-sm shadow-lg vertically-centered"
    }
    );
    this.modalRef.content.onConfirm.subscribe(name => {
      if (name != "") {
        this.addFolder({ name });
      }
    });
  }

  openPreview(element: FileElement) {
    console.log(element)
    this.modalRef = this.modalService.show(PreviewComponent, {
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
    let fileName = 'NPI#' + this.currentPath.replace(/\//g, '') + ' Anexos.zip'
    console.log(fileName)
    this.fileService.download(this.currentPath, '').subscribe(
      data => {
        console.log('saving data')
        saveAs(data, fileName)
      }
    )
  }

  downloadElement(element: FileElement) {
    let fileName = element.name + (element.isFolder() ? '.zip' : '')
    this.fileService.download(this.currentPath, element.name).subscribe(
      data => {
        console.log('saving data: ', data)
        saveAs(data, fileName)
        var downloadUrl = window.URL.createObjectURL(data);
        window.open(downloadUrl)
        //return downloadUrl
      }
    )
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
    this.modalRef = this.modalService.show(UploaderComponent, {
      initialState: { field: this.field },
      class: 'modal-lg modal-dialog-centered upload-modal'
    });
  }

}
