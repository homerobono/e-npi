import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';
import Npi from '../../models/npi.model';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-npi-chooser-modal',
  templateUrl: './npi-chooser-modal.component.html',
  styleUrls: ['./npi-chooser-modal.component.scss']
})
export class NpiChooserModalComponent implements OnInit {

  npisList : Npi[]
  onConfirm : Subject<Npi>
  selectedNpi : Npi

  constructor(public modalRef: BsModalRef) {
    this.onConfirm = new Subject<Npi>()
  }

  ngOnInit() {
  }

  selectNpi(npi){
    this.selectedNpi = npi
  }

  confirm(){
    this.onConfirm.next(this.selectedNpi)
    this.modalRef.hide()
  }

}
