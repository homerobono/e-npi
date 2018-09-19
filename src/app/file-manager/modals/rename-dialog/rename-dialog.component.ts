import { Component, OnInit, HostListener } from '@angular/core';
import { Subject } from 'rxjs';
import FileElement from '../../../models/file.model';
import { BsModalRef } from 'ngx-bootstrap';

@Component({
  selector: 'app-rename-dialog',
  templateUrl: './rename-dialog.component.html',
  styleUrls: ['./rename-dialog.component.scss']
})
export class RenameDialogComponent implements OnInit {

  onConfirm : Subject<String>
  newName: String
  element: FileElement

  constructor(private modalRef: BsModalRef) {
    this.onConfirm = new Subject()
  }

  @HostListener('window:keyup', ['$event'])
  keyUpEvent(e) {
    e.stopPropagation()
    if (e.keyCode == 13){
      this.renameConfirm()
    }
  }

  ngOnInit() {
    this.newName = this.element.name
  }

  renameConfirm(){
    this.onConfirm.next(this.newName)
    this.modalRef.hide()
  }

}
