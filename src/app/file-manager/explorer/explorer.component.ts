import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { Observable } from 'rxjs/Observable';
import { MatDialog } from '@angular/material/dialog';

import FileElement from '../../models/file.model'
import { NewFolderDialogComponent } from '../modals/new-folder-dialog/new-folder-dialog.component';
import { RenameDialogComponent } from '../modals/rename-dialog/rename-dialog.component';
import { element } from 'protractor';

@Component({
  selector: 'app-explorer',
  templateUrl: './explorer.component.html',
  styleUrls: ['./explorer.component.scss']
})
export class ExplorerComponent {

  constructor(public dialog: MatDialog) {}

  @Input() files: FileElement[];
  @Input() canNavigateUp: string;
  @Input() path: string;

  @Output() elementDownload = new EventEmitter<FileElement>();
  @Output() folderAdded = new EventEmitter<{ name: string }>();
  @Output() elementRemoved = new EventEmitter<string>();
  @Output() elementRenamed = new EventEmitter<string>();
  @Output() elementMoved = new EventEmitter<{ element: string; moveTo: string }>();
  @Output() navigatedDown = new EventEmitter<string>();
  @Output() navigatedUp = new EventEmitter();

  downloadElement(element: FileElement){
    this.elementDownload.emit(element)
  }

  deleteElement(element: FileElement) {
  //  this.elementRemoved.emit(element);
  }

  navigate(element: FileElement) {
    if (element.isFolder()) {
      this.navigatedDown.emit(element.name);
    }
  }

  navigateUp() {
    this.navigatedUp.emit();
  }

  moveElement(element: FileElement, moveTo: FileElement) {
    //this.elementMoved.emit({ element: element, moveTo: moveTo });
  }

  openNewFolderDialog() {
    let dialogRef = this.dialog.open(NewFolderDialogComponent);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.folderAdded.emit({ name: res });
      }
    });
  }

  openRenameDialog(element: FileElement) {
    let dialogRef = this.dialog.open(RenameDialogComponent);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        element.name = res;
        //this.elementRenamed.emit(element);
      }
    });
  }

  openMenu(event: MouseEvent, viewChild: MatMenuTrigger) {
    event.preventDefault();
    viewChild.openMenu();
  }
}
