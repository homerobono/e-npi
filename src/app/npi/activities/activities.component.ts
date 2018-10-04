import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { UtilService } from '../../services/util.service';
import { ActivatedRoute } from '@angular/router';
import { NpiComponent } from '../npi.component';
import { BsDatepickerConfig, DatepickerConfig } from 'ngx-bootstrap';
import User from '../../models/user.model';
import { UsersService } from '../../services/users.service';

const DAYS = 24 * 3600 * 1000

@Component({
  selector: 'app-activities',
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.scss']
})
export class ActivitiesComponent implements OnInit {
  @Output() npiFormOutput = new EventEmitter<FormGroup>()
  @Input() npi

  activitiesFormGroup: FormGroup
  signatures: Array<any> = []
  isFormEnabled: Boolean
  datePickerConfig: Array<Partial<BsDatepickerConfig>>;

  users: any = {}

  constructor(
    private fb: FormBuilder,
    private utils: UtilService,
    private route: ActivatedRoute,
    private npiComponent: NpiComponent,
    private userService: UsersService
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

    this.userService.getUsers().subscribe(
      users => {
        users.forEach(user => {
          let dept = user.department as string
          if (!this.users[dept]) this.users[dept] = new Array<User>()
          this.users[dept].push(user)
        })
        console.log(this.users)
      })

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
    console.log(this.npi.getCriticalApprovalDate().toLocaleDateString())
    activitiesModelArray.forEach(activity => {
      var activityControl = this.fb.group(
        {
          _id: activity._id,
          dept: activity.dept,
          term: activity.term,
          startDate: this.npi.getCriticalApprovalDate().toLocaleDateString(),
          endDate: new Date(this.npi.getCriticalApprovalDate() + this.utils.getActivityDeadline(activity.activity) * DAYS),
          activity: activity.activity,
          registry: activity.registry,
          annex: activity.annex,
          apply: true
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

  validateDateFields(res) {
    var activitiesFormArray =
      (this.activitiesFormGroup.get('activities') as FormArray)
        .controls
    for (let i = 0; i < activitiesFormArray.length; i++) {
      let activity = activitiesFormArray[i]
      //console.log(activity.get("activity").value)
    }
  }

  updateDateFields(field) {
    var activitiesFormArray =
      (this.activitiesFormGroup.get('activities') as FormArray)
        .controls
    for (let i = 0; i < activitiesFormArray.length; i++) {
      if (field._id == activitiesFormArray[i].get('_id').value) {
        let activity = activitiesFormArray[i]
        //console.log(activity)
        let endDate = new Date(activitiesFormArray[i].get('endDate').value)
        let startDate = new Date(activitiesFormArray[i].get('startDate').value)

        /*let dependency = this.utils.getDependencyActivity(activity.get('activity').value)
        if (dependency) {
          activitiesFormArray.find(act =>
            act.get('activity').value == dependency.value
          ).patchValue({
            endDate: startDate
          }, { emitEvent: false })
        }*/
        //console.log('searching for ', activity.get('activity').value)
        let dependents = this.utils.getDependentActivities(activity.get('activity').value)
        if (dependents) {
          dependents.forEach(dep => {
            let depControl = activitiesFormArray.find(act =>
              act.get('activity').value == dep.value
            )
            //console.log('updating ' + dep.value + ' with ' + endDate + ' and ' + endDate+depControl.get('term').value)
            //console.log(endDate)
            let endDepDate = new Date(endDate.valueOf() + parseInt(depControl.get('term').value) * DAYS)
            //console.log(endDepDate)
            depControl.patchValue({
              startDate: endDate.toLocaleDateString(),
              endDate: endDepDate
            })
          })
        }

        /*
        this.datePickerConfig[i] = Object.assign(
          this.datePickerConfig[i],
          { minDate: startDate }
        )
        if (i > 0) {
          this.datePickerConfig[i - 1] = Object.assign(
            this.datePickerConfig[i - 1],
            { maxDate: endDate }
          )
        }
        if (i < activitiesFormArray.length - 1) {
          this.datePickerConfig[i + 1] = Object.assign(
            this.datePickerConfig[i + 1],
            { minDate: endDate }
          )
        }*/
      }
    }
  }

  fillFormData() {
    var activitiesFormArray =
      (this.activitiesFormGroup.get('activities') as FormArray).controls

    activitiesFormArray.forEach(analisys => {
      var activity = this.getActivityRow(analisys.get('_id').value)
      console.log(activity.term);
      analisys.patchValue(
        {
          //_id: activity._id,
          term: activity.term,
          //startDate: null,
          endDate: new Date(Date.now() + activity.term * DAYS),
          //activity: activity.activity,
          registry: activity.registry,
          annex: activity.annex
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

  openFileAction(field) {
    //if (!this.npi[field].annex || !this.npi[field].annex.length)
      //this.npiComponent.openUploadModal(field)
      this.npiComponent.openFileManager(field)
  }

}
