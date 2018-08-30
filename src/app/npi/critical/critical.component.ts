import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { UtilService } from '../../services/util.service';
import { ActivatedRoute } from '@angular/router';
import { NpiComponent } from '../npi.component';

@Component({
  selector: 'app-critical',
  templateUrl: './critical.component.html',
  styleUrls: ['./critical.component.scss']
})
export class CriticalComponent implements OnInit {

  @Output() criticalForm = new EventEmitter<FormGroup>()
  @Input() npi

  criticalFormGroup : FormGroup
  signatures : Array<any>

  constructor(
    private fb: FormBuilder,
    private utils : UtilService,
    private route : ActivatedRoute,
    private npiComponent : NpiComponent
  ) {
    this.criticalFormGroup = fb.group({
      'critical' : fb.array([])
    })
    this.signatures = new Array<String>(5)
   }

  ngOnInit() {
    this.insertCriticalAnalisys()
    if (this.route.snapshot.data['readOnly']) 
      this.criticalFormGroup.disable()
    this.updateParentForm()

    this.loadSignatures()

    this.npiComponent.resetFormFlagSubject.subscribe(
      () => { this.fillFormData() }
    )
  }

  loadSignatures(){
    for (var i=0; i<this.npi.critical.length; i++){
      var row = this.npi.critical[i]
      if (row.signature && row.signature.date && row.signature.user) {
        var signature = row.signature.user.firstName + 
          (row.signature.user.lastName ? 
            ' '+row.signature.user.lastName :
            ''
          ) + ', ' + new Date(row.signature.date).toLocaleDateString('pt-br') +
          ', às ' + new Date(row.signature.date).toLocaleTimeString('pt-br')

        this.signatures[i] = signature
        }
    }
  }

  insertCriticalAnalisys(){
    var criticalFormArray = (this.criticalFormGroup.get('critical') as FormArray).controls
    var criticalModelArray = this.npi.critical

    criticalModelArray.forEach(analisys => {
      var criticalControl = this.fb.group(
        { 
          _id: analisys._id,
          status: analisys.status,
          comment: analisys.comment
          //signature: analisys.signature 
        }
      )
      criticalControl.valueChanges.subscribe(
        () => {
          this.updateParentForm()
        }
      )
      criticalFormArray.push(criticalControl)      
    });    
  }

  fillFormData(){
    var criticalFormArray = 
      (this.criticalFormGroup.get('critical') as FormArray).controls

    criticalFormArray.forEach(analisys => {
      var criticalRow = this.getCriticalRow(analisys.get('_id').value)
      console.log(criticalRow)
      analisys.setValue(
        { 
          status: criticalRow.status,
          comment: criticalRow.comment
          //signature: analisys.signature 
        }
      )
          });    
  }

  getCriticalRow(id){
    for (let i=0; i<this.npi.critical; i++){
      let critical = this.npi.critical[i]
      console.log(critical)
      if (critical._id == id)
        return critical
    }
  }

  updateParentForm(){
    this.criticalForm.emit(this.criticalFormGroup)
  }

  toggleStatus(i, event){
    event.stopPropagation()
    var statusControl = 
      ((this.criticalFormGroup.get('critical') as FormArray)
      .controls[i] as FormGroup).get('status')
    if(event.target.value == statusControl.value) statusControl.setValue(null)
  }
}
