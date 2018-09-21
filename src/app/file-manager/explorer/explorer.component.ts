import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { Observable } from 'rxjs/Observable';
import { MatDialog } from '@angular/material/dialog';

import FileElement from '../../models/file.model'
import { InputDialogComponent } from '../modals/input-dialog/input-dialog.component';
import { element } from 'protractor';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';

@Component({
  selector: 'app-explorer',
  templateUrl: './explorer.component.html',
  styleUrls: ['./explorer.component.scss']
})
export class ExplorerComponent {

  modalRef: BsModalRef

  constructor(
    private modalService: BsModalService,
  ) { }

  @Input() files: FileElement[];
  @Input() folders: FileElement[];
  @Input() canNavigateUp: string;
  @Input() path: string;

  @Output() elementDownload = new EventEmitter<FileElement>();
  @Output() folderAdded = new EventEmitter<{ name: string }>();
  @Output() elementRemoved = new EventEmitter<FileElement>();
  @Output() elementRenamed = new EventEmitter<{ element: FileElement, newName: string }>();
  @Output() elementMoved = new EventEmitter<{ element: FileElement, moveTo: FileElement }>();
  @Output() navigatedDown = new EventEmitter<string>();
  @Output() navigatedUp = new EventEmitter();

  ngOnInit() {
    setTimeout(() => console.log(this.folders), 400)
    setTimeout(() => console.log(this.files), 400)
  }

  downloadElement(element: FileElement) {
    this.elementDownload.emit(element)
  }

  deleteElement(element: FileElement) {
    this.elementRemoved.emit(element);
  }

  navigate(element: FileElement) {
    if (element.isFolder()) {
      this.navigatedDown.emit(element.name);
    }
  }

  navigateUp() {
    this.navigatedUp.emit();
  }

  moveToParent(element: FileElement) {
    this.elementMoved.emit({ element: element, moveTo: null });
  }

  moveElement(element: FileElement, moveTo: FileElement) {
    this.elementMoved.emit({ element: element, moveTo: moveTo });
  }

  openRenameDialog(element: FileElement) {
    this.modalRef = this.modalService.show(InputDialogComponent, { 
      initialState: { 
        element,
        actionLabel: 'Digite o nome' + ( element.isFolder() ? 'da pasta:' : 'do arquivo:' )
      }, 
      class: "modal-sm shadow-lg vertically-centered" 
    });
    this.modalRef.content.onConfirm.subscribe(name => {
      if (name != "") {
        this.elementRenamed.emit({element: element, newName: name});
      }
    });
  }

  openMenu(event: MouseEvent, viewChild: MatMenuTrigger) {
    event.preventDefault();
    viewChild.openMenu();
    console.log(this.folders)
  }

  availableFolders(element : FileElement) {
    if (this.folders)
      return this.folders.filter(f => f.name != element.name)
    return null
  }
}
