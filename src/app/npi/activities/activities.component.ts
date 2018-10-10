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

        this.subscribeToInputChanges()

        this.npiFormOutput.emit(this.activitiesFormGroup)

        //let dateRect = document.getElementById('endDate').getBoundingClientRect()
        //console.log(this.activitiesFormArray.value)
    }

    subscribeToInputChanges() {
        this.activitiesFormArray.controls.forEach(activityControl => {

            //this.activitiesFormArray.updateValueAndValidity()

            activityControl.get('term').valueChanges.subscribe(
                term => this.updateOwnDateField(term, activityControl))

            activityControl.get('endDate').valueChanges.subscribe(
                endDate => {
                    this.updateTermField(endDate, activityControl)
                    this.updateDateFields(activityControl)
                })

            activityControl.get('apply').valueChanges.subscribe(
                apply => this.updateDateFields(activityControl))

        })
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

            activityControl.valueChanges.subscribe(
                _ => {
                    this.updateParentForm()
                })

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
        if (startDate) {
            let endDate = new Date(startDate.valueOf() + term * DAYS)
            //console.log(startDate)
            //console.log(endDate)
            activityControl.patchValue({
                startDate: startDate,
                endDate: endDate
            })
        }
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
        let activity = activities.find(a => a.activity == activityLabel)
        if (activity) {
            if (activity.endDate) return new Date(Date.parse(activity.endDate))
            //console.log('activity: ' + activityLabel + ' -> ', greatestDate)
            return new Date(this.getStartDate(activities, activityLabel).valueOf() + activity.term * DAYS)
        }
        return null
    }

    getControlActivityStartDate(activityControl: AbstractControl): Date {
        let activityLabel = activityControl.get('activity').value
        //console.log(activityLabel)
        let dependenciesControls = this.getControlsDependencyActivities(activityLabel)
        let startDate = this.npi.getCriticalApprovalDate()

        if (dependenciesControls) {
            dependenciesControls.forEach(depActivity => {
                let depEndDate = this.getControlActivityEndDate(depActivity)
                //console.log(depEndDate)
                if (depEndDate)
                    startDate = new Date(Math.max(startDate.valueOf(), depEndDate.valueOf()))
                //else console.log('no endDate for ', depActivity)
            })
        }
        return startDate
    }

    getControlsDependencyActivities(activityControl: AbstractControl): Array<AbstractControl> {
        let activityLabel = activityControl.get('activity').value
        //console.log(activityLabel)
        let dependencies = []
        let dependenciesLabels = this.utils.getActivity(activityLabel).dep
        if (dependenciesLabels) {
            dependenciesLabels.forEach(dependencyLabel => {
                var dependencyControl = this.activitiesFormArray.controls.find(npiAct => npiAct.get('activity').value == dependencyLabel)
                var dependenciesArr = dependencyControl ? [dependencyControl] : []
                if (dependencyControl && !dependencyControl.get('apply').value) {
                    dependenciesArr = this.getControlsDependencyActivities(dependencyControl)
                    //console.log('recursing ', dependencyLabel, dependency)
                }
                if (dependenciesArr && dependenciesArr.length) {
                    dependencies = dependencies.concat(dependenciesArr)
                }
            })
        }
        return dependencies
    }

    getControlActivityEndDate(activityControl: AbstractControl): Date {
        let activityLabel = activityControl.get('activity').value
        let activity = this.activitiesFormArray.controls.find(a => a.get('activity').value == activityLabel)
        if (activity) {
            if (activity.get('endDate').value) return new Date(Date.parse(activity.get('endDate').value))
            //console.log('activity: ' + activityLabel + ' -> ', greatestDate)
            return new Date(this.getControlActivityStartDate(activity).valueOf() + activity.get('term').value * DAYS)
        }
        return null
    }


    getActivity(activities, activityLabel) {
        return activities.find(act => act.activity == activityLabel)
    }

    getDependencyActivities(activities: Array<any>, activityLabel: String) {
        //console.log(activityLabel)
        let dependencies = []
        let dependenciesLabels = this.utils.getActivity(activityLabel).dep
        if (dependenciesLabels) {
            dependenciesLabels.forEach(dependencyLabel => {
                var dependency = activities.find(npiAct => npiAct.activity == dependencyLabel)
                var dependenciesArr = dependency ? [dependency] : []
                if (dependency && !dependency.apply) {
                    dependenciesArr = this.getDependencyActivities(activities, dependencyLabel)
                    //console.log('recursing ', dependencyLabel, dependency)
                }
                if (dependenciesArr && dependenciesArr.length) {
                    dependencies = dependencies.concat(dependenciesArr)
                }
            })
        }
        return dependencies
    }

    updateTermField(endDate: Date, activityControl: AbstractControl) {
        let term = Math.floor(endDate.valueOf()/DAYS) - Math.floor(Date.parse(activityControl.get('startDate').value)/DAYS)
        activityControl.patchValue({
            term: term
        }, { emitEvent: false })
        //console.log('update ', activityControl.get('activity').value)
        document.getElementById(activityControl.get('activity').value + "_TERM").dispatchEvent(new Event('valueChanges'))
    }

    updateDateFields(activityControl: AbstractControl) {
        let dependentsControls = this.getControlsDependentActivities(activityControl)
        if (dependentsControls) {
            let controlsLength = dependentsControls.length
            let i = 0;
            while (i < controlsLength) {
                let depControl = dependentsControls[i]
                let dependentsOfDependentsControls = this.getControlsDependentActivities(depControl)
                dependentsOfDependentsControls.forEach(dodc => {
                    let indexOfDodc = dependentsControls.indexOf(dodc)
                    if (indexOfDodc > -1) {
                        dependentsControls.splice(indexOfDodc, 1)
                        if (indexOfDodc <= i) i--
                    }
                })
                dependentsControls = dependentsControls.concat(dependentsOfDependentsControls)
                controlsLength = dependentsControls.length
                i++
            }
            dependentsControls.forEach(control => {
                this.updateActivityDates(control)
            })
        }
    }

    getControlsDependentActivities(activityControl: AbstractControl): Array<AbstractControl> {
        let activityLabel = activityControl.get('activity').value
        let deps = []
        this.utils.getActivities().forEach(act => {
            if (act.dep && act.dep.includes(activityLabel)) {
                let activityControl = this.activitiesFormArray.controls
                    .find(a => a.get('activity').value == act.value)
                if (activityControl) {
                    deps.push(activityControl)
                    if (!activityControl.get('apply').value)
                        deps = deps.concat(this.getControlsDependentActivities(activityControl))
                }
            }
        })
        return deps
    }

    updateActivityDates(activityControl: AbstractControl) {
        let greatestDate = this.npi.getCriticalApprovalDate()
        let dependentActivities = this.getControlsDependencyActivities(activityControl)
        dependentActivities.forEach(dep => {
            let depEndDate = this.getControlActivityEndDate(dep)
            if (depEndDate) {
                greatestDate = new Date(Math.max(greatestDate.valueOf(), depEndDate.valueOf()))
            }
        })

        let startDate = greatestDate
        let endDate = new Date(startDate.valueOf() + parseInt(activityControl.get('term').value) * DAYS)

        activityControl.patchValue({
            startDate: startDate,
            endDate: endDate
        }, { emitEvent: false })

        let indexOfActivity = this.activitiesFormArray.controls.indexOf(activityControl)
        if (indexOfActivity > -1)
            this.datePickerConfig[indexOfActivity] = Object.assign(
                this.datePickerConfig[indexOfActivity],
                { minDate: startDate }
            )

        document.getElementById(activityControl.get('activity').value + "_START_DATE").dispatchEvent(new Event('valueChanges'))
        document.getElementById(activityControl.get('activity').value + "_END_DATE").dispatchEvent(new Event('valueChanges'))
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
        return deps
    }

    fillFormData() {
        console.log('filling form');
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

            let indexOfActivity = this.activitiesFormArray.controls.indexOf(activityControl)
            if (indexOfActivity > -1)
                this.datePickerConfig[indexOfActivity] = Object.assign(
                    this.datePickerConfig[indexOfActivity],
                    {
                        minDate: activityControl.get('startDate').value
                    })

        }, { emitEvent: false });
        this.loadSignatures()
    }

    getActivityRow(id) {
        return this.npi.activities.find(act => act._id == id)
    }

    updateParentForm() {
        //console.log('updating parent')
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
