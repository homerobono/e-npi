import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, AbstractControl } from '@angular/forms';
import { UtilService } from '../../services/util.service';
import { ActivatedRoute } from '@angular/router';
import { NpiComponent } from '../npi.component';
import { BsDatepickerConfig, DatepickerConfig } from 'ngx-bootstrap';
import User from '../../models/user.model';
import { UsersService } from '../../services/users.service';
import Npi from '../../models/npi.model';

const DAYS = 24 * 3600 * 1000

@Component({
  selector: 'app-activities',
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.scss']
})
export class ActivitiesComponent implements OnInit {

  npi: Npi
  @Input() set npiSetter(npi: Npi) {
    this.npi = npi;
    this.fillFormData()
  }
  @Output() npiFormOutput = new EventEmitter<FormGroup>()
  @Output() confirmCloseActivity = new EventEmitter<any>()

  activitiesFormGroup: FormGroup
  activitiesFormArray: FormArray

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
    this.activitiesFormArray = fb.array([])
    this.activitiesFormGroup = fb.group({
      'activities': this.activitiesFormArray
    })
    this.npi = npiComponent.npi
  }

  ngOnInit() {

    this.isFormEnabled =
      !this.route.snapshot.data['readOnly'] &&
      this.npi.stage == 3

    this.datePickerConfig = this.initDatePickerConfigArray(this.npi.activities.length)

    this.signatures = new Array<String>(this.npi.activities.length)

    this.insertActivities()

    this.userService.getUsers().subscribe(
      users => {
        users.forEach(user => {
          let dept = user.department as string
          if (!this.users[dept]) this.users[dept] = new Array<User>()
          this.users[dept].push(user)
        })
        //console.log(this.users)
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
    var activitiesModelArray = this.npi.activities
    //console.log(this.npi.getCriticalApprovalDate().toLocaleDateString())
    activitiesModelArray.forEach(activity => {
      let endDate = new Date(this.npi.getCriticalApprovalDate().valueOf()
        + this.getActivityDeadline(this.npi.activities, activity.activity) * DAYS)
      let startDate = new Date(endDate.valueOf() - (activity.term as number) * DAYS)
      var activityControl = this.fb.group(
        {
          _id: activity._id,
          dept: activity.dept,
          term: null,
          startDate: null,
          endDate: null,
          activity: activity.activity,
          registry: activity.registry,
          annex: activity.annex,
          apply: null,
          closed: activity.closed
        }
      )
/*
      activityControl.get('term').valueChanges.subscribe(
        term => this.updateOwnDateField(term, activityControl))
/*
      activityControl.get('endDate').valueChanges.subscribe(
        endDate => this.updateTermAndDateFields(endDate, activityControl))
      /*
            activityControl.get('apply').valueChanges.subscribe(
              apply => this.updateAllDateFields(apply, activityControl))
      */
      activityControl.valueChanges.subscribe(
        _ => this.updateParentForm())

      this.activitiesFormArray.controls.push(activityControl)
      //console.log(activityControl.value)
    });
    this.fillFormData()
  }

  validateDateFields(res) {
    //console.log('date change ', res)
    for (let i = 0; i < this.activitiesFormArray.controls.length; i++) {
      let activity = this.activitiesFormArray.controls[i]
      //console.log(activity.get("activity").value)
    }
  }

  updateOwnDateField(term, activityControl) {
    //console.log(term)
    let startDate = this.getStartDate(this.npi.activities, activityControl.get("activity").value)
    let endDate = new Date(startDate.valueOf() + term * DAYS)
    console.log(startDate)
    console.log(endDate)
    activityControl.patchValue({
      startDate: startDate,
      endDate: endDate
    })
  }

  getStartDate(activities: Array<any>, activityLabel: String): Date {
    //console.log(activityLabel)
    let dependencies = this.getDependencyActivities(activities, activityLabel)
    let startDate = this.npi.getCriticalApprovalDate()
    if (dependencies) {
      dependencies.forEach(depActivity => {
        let depEndDate = this.getActivityEndDate(activities, depActivity.activity)
        //console.log(depEndDate)
        if (depEndDate)
          startDate = new Date(Math.max(startDate.valueOf(), depEndDate.valueOf()))
        //else console.log('no endDate for ', depActivity)
      })
    }
    return startDate
  }

  getActivityEndDate(activities: Array<any>, activityLabel: String): Date {
    let activityDescriptor = this.utils.getActivity(activityLabel)
    if (activityDescriptor) {
      let activity = activities.find(a => a.activity == activityLabel)
      if (activity && activity.endDate) return new Date(Date.parse(activity.endDate))

      let greatestDate = this.npi.getCriticalApprovalDate()
      if (activityDescriptor.dep)
        activityDescriptor.dep.forEach(dep => {
          let depEndDate = this.getActivityEndDate(activities, dep)
          let depActivity = activities.find(act => act.activity == dep)
          //console.log(depActivity)
          if (depActivity && depActivity.apply)
          greatestDate = new Date(Math.max(greatestDate.valueOf(), depEndDate.valueOf()))
        })
      //console.log('activity: ' + activityLabel + ' -> ', greatestDate)
      return new Date(greatestDate.valueOf() + activity.term * DAYS)
    }
    return null
  }
  
  getActivity(activities, activityLabel) {
    return activities.find(act => act.activity == activityLabel)
  }

  getDependencyActivities(activities: Array<any>, activityLabel: String) {
    console.log(activityLabel)
    let dependencies = []
    let dependenciesLabels = this.utils.getActivity(activityLabel).dep
    if (dependenciesLabels) {
      dependenciesLabels.forEach(dependencyLabel => {
        let dependency = activities.find(npiAct => npiAct.activity == dependencyLabel)
        let dependenciesArr = [dependency]
        if (dependency && !dependency.apply){
             dependenciesArr = this.getDependencyActivities(activities, dependencyLabel)
             //console.log('recursing ', dependencyLabel, dependency)
        }
        if (dependenciesArr && dependenciesArr.length){
          dependencies.concat(dependenciesArr)
        }
      })
      console.log(dependencies)
      if (dependencies.length) return dependencies
    }
    return null
  }

  updateAllDateFields(apply, activityControl) {
    //console.log('updating dependent controls')
    let endDate = new Date(activityControl.get('endDate').value)

    if (!apply)
      endDate = new Date(activityControl.get('startDate').value) //'THE' difference!

    let dependents = this.getDependentActivities(activityControl.get('activity').value)
    if (dependents) {
      dependents.forEach(dep => {
        let depControl = this.activitiesFormArray.controls.find(act =>
          act.get('activity').value == dep.value
        )
        if (depControl) this.updateActivityDates(depControl)
      })
    }
  }

  updateTermAndDateFields(endDate, activityControl) {
    let term = Math.round((Date.parse(endDate) - Date.parse(activityControl.get('startDate').value)) / DAYS)
    activityControl.patchValue({
      term: term
    }, { emitEvent: false })

    let dependents = this.getDependentActivities(activityControl.get('activity').value)
    if (dependents) {
      dependents.forEach(dep => {
        let depControl = this.activitiesFormArray.controls.find(act =>
          act.get('activity').value == dep.value
        )
        if (depControl) this.updateActivityDates(depControl)
      })
    }
    /*
    this.datePickerConfig[i] = Object.assign(
      this.datePickerConfig[i],
      { minDate: startDate }
    )
    */
  }

  updateActivityDates(actControl: AbstractControl) {
    let greatestDate = this.npi.getCriticalApprovalDate()
    this.utils.getActivity(actControl.get("activity").value).dep.forEach(dep => {
      //console.log(this.activitiesFormArray.value)
      greatestDate = new Date(Math.max(greatestDate.valueOf(), this.getActivityEndDate(this.activitiesFormArray.value, dep).valueOf()))
    })

    let startDate = greatestDate
    let endDate = new Date(startDate.valueOf() + parseInt(actControl.get('term').value) * DAYS)

    //    console.log('updating ', actControl.value.activity, ' Start Date to ', startDate)
    //console.log(endDepDate)
    actControl.patchValue({
      startDate: startDate,
      endDate: endDate
    })
  }

  getActivityDeadline(activities, activityLabel) {
    let activityDescriptor = this.utils.getActivity(activityLabel)
    let previousTerm = 0
    if (activityDescriptor) {
      if (activityDescriptor.dep)
        activityDescriptor.dep.forEach(dep => {
          previousTerm = Math.max(previousTerm, this.getActivityDeadline(activities, dep))
        })
      let activity = activities.find(a => a.activity == activityLabel)
      let deadline = previousTerm + (activity && activity.apply ? activity.term as number : 0)
      //console.log('activity: ' + activityLabel + ' -> ', activity.term, activity.apply, deadline)
      return deadline
    }
    return 0
  }

  getDependentActivities(activity): Array<any> {
    let deps = []
    this.utils.getActivities().forEach(act => {
      if (act.dep && act.dep.includes(activity)) {
        let activityForm = (this.activitiesFormGroup.get('activities') as FormArray)
          .controls.find(a => a.value.activity == act)
        if (activityForm && !activityForm.get('apply').value)
          deps.push(this.getDependentActivities(act))
        else
          deps.push(act)
      }
    })
    if (deps.length) return deps
    return null
  }

  fillFormData() {
    //console.log('filling form');
    this.activitiesFormArray.controls.forEach(activityControl => {
      var activity = this.getActivityRow(activityControl.get('_id').value)
      //console.log (activity)
      activityControl.patchValue(
        {
          //_id: activity._id,
          term: activity.term,
          apply: activity.apply,
          startDate: this.getStartDate(this.npi.activities, activity.activity),
          endDate: this.getActivityEndDate(this.npi.activities, activity.activity),
          activity: activity.activity,
          registry: activity.registry,
          annex: activity.annex,
          signature: activity.signature
        }
      )
    });
    this.loadSignatures()
  }

  getActivityRow(id) {
    return this.npi.activities.find(act => act._id == id)
  }

  updateParentForm() {
    this.npiFormOutput.emit(this.activitiesFormGroup)
  }

  fieldHasErrors(field) {
    let fieldsArr = field.split(".")
    return (this.activitiesFormArray.get(fieldsArr[0]) as FormGroup)
      .get(fieldsArr[1]).hasError('required')
  }

  openFileAction(field) {
    //if (!this.npi[field].annex || !this.npi[field].annex.length)
    //this.npiComponent.openUploadModal(field)
    this.npiComponent.openFileManager(field)
  }

  closeAllActivities() {
    if (!confirm(
      "Tem certeza que deseja concluir todas as atividades incluídas no desenvolvimento?")
    ) return;
    this.activitiesFormArray.controls.forEach(activityControl => {
      if (activityControl.get('apply'))
        activityControl.patchValue({
          endDate: new Date(),
          closed: true
        })
    })
    this.confirmCloseActivity.emit()
  }

  closeActivity(activity) {
    console.log(activity)
    if (!confirm(
      "Tem certeza que deseja concluir essa atividade?")
    ) return;
    let activityControl = this.activitiesFormArray.controls.find(a => a.get('_id').value == activity.value._id)
    activityControl.patchValue({
      endDate: new Date(),
      closed: true
    })
    this.confirmCloseActivity.emit()
  }

  loadSignatures() {
    for (var i = 0; i < this.npi.activities.length; i++) {
      var row = this.npi.activities[i]
      if (row.signature && row.signature.date && row.signature.user) {
        var signature = row.signature.user.firstName +
          (row.signature.user.lastName ?
            ' ' + row.signature.user.lastName :
            ''
          ) + ', ' + new Date(row.signature.date).toLocaleDateString('pt-br') +
          ', às ' + new Date(row.signature.date).toLocaleTimeString('pt-br')

        this.signatures[i] = signature
      }
      else this.signatures[i] = null
    }
  }

}
