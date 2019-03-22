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
    styleUrls: ['./activities.component.scss'],
})
export class ActivitiesComponent implements OnInit {

    npi: Npi
    editFlag: Boolean
    @Input() set npiSetter(npi: Npi) {
        this.npi = npi;
        console.log(this.npi.getInStockDate())
        this.inStockDate = this.npi.getInStockDate()
        this.fillFormData()
    }

    @Input() set toggleEdit(edit: Boolean) {
        if (!this.npi.isComplete())
            this.toggleFields(edit)
        this.isFormEnabled = edit
        this.editFlag = edit
    }

    @Output() npiFormOutput = new EventEmitter<FormGroup>()
    @Output() confirmCloseActivity = new EventEmitter<any>()
    @Output() isReleaseEstimateDelayed = new EventEmitter<Boolean>()

    activitiesFormGroup: FormGroup
    activitiesFormArray: FormArray
    requestsFormArray: FormArray

    signatures: Array<any> = []
    isFormEnabled: Boolean
    datePickerConfig: Array<Partial<BsDatepickerConfig>>;

    inStockDate: Date
    releaseDate: Date
    users: any = {}

    constructor(
        private fb: FormBuilder,
        public utils: UtilService,
        private route: ActivatedRoute,
        public npiComponent: NpiComponent,
        private userService: UsersService
    ) {
        this.activitiesFormArray = fb.array([])
        this.requestsFormArray = fb.array([])
        this.activitiesFormGroup = fb.group({
            'activities': this.activitiesFormArray,
            'requests': this.requestsFormArray
        })
        this.npi = npiComponent.npi
    }

    ngOnInit() {

        this.editFlag = this.isFormEnabled =
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
        this.updateReleaseDate()

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

            if (this.utils.getActivity('RELEASE', this.npi.entry).dep.includes(activityControl.get('activity').value)) {
                activityControl.get('endDate').valueChanges.subscribe(
                    endDate => this.updateReleaseDate()
                )
            }
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
                    activity: activity.activity,
                    dept: activity.dept,
                    responsible: activity.responsible,
                    term: null,
                    startDate: null,
                    endDate: null,
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

    insertRequests() {
        var requestsModelArray = this.npi.requests
        //console.log(this.npi.getCriticalApprovalDate().toLocaleDateString())
        requestsModelArray.forEach(request => {
            var requestControl = this.fb.group(
                {
                    _id: request._id,
                    class: request.class,
                    comment: request.comment,
                    responsible: request.responsible,
                    analysis: request.analysis,
                    closed: request.closed
                }
            )

            requestControl.valueChanges.subscribe(
                _ => {
                    this.updateParentForm()
                })

            this.requestsFormArray.controls.push(requestControl)
            //console.log(activityControl.value)
        });
        //this.fillRequestFormData()
    }

    //===================== Form Controls Methods ================================

    updateOwnDateField(term, activityControl: AbstractControl) {
        //console.log(term)
        let startDate = this.getControlActivityStartDate(activityControl)
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

    updateTermField(endDate: Date, activityControl: AbstractControl) {
        let term = Math.floor(endDate.valueOf() / DAYS) - Math.floor(Date.parse(activityControl.get('startDate').value) / DAYS)
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

        //Calculate if release date is dalayed
        if (this.utils.getActivity('RELEASE', this.npi.entry).dep.includes(activityControl.get('activity').value)) {
            //console.log(activityControl.get('activity').value)
            document.getElementById(activityControl.get('activity').value + "_END_DATE").dispatchEvent(new Event('change'))
            //this.updateDelayedStatus()
        }
    }

    getControlActivityStartDate(activityControl: AbstractControl): Date {
        let activityLabel = activityControl.get('activity').value
        //console.log(activityLabel)
        let dependenciesControls = this.getControlsDependencyActivities(activityControl)
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

    getControlsDependencyActivities(activityControl: AbstractControl): Array<AbstractControl> {
        let activityLabel = activityControl.get('activity').value
        //console.log(activityLabel)
        let dependencies = []
        let dependenciesLabels = this.utils.getActivity(activityLabel, this.npi.entry).dep
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

    getControlsDependentActivities(activityControl: AbstractControl): Array<AbstractControl> {
        let activityLabel = activityControl.get('activity').value
        let deps = []
        this.utils.getActivities(this.npi.entry).forEach(act => {
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
    //========================================================================

    //===================== Model functions ================================

    getModelStartDate(activityLabel: String): Date {
        //console.log(activityLabel)
        let activities = this.npi.activities
        let dependencies = this.getModelDependencyActivities(activityLabel)
        let startDate = this.npi.getCriticalApprovalDate()

        if (dependencies) {
            dependencies.forEach(depActivity => {
                let depEndDate = this.getModelActivityEndDate(depActivity.activity)
                //console.log(depEndDate)
                if (depEndDate)
                    startDate = new Date(Math.max(startDate.valueOf(), depEndDate.valueOf()))
                //else console.log('no endDate for ', depActivity)
            })
        }
        return startDate
    }

    getModelActivityEndDate(activityLabel: String): Date {
        let activities = this.npi.activities
        let activity = activities.find(a => a.activity == activityLabel)
        if (activity) {
            //console.log('activity: ' + activityLabel + ' -> ', greatestDate)
            return new Date(this.getModelStartDate(activityLabel).valueOf() + (activity.term as number) * DAYS)
        }
        return null
    }

    getModelDependencyActivities(activityLabel: String): Array<any> {
        let activities = this.npi.activities
        //console.log(activityLabel)
        let dependencies = []
        let dependenciesLabels = this.utils.getActivity(activityLabel, this.npi.entry).dep
        if (dependenciesLabels) {
            dependenciesLabels.forEach(dependencyLabel => {
                var dependency = activities.find(npiAct => npiAct.activity == dependencyLabel)
                var dependenciesArr = dependency ? [dependency] : []
                if (dependency && !dependency.apply) {
                    dependenciesArr = this.getModelDependencyActivities(dependencyLabel)
                    //console.log('recursing ', dependencyLabel, dependency)
                }
                if (dependenciesArr && dependenciesArr.length) {
                    dependencies = dependencies.concat(dependenciesArr)
                }
            })
        }
        return dependencies
    }

    //========================================================================

    fillFormData() {
        console.log('filling form');
        this.activitiesFormArray.controls.forEach(activityControl => {
            var activity = this.getActivityRow(activityControl.get('_id').value)
            // console.log (activity)
            activityControl.patchValue(
                {
                    //_id: activity._id,
                    responsible: activity.responsible,
                    term: activity.term,
                    startDate: this.getModelStartDate(activity.activity),
                    endDate: this.getModelActivityEndDate(activity.activity),
                    activity: activity.activity,
                    registry: activity.registry,
                    annex: activity.annex,
                    signature: activity.signature,
                    apply: activity.apply
                }, { emitEvent: false }
            )

            let indexOfActivity = this.activitiesFormArray.controls.indexOf(activityControl)
            if (indexOfActivity > -1)
                this.datePickerConfig[indexOfActivity] = Object.assign(
                    this.datePickerConfig[indexOfActivity],
                    {
                        minDate: activityControl.get('startDate').value
                    })

        });
        this.loadSignatures()
    }

    fillRequestFormData() {
        var requestFormArray =
          this.requestsFormArray.controls
    
        requestFormArray.forEach(request => {
          var requestRow = this.npi.requests.find(req => req._id == request.get('_id').value)
          //console.log(requestRow)
          request.patchValue(
            {
            }
          )
        });
      }
    

    getActivityRow(id) {
        return this.npi.activities.find(act => act._id == id)
    }

    updateParentForm() {
        //console.log('updating parent')
        this.npiFormOutput.emit(this.activitiesFormGroup)
    }

    updateReleaseDate() {
        let releaseDate = new Date(null)
        //console.log(releaseDate)
        let releaseDependents = this.utils.getActivity('RELEASE', this.npi.entry).dep
        releaseDependents.forEach(depLabel => {
            let depControl = this.activitiesFormArray.controls.find(a => a.get('activity').value == depLabel)
            let depEndDate = new Date(this.getControlActivityStartDate(depControl).valueOf() + (depControl.get('apply').value ? depControl.get('term').value : 0) * DAYS)
            //            console.log(depLabel, depEndDate, this.npi.inStockDate)
            releaseDate = new Date(Math.max(releaseDate.valueOf(), depEndDate.valueOf()))
        })
        this.releaseDate = releaseDate
        console.log((releaseDate.valueOf() - (new Date()).valueOf())/DAYS)

        //this.updateDelayedStatus()
    }

    setDelayedStatus(status) {
        console.log(status)
        this.isReleaseEstimateDelayed.emit(status)
    }

    fieldHasErrors(field) {
        let fieldsArr = field.split(".")
        return (this.activitiesFormArray.get(fieldsArr[0]) as FormGroup)
            .get(fieldsArr[1]).hasError('required')
    }

    toggleFields(edit: Boolean) {
        this.activitiesFormArray.controls.forEach(control => {
            if (edit) {
                if (this.canChangeActivity(control)) control.enable({ emitEvent: false })
            } else control.disable({ emitEvent: false })
        })
    }

    toggleApplyAll(event) {
        //console.log(event.target.checked)
        let status = event.target.checked
        this.activitiesFormArray.controls.forEach(control => {
            let actLabel = control.get('activity').value
            if (!this.utils.getActivity(actLabel, this.npi.entry).required)
                control.patchValue({
                    apply: status
                })
        })
    }

    canChangeActivity(activity: AbstractControl): Boolean {
        let user = this.npiComponent.user
        return user.level > 1 ||
            (user.level == 1 && (
                user.department == activity.get('dept').value ||
                (user.department == 'MPR' && this.npi.stage == 2)
            )
            )
    }

    canCloseActivity(activity: AbstractControl): Boolean {
        return this.amIResponsible(activity) || this.canChangeActivity(activity)
    }

    amIResponsible(activity: AbstractControl): Boolean {
        return this.npiComponent.user._id == activity.get('responsible').value
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
        this.confirmCloseActivity.emit(activityControl)
    }

    displayActivityRow(activity: AbstractControl) {
        if (activity.get("apply").value || (this.npi.stage == 2 && this.npi.isApproved() && this.npiComponent.canIChangeActivities))
            return "table-row"
        return "none"
    }

    loadSignatures() {
        for (var i = 0; i < this.npi.activities.length; i++) {
            var row = this.npi.activities[i]
            if (row.signature && row.signature.date && row.signature.user) {
                var signature = "Concluído por " + row.signature.user.firstName +
                    (row.signature.user.lastName ?
                        ' ' + row.signature.user.lastName :
                        ''
                    )// + ', ' + new Date(row.signature.date).toLocaleDateString('pt-br') +
                //', às ' + new Date(row.signature.date).toLocaleTimeString('pt-br')

                this.signatures[i] = signature
            }
            else this.signatures[i] = null
        }
    }

    setRequestChild(requestForm, requestClass) {
        let requestControlIndex = (this.activitiesFormGroup.value.request as Array<any>).findIndex(
            request => request.class == requestClass
        )
        if (!requestControlIndex) return
        Object.keys(requestForm.controls).forEach((field: string) => {
          ((this.activitiesFormGroup.get('requests') as FormArray)[requestControlIndex] as FormGroup)
          .addControl(field, requestForm.get(field))
        });
        this.activitiesFormGroup.updateValueAndValidity()
        this.updateParentForm()
      }
}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   
