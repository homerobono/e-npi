import { Component, OnInit, HostListener } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';
import Npi from '../../models/npi.model';
import { Subject } from 'rxjs';
import { UtilService } from '../../services/util.service';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-npi-chooser-modal',
  templateUrl: './npi-chooser-modal.component.html',
  styleUrls: ['./npi-chooser-modal.component.scss']
})
export class NpiChooserModalComponent implements OnInit {

  npisList: Npi[]
  onConfirm: Subject<Npi>
  selectedNpi: Npi
  filterForm: FormGroup
  filteredData: Npi[]

  constructor(
    private fb: FormBuilder,
    public modalRef: BsModalRef,
    private utils: UtilService
  ) {
    this.onConfirm = new Subject<Npi>()
    this.selectedNpi = null
    this.filteredData = []

    this.filterForm = fb.group({
      name: null,
      entry: null,
    })
    this.filterForm.valueChanges.subscribe(
      res => this.applyFilter(res),
    )
  }

  ngOnInit() {
    this.npisList = this.npisList.filter((item: any) => {
      return item.stage != 1
    });
    this.applyFilter(this.filterForm.value)
  }

  @HostListener('window:keyup', ['$event'])
  keyUpEvent(e) {
    e.stopPropagation()
    if (e.keyCode == 13) {
      this.confirm()
    }
  }

  /*@HostListener('window:dblclick', ['$event'])
  doubleClick(e) {
    e.stopPropagation()
    this.confirm()
  }*/

  selectNpi(npi) {
    if (this.selectedNpi)
      document.getElementById(this.selectedNpi.number.toString()).classList.remove("active")
    document.getElementById(npi.number).classList.add("active")
    this.selectedNpi = npi
  }

  confirm() {
    this.onConfirm.next(this.selectedNpi)
    this.modalRef.hide()
  }

  applyFilter(filterFields) {
    //console.log(filterFields)
    let filteredData: Array<Npi> = this.npisList;
    for (let filterField in filterFields) {
      let filterString = filterFields[filterField]
      //console.log(filterString)
      if (filterString != null && filterString != '') {
        //console.log('filtering')
        try {
          filteredData = filteredData.filter((item: any) => {
            return item[filterField].toString().match(new RegExp(filterString, 'i'));
          });
        } catch (e) {
          console.log(e)
        }
      }
    }
    this.filteredData = filteredData
    //console.log(filteredData)
    //return filteredData
  }

}
