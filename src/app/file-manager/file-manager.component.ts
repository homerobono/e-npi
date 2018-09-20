import { Component, OnInit, Inject } from '@angular/core';
import FileElement from '../models/file.model';
import { Observable } from 'rxjs/Observable';
import { FileService } from '../services/file.service';
import { saveAs } from 'file-saver'
import { BsModalRef } from 'ngx-bootstrap';
import { MatDialog } from '@angular/material/dialog';
import { NewFolderDialogComponent } from './modals/new-folder-dialog/new-folder-dialog.component';
import { FileUploader } from 'ng2-file-upload';
import { Globals } from 'config';
import { UploadService } from '../services/upload.service';
import { of } from 'rxjs';

@Component({
  selector: 'app-file-manager',
  templateUrl: './file-manager.component.html',
  styleUrls: ['./file-manager.component.scss']
})
export class FileManagerComponent implements OnInit {

  files: Observable<FileElement[]>;
  folders: Observable<FileElement[]>;
  rootPath: String;
  relativePath: String;
  currentPath: String;
  canNavigateUp = false;

  constructor(
    public dialog: MatDialog,
    public modalRef: BsModalRef,
    private fileService: FileService,
    private uploader: UploadService
  ) {
  }

  ngOnInit() {
    this.currentPath = this.rootPath
    this.relativePath = '/'
    this.updateFileQuery();
    console.log(this.rootPath)
  }

  openNewFolderDialog() {
    let dialogRef = this.dialog.open(NewFolderDialogComponent);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.addFolder({ name: res });
      }
    });
  }

  addFolder(event: { name: String }) {
    this.fileService.add(this.currentPath, event.name).subscribe(
      res => this.updateFileQuery(),
      err => console.log(err)
      )
  }

  uploadElements(){
    this.uploader.upload(this.currentPath)
    this.uploader.onCompleteUpload.subscribe(
      () => {
        this.updateFileQuery()
      }
    )
  }

  downloadElement(element: FileElement) {
    let fileName = element.name + (element.isFolder() ? '.zip' : '')
    this.fileService.download(this.currentPath, element.name).subscribe(
      data => saveAs(data, fileName)
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
      ( moveTo ? this.currentPath : this.popFromPath(this.currentPath) ) 
      + event.moveTo.name ).subscribe(
      res => this.updateFileQuery(),
      err => console.log(err)
      )
  }

  renameElement(event: {element: FileElement, newName: String}) {
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

}
