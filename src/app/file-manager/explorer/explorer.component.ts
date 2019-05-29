import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { Observable } from 'rxjs/Observable';
import { MatDialog } from '@angular/material/dialog';

import FileElement from '../../models/file.model'
import { InputDialogComponent } from '../modals/input-dialog/input-dialog.component';
import { element } from 'protractor';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { PreviewComponent } from '../modals/preview/preview.component';

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
  @Input() editFlag: Boolean;

  @Output() elementDownload = new EventEmitter<FileElement>();
  @Output() preview = new EventEmitter<FileElement>();
  @Output() folderAdded = new EventEmitter<{ name: string }>();
  @Output() elementRemoved = new EventEmitter<FileElement>();
  @Output() elementRenamed = new EventEmitter<{ element: FileElement, newName: string }>();
  @Output() elementMoved = new EventEmitter<{ element: FileElement, moveTo: FileElement }>();
  @Output() navigatedDown = new EventEmitter<string>();
  @Output() navigatedUp = new EventEmitter();

  ngOnInit() {
    //setTimeout(() => console.log(this.folders), 400)
    //setTimeout(() => console.log(this.files), 400)
  }

  downloadElement(element: FileElement) {
    this.elementDownload.emit(element)
  }

  open(event: MouseEvent, element: FileElement): void {
    event.stopPropagation()
    if (element.isFolder())
      this.navigate(element)
    else if (this.canPreview(element))
      this.openPreview(element)
    else this.downloadElement(element)
  }

  openPreview(element: FileElement): void {
    this.preview.emit(element)
  }

  canPreview(element): Boolean {
    if (element) {
      let extension = element.name.split('.').pop()
      if (['pdf'].some(ext => extension.includes(ext)) ||
        ['jpg', 'jpeg', 'bmp', 'png', 'gif'].some(ext => extension.includes(ext)))
        return true
    }
    return false
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
        actionLabel: 'Digite o nome' + (element.isFolder() ? 'da pasta:' : 'do arquivo:')
      },
      class: "modal-sm shadow-lg vertically-centered"
    });
    this.modalRef.content.onConfirm.subscribe(name => {
      if (name != "") {
        this.elementRenamed.emit({ element: element, newName: name });
      }
    });
  }

  openMenu(event: MouseEvent, viewChild: MatMenuTrigger) {
    if (event.type == 'contextmenu') {
      event.preventDefault();
      viewChild.openMenu();
    }
  }

  availableFolders(element: FileElement) {
    if (this.folders)
      return this.folders.filter(f => f.name != element.name)
    return null
  }

  iconFor(element: FileElement) {
    if (element.isFolder()) return "fa-folder text-primary"

    let extension = element.name.split('.').pop();

    let returnClass = "fa-file"

    if (['doc', 'odt'].some(ext => extension.includes(ext))) {
      returnClass += "-word-o text-primary"
    }
    else if (['txt', 'dat', 'log'].some(ext => extension.includes(ext))) {
      returnClass += "-text text-secondary"
    }
    else if (['pdf'].some(ext => extension.includes(ext))) {
      returnClass += "-pdf-o text-danger"
    }
    else if (['xls'].some(ext => extension.includes(ext))) {
      returnClass += "-excel-o text-success"
    }
    else if (['ppt'].some(ext => extension.includes(ext))) {
      returnClass += "-powerpoint-o text-orange"
    }
    else if (['zip', 'rar', '7z', 'tar', 'xz'].some(ext => extension.includes(ext))) {
      returnClass += "-archive-o text-purple"
    }
    else if (['firm', 'rom', 'eprom', 'html', 'css', 'js', 'ts', 'json', 'conf', 'cfg'].some(ext => extension.includes(ext))) {
      returnClass += "-code-o text-secondary"
    }
    else if (['jpg', 'jpeg', 'psd', 'png', 'gif', 'ai', 'cdr', 'bmp', 'svg', 'ps'].some(ext => extension.includes(ext))) {
      returnClass += "-image-o text-success"
    }
    else if (['mp4', 'avi', 'mpg', 'mpeg', 'mkv', 'wmv', 'mov'].some(ext => extension.includes(ext))) {
      returnClass += "-video-o text-warning"
    }
    else if (['wav', 'mp3', 'ogg', 'aac', 'flac'].some(ext => extension.includes(ext))) {
      returnClass += "-audio-o text-warning"
    }
    else
      returnClass += "-o text-secondary"
    return returnClass
  }

}
