import { Component, OnInit, Inject } from '@angular/core';
import FileElement from '../models/file.model';
import { Observable } from 'rxjs/Observable';
import { FileService } from '../services/file.service';
import { MAT_DIALOG_DATA } from '@angular/material';
import { saveAs } from 'file-saver'

@Component({
  selector: 'app-file-manager',
  templateUrl: './file-manager.component.html',
  styleUrls: ['./file-manager.component.scss']
})
export class FileManagerComponent implements OnInit {

  files: Observable<FileElement[]>;
  rootPath: string;
  relativePath: string;
  currentPath: string;
  canNavigateUp = false;

  constructor(
    private fileService: FileService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log(this.data.root)
    this.rootPath = data.root
    this.currentPath = this.rootPath
    this.relativePath = '/'
  }

  ngOnInit() {
    this.updateFileQuery();
  }

  addFolder(event: { name: string }) {
    this.fileService.add(this.currentPath, event.name);
    this.updateFileQuery();
  }

  downloadElement(event: FileElement){
    this.fileService.download(this.currentPath, event.name).subscribe(
      data => saveAs(data, event.name)
    )
  }

  removeElement(element: FileElement) {
    //this.fileService.delete(element.id);
    this.updateFileQuery();
  }

  moveElement(event: { element: FileElement; moveTo: FileElement }) {
    //this.fileService.update(event.element.id, { parent: event.moveTo.id });
    this.updateFileQuery();
  }

  renameElement(element: FileElement) {
    //this.fileService.update(element.id, { name: element.name });
    this.updateFileQuery();
  }

  updateFileQuery() {
    this.files = this.fileService.list(this.currentPath, null)
    //this.files = this.fileService.queryInFolder(this.currentRoot ? this.currentRoot : 'root');
  }

  navigateUp() {
    this.currentPath = this.popFromPath(this.currentPath);
    this.relativePath = this.popFromPath(this.relativePath);
    this.updateFileQuery();
    if (this.rootPath == this.currentPath) {
      this.canNavigateUp = false;
    }
  }

  navigateToFolder(path: string) {
    this.currentPath = this.pushToPath(this.currentPath, path);
    this.relativePath = this.pushToPath(this.relativePath, path);
    this.updateFileQuery();
    this.canNavigateUp = true;
  }

  pushToPath(path: string, folderName: string) {
    let p = path ? path : '';
    p += `${folderName}/`;
    return p;
  }

  popFromPath(path: string) {
    let p = path ? path : '';
    let split = p.split('/');
    split.splice(split.length - 2, 1);
    p = split.join('/');
    return p;
  }

}
