import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { UtilService } from '../../../services/util.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-critical',
  templateUrl: './critical.component.html',
  styleUrls: ['./critical.component.scss']
})
export class CriticalComponent implements OnInit {

  @Output() criticalForm = new EventEmitter<FormArray>()
  @Input() npi

  criticalFormGroup : FormGroup

  constructor(
    private fb: FormBuilder,
    private utils : UtilService,
    private route: ActivatedRoute
  ) {
    this.criticalFormGroup = fb.group({
      'critical' : fb.array([])
    })
   }

  ngOnInit() {
    this.insertCriticalAnalisys()
    if (this.route.snapshot.data['readOnly']) this.criticalFormGroup.disable()
    
  }

  insertCriticalAnalisys(){
    var criticalFormArray = (this.criticalFormGroup.get('critical') as FormArray).controls
    var criticalModelArray = this.npi.critical

    criticalModelArray.forEach(analisys => {
      var criticalControl = this.fb.group(
        { 
          status: analisys.status,
          comment: analisys.comment, 
          signature: analisys.signature 
        }
      )
      criticalControl.valueChanges.subscribe(
        () => {
          console.log('form changed ')
          this.updateParentForm()
        }
      )
      criticalFormArray.push(criticalControl)      
    });    
  }

  updateParentForm(){
    console.log('called update parent')
    this.criticalForm.emit(this.criticalFormGroup.get('critical') as FormArray)
  }

  toggleStatus(i, event){
    event.stopPropagation()
    var statusControl = 
      ((this.criticalFormGroup.get('critical') as FormArray)
      .controls[i] as FormGroup).get('status')
    if(event.target.value == statusControl.value) statusControl.setValue(null)
  }
}
