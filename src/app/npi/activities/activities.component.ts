import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { UtilService } from '../../services/util.service';
import { ActivatedRoute } from '@angular/router';
import { NpiComponent } from '../npi.component';
import { BsDatepickerConfig, DatepickerConfig } from 'ngx-bootstrap';

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
  datePickerConfig: Array<Partial<BsDatepickerConfig>>;

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

    this.datePickerConfig = this.initDatePickerConfigArray(this.npi.activities.length)

    this.insertActivities()

    if (!this.isFormEnabled)
      this.activitiesFormGroup.disable()

    this.npiComponent.resetFormFlagSubject.subscribe(
      () => this.fillFormData())

    this.npiFormOutput.emit(this.activitiesFormGroup)
  }

  initDatePickerConfigArray(length) {
    var datePickArr = new Array<Partial<BsDatepickerConfig>>(length)
    for (let i = 0; i < length; i++) {
      datePickArr[i] = Object.assign(
          {},
          {
            containerClass: 'theme-default',
            showWeekNumbers: false,
            dateInputFormat: 'DD/MM/YYYY',
            minDate: new Date()
          })
      }
    return datePickArr
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
          deadline: activity.deadline,
          startDate: null,
          endDate: new Date(Date.now() + activity.deadline * 24 * 3600 * 1000),
          activity: activity.activity,
          registry: activity.registry,
          annex: activity.annex
          //signature: activity.signature 
        }
      )
      activityControl.valueChanges.subscribe(
        res => {
          this.updateParentForm()
          this.updateDateFields(res)
          //this.validateDateFields(res)
        })
      activitiesFormArray.push(activityControl)
      //console.log(activityControl.value)
    });
  }

  updateDateFields(field) {
    var activitiesFormArray =
      (this.activitiesFormGroup.get('activities') as FormArray)
        .controls
    console.log('updating data')
    for (let i = 0; i < activitiesFormArray.length; i++) {
      if (field._id == activitiesFormArray[i].get('_id').value) {
        let endDate = activitiesFormArray[i].get('endDate').value
        let startDate = activitiesFormArray[i].get('startDate').value
        this.datePickerConfig[i] = Object.assign(
          this.datePickerConfig[i],
          { minDate: startDate }
        )
        if (i > 0) {
          activitiesFormArray[i - 1].patchValue({
            endDate: startDate
          }, { emitEvent: false })

          this.datePickerConfig[i - 1] = Object.assign(
            this.datePickerConfig[i - 1],
            { maxDate: endDate }
          )
        }
        if (i < activitiesFormArray.length - 1) {
          activitiesFormArray[i + 1].patchValue({
            startDate: endDate
          }, { emitEvent: false })

          this.datePickerConfig[i + 1] = Object.assign(
            this.datePickerConfig[i + 1],
            { minDate: endDate }
          )
        }
      }
    }
  }

  fillFormData() {
    var activitiesFormArray =
      (this.activitiesFormGroup.get('activities') as FormArray).controls

    activitiesFormArray.forEach(analisys => {
      var activityRow = this.getActivityRow(analisys.get('_id').value)
      console.log(activityRow.deadline);
      analisys.patchValue(
        {
          startDate: null,
          endDate: new Date(Date.now() + activityRow.deadline * 24 * 3600 * 1000),
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
