import { Component, OnInit } from '@angular/core';
import { File } from '../models/file.model';
import { Observable } from 'rxjs/Observable';
import { FileService } from '../services/file.service';

@Component({
  selector: 'app-file-manager',
  templateUrl: './file-manager.component.html',
  styleUrls: ['./file-manager.component.scss']
})
export class FileManagerComponent implements OnInit {
  
  files: Observable<File[]>;
  currentRoot: File;
  currentPath: string;
  canNavigateUp = false;

  constructor(
    private fileService: FileService
  ) { }

  ngOnInit() {
    const folderA = this.fileService.add({ name: 'Folder A', isFolder: true, parent: 'root' });
    this.fileService.add({ name: 'Folder B', isFolder: true, parent: 'root' });
    this.fileService.add({ name: 'Folder C', isFolder: true, parent: folderA.id });
    this.fileService.add({ name: 'File A', isFolder: false, parent: 'root' });
    this.fileService.add({ name: 'File B', isFolder: false, parent: 'root' });

    this.updateFileQuery();
  }

  addFolder(folder: { name: string }) {
    this.fileService.add({ isFolder: true, name: folder.name, parent: this.currentRoot ? this.currentRoot.id : 'root' });
    this.updateFileQuery();
  }
  
  removeElement(element: File) {
    this.fileService.delete(element.id);
    this.updateFileQuery();
  }
  
  moveElement(event: { element: File; moveTo: File }) {
    this.fileService.update(event.element.id, { parent: event.moveTo.id });
    this.updateFileQuery();
  }
  
  renameElement(element: File) {
    this.fileService.update(element.id, { name: element.name });
    this.updateFileQuery();
  }

  updateFileQuery() {
    this.files = this.fileService.queryInFolder(this.currentRoot ? this.currentRoot.id : 'root');
  }

  navigateUp() {
    if (this.currentRoot && this.currentRoot.parent === 'root') {
      this.currentRoot = null;
      this.canNavigateUp = false;
      this.updateFileQuery();
    } else {
      this.currentRoot = this.fileService.get(this.currentRoot.parent);
      this.updateFileQuery();
    }
    this.currentPath = this.popFromPath(this.currentPath);
  }
  
  navigateToFolder(element: File) {
    this.currentRoot = element;
    this.updateFileQuery();
    this.currentPath = this.pushToPath(this.currentPath, element.name);
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
