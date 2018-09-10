import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { UtilService } from '../../services/util.service';
import { ActivatedRoute } from '@angular/router';
import { NpiComponent } from '../npi.component';

@Component({
  selector: 'app-activities',
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.scss']
})
export class ActivitiesComponent implements OnInit {
  @Output() npiFormOutput = new EventEmitter<FormGroup>()
  @Input() npi

  activitiesFormGroup: FormGroup
  signatures: Array<any>
  isFormEnabled: Boolean

  constructor(
    private fb: FormBuilder,
    private utils: UtilService,
    private route: ActivatedRoute,
    private npiComponent: NpiComponent
  ) {
    this.activitiesFormGroup = fb.group({
      'activities': fb.array([])
    })
  }

  ngOnInit() {

    this.isFormEnabled =
      !this.route.snapshot.data['readOnly'] &&
      this.npi.stage == 3

    this.insertActivities()

    if (!this.isFormEnabled)
      this.activitiesFormGroup.disable()

    this.npiComponent.resetFormFlagSubject.subscribe(
      () => this.fillFormData())

    this.npiFormOutput.emit(this.activitiesFormGroup)
  }

  insertActivities() {
    var activitiesFormArray =
      (this.activitiesFormGroup.get('activities') as FormArray)
        .controls
    var activitiesModelArray = this.npi.activities

    activitiesModelArray.forEach(activity => {
      var activityControl = this.fb.group(
        {
          _id: activity._id,
          date: activity.date,
          activity: activity.activity,
          registry: activity.registry,
          annex: activity.annex
          //signature: activity.signature 
        }
      )
      activityControl.valueChanges.subscribe(
        () => this.updateParentForm())
      activitiesFormArray.push(activityControl)
    });
  }

  fillFormData() {
    var activitiesFormArray =
      (this.activitiesFormGroup.get('activities') as FormArray).controls

    activitiesFormArray.forEach(analisys => {
      var activityRow = this.getActivityRow(analisys.get('_id').value)
      analisys.patchValue(
        {
          date: activityRow.date,
          registry: activityRow.registry,
          annex: activityRow.annex
          //signature: analisys.signature 
        }
      )
    });
  }

  getActivityRow(id) {
    for (let i = 0; i < this.npi.activities.length; i++) {
      let activity = this.npi.activities[i]
      if (activity._id == id) return activity
    }
  }

  updateParentForm() {
    this.npiFormOutput.emit(this.activitiesFormGroup)
  }

  fieldHasErrors(field) {
    let fieldsArr = field.split(".")
    var controls = (this.activitiesFormGroup.get('activities') as FormArray)
    return (controls.get(fieldsArr[0]) as FormGroup).get(fieldsArr[1]).hasError('required')
  }

}
