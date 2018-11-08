import { Component, OnInit, HostListener } from '@angular/core';
import { Subject } from 'rxjs';
import FileElement from '../../../models/file.model';
import { BsModalRef } from 'ngx-bootstrap';

@Component({
  selector: 'app-rename-dialog',
  templateUrl: './input-dialog.component.html',
  styleUrls: ['./input-dialog.component.scss']
})
export class InputDialogComponent implements OnInit {

  onConfirm : Subject<String>
  newName: String
  element: FileElement
  actionLabel: String

  constructor(public modalRef: BsModalRef) {
    this.onConfirm = new Subject()
    this.actionLabel = 'Digite um nome:'
  }

  @HostListener('window:keyup', ['$event'])
  keyUpEvent(e) {
    e.stopPropagation()
    if (e.keyCode == 13){
      this.confirm()
    }
  }

  ngOnInit() {
    if (this.element) this.newName = this.element.name
  }

  confirm(){
    this.onConfirm.next(this.newName)
    this.modalRef.hide()
  }

}
