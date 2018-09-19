import { Component, OnInit, Inject } from '@angular/core';
import FileElement from '../models/file.model';
import { Observable } from 'rxjs/Observable';
import { FileService } from '../services/file.service';
import { saveAs } from 'file-saver'
import { BsModalRef } from 'ngx-bootstrap';

@Component({
  selector: 'app-file-manager',
  templateUrl: './file-manager.component.html',
  styleUrls: ['./file-manager.component.scss']
})
export class FileManagerComponent implements OnInit {

  files: Observable<FileElement[]>;
  rootPath: String;
  relativePath: String;
  currentPath: String;
  canNavigateUp = false;

  constructor(
    public modalRef: BsModalRef,
    private fileService: FileService
  ) { }

  ngOnInit() {
    this.currentPath = this.rootPath
    this.relativePath = '/'
    this.updateFileQuery();
    console.log(this.rootPath)
  }

  addFolder(event: { name: String }) {
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
