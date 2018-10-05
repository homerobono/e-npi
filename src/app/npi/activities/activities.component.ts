import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
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
    var activitiesModelArray = this.npi.activities
    //console.log(this.npi.getCriticalApprovalDate().toLocaleDateString())
    activitiesModelArray.forEach(activity => {
      var activityControl = this.fb.group(
        {
          _id: activity._id,
          dept: activity.dept,
          term: activity.term,
          startDate: new Date(this.npi.getCriticalApprovalDate()),
          endDate: new Date(this.npi.getCriticalApprovalDate().valueOf() + this.getActivityDeadline(this.npi.activities, activity.activity) * DAYS),
          activity: activity.activity,
          registry: activity.registry,
          annex: activity.annex,
          apply: activity.apply,
          closed: activity.closed
        }
      )
      activityControl.get('term').valueChanges.subscribe(
        _ => this.updateOwnDateField(activityControl))

      activityControl.get('endDate').valueChanges.subscribe(
        _ => this.updateTermAndDateFields(activityControl))

      activityControl.get('apply').valueChanges.subscribe(
        res => this.updateAllDateFields(res, activityControl))

      activityControl.valueChanges.subscribe(
        _ => this.updateParentForm())

      this.activitiesFormArray.controls.push(activityControl)
      //console.log(activityControl.value)
    });
    this.loadSignatures()
  }

  validateDateFields(res) {
    //console.log('date change ', res)
    for (let i = 0; i < this.activitiesFormArray.controls.length; i++) {
      let activity = this.activitiesFormArray.controls[i]
      //console.log(activity.get("activity").value)
    }
  }

  updateOwnDateField(activityControl) {
    let startDate = new Date(activityControl.get('startDate').value)
    let endDate = new Date(activityControl.get('endDate').value)
    //let term = Math.round((endDate.valueOf() - startDate.valueOf()) / DAYS)
    let term = activityControl.get('term').value as number

    endDate = new Date(startDate.valueOf() + term * DAYS)
    activityControl.patchValue({
      endDate: endDate
    })
  }

  updateAllDateFields(res, activityControl) {
    //console.log('updating dependent controls')
    let endDate = new Date(activityControl.get('endDate').value)

    if (!res)
      endDate = new Date(activityControl.get('startDate').value) //'THE' difference!

    let dependents = this.getDependentActivities(activityControl.get('activity').value)
    if (dependents) {
      dependents.forEach(dep => {
        //this.updateDateFields
        //console.log(dep)
        let depControl = this.activitiesFormArray.controls.find(act =>
          act.get('activity').value == dep.value
        )

        let endDepDate = new Date(endDate.valueOf() + parseInt(depControl.get('term').value) * DAYS)
        //console.log(endDepDate)
        depControl.patchValue({
          startDate: endDate,
          endDate: endDepDate
        })
      })
    }
  }

  updateTermAndDateFields(activityControl) {
    let dependents = this.getDependentActivities(activityControl.get('activity').value)
    if (dependents) {
      dependents.forEach(dep => {
        let depControl = this.activitiesFormArray.controls.find(act =>
          act.get('activity').value == dep.value
        )
        if (depControl) this.updateDateFields(depControl)
      })
    }
    /*
    this.datePickerConfig[i] = Object.assign(
      this.datePickerConfig[i],
      { minDate: startDate }
    )
    */
  }

  updateDateFields(actControl) {
    let dependencies = this.getDependencyActivities(actControl.get("activity").value)

    var term = 0
    dependencies.forEach(dep => {
      term = Math.max(term, this.getActivityDeadline(this.activitiesFormArray.value, dep.activity))
    })

    let startDate = new Date(this.npi.getCriticalApprovalDate().valueOf() + term * DAYS)
    let endDate = new Date(startDate.valueOf() + parseInt(actControl.get('term').value) * DAYS)
    //console.log(endDepDate)
    actControl.patchValue({
      startDate: startDate,
      endDate: endDate
    })
    /*let term = Math.round((endDate.valueOf() - startDate.valueOf()) / DAYS)
    activityControl.patchValue({
      term: term
    }, { emitEvent: false })
    */
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
      let deadline = previousTerm + (activity.apply ? activity.term as number : 0)
      //console.log('activity: ' + activityLabel + ' -> ', activity.term, activity.apply, deadline)
      return deadline
    }
    return 0
  }

  getDependencyActivities(activity) {
    //console.log(activity)
    let dependencies = []
    this.utils.getActivity(activity).dep.forEach(dependency => {
      dependencies.push(this.npi.activities.find(npiAct => npiAct.activity == dependency))
    })
    return dependencies
  }

  getDependentActivities(activity) {
    let deps = []
    this.utils.getActivities().forEach(act => {
      let formActivity = (this.activitiesFormGroup.get('activities') as FormArray)
        .controls.find(a => a.value.activity == act)
      if (act.dep && act.dep.includes(activity)) {
        if (formActivity && !formActivity.value.apply)
          deps.push(this.getDependentActivities(act))
        else
          deps.push(act)
      }
    })
    if (deps.length) return deps
    return null
  }

  fillFormData() {
    console.log('filling form');
    this.activitiesFormArray.controls.forEach(analisys => {
      var activity = this.getActivityRow(analisys.get('_id').value)
      analisys.patchValue(
        {
          //_id: activity._id,
          term: activity.term,
          //startDate: null,
          //endDate: new Date(Date.now() + activity.term * DAYS),
          //activity: activity.activity,
          registry: activity.registry,
          annex: activity.annex,
          //sigature: activity.signature
        }
      )
    });
    this.loadSignatures()
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
