import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import Npi from '../../../models/npi.model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.scss']
})
export class ClientComponent implements OnInit {

  @Input() npi: Npi
  @Output() npiFormOutput = new EventEmitter<FormGroup>()
  
  npiForm : FormGroup
  deny : FormControl

  constructor(
    private fb : FormBuilder,
    private route : ActivatedRoute
  ) { 
    this.npiForm = fb.group({
      'clientApproval' : fb.group({
        'approval' : null,
        'comment' : null
      })
    })
  }

  ngOnInit() {
    if (this.route.snapshot.data['readOnly']) 
      this.npiForm.disable()
    this.npiFormOutput.emit(this.npiForm)
    this.deny = (this.npiForm.get("clientApproval") as FormGroup).controls['approval'] as FormControl

    this.fillFormData()
  }

  fillFormData(){
    this.npiForm.get("clientApproval").setValue({
      'approval' : this.npi.clientApproval.approval,
      'comment' : this.npi.clientApproval.comment
    })
  }

}
