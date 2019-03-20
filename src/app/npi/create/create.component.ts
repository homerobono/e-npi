import { Component, Inject, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, FormArray, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { createNumberMask } from 'text-mask-addons/dist/textMaskAddons';
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker'
import { defineLocale } from 'ngx-bootstrap/chronos';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

import { AuthService } from '../../services/auth.service';
import { MessageService } from '../../services/message.service';
import { NpiService } from '../../services/npi.service'

import Npi from '../../models/npi.model';

import { ptBrLocale } from 'ngx-bootstrap/locale';
import { UtilService } from '../../services/util.service';
import { Globals } from 'config';
import { NpiChooserModalComponent } from '../npi-chooser-modal/npi-chooser-modal.component';
import { UploaderComponent } from '../../file-manager/uploader/uploader.component';
import { UploadService } from '../../services/upload.service';
import { concatMap } from 'rxjs/operators';
import { SendingFormModalComponent } from '../sending-form-modal/sending-form-modal.component';
import { FileItem } from 'ng2-file-upload';
import { FileDescriptor } from '../../models/file-descriptor';
import { of, Observable } from 'rxjs';
import { map } from 'rxjs-compat/operator/map';
import { UsersService } from 'src/app/services/users.service';
import User from 'src/app/models/user.model';

defineLocale('pt-br', ptBrLocale)
const DAYS = 24 * 3600 * 1000

@Component({
    selector: 'app-create',
    templateUrl: './create.component.html',
    styleUrls: ['./create.component.scss']
})

export class CreateComponent implements OnInit {

    resolveSubmission: Observable<any>

    sendingForm: Boolean = false;
    formSent: Boolean = false;
    createResponse: String;

    npisList: Npi[]
    modalRef: BsModalRef;
    npiRef: Npi

    oemActivitiesFormArray: FormArray
    devDate: Date

    objectkeys = Object.keys

    public currencyMask = {
        mask:
            createNumberMask({
                prefix: '',
                includeThousandsSeparator: true,
                thousandsSeparatorSymbol: '.',
                requireDecimal: true,
                decimalSymbol: ',',
                allowNegative: false,
            }),
        guide: false,
    }
    public dateMask = {
        mask: ['/\d/', '/', '/\d/', '/']
    }

    datePickerConfig: Partial<BsDatepickerConfig>;
    oemDatePickerConfig: Array<Partial<BsDatepickerConfig>>;
    oemActivities: Array<any>
    users: any = {}

    createForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        private npiService: NpiService,
        private authService: AuthService,
        private router: Router,
        private messenger: MessageService,
        private localeService: BsLocaleService,
        public utils: UtilService,
        private modalService: BsModalService,
        public uploadService: UploadService,
        private userService: UsersService
    ) {
        this.datePickerConfig = Object.assign(
            {},
            {
                containerClass: 'theme-default',
                showWeekNumbers: false,
                dateInputFormat: 'DD/MM/YYYY',
                minDate: new Date()
            }
        )
        var oemDefaultDeadLine = new Date(Date.now() + 3600000 * 24 * 30)
        this.oemActivitiesFormArray = fb.array([])
        this.createForm = fb.group({
            'date': new Date().toLocaleDateString('pt-br'),
            'complexity': 2,
            'client': 'Pixel',
            'name': 'Versões',
            'entry': 'pixel',
            'npiRef': null,
            'description': fb.group({
                'description': 'Requisitos gerais',
                'annex': null
            }),
            'resources': fb.group({
                'description': 'Recursos necessários',
                'annex': null
            }),
            'regulations': fb.group({
                'standard': fb.group({}),
                'additional': null,
                'description': 'Descricao das homologações/regulações aplicáveis',
                'annex': null
            }),
            'cost': fb.group({
                'value': '30,00',
                'currency': 'BRL'
            }),
            'price': fb.group({
                'value': '90,00',
                'currency': 'BRL'
            }),
            'inStockDateType': 'fixed',
            'inStockDate': oemDefaultDeadLine,
            'investment': fb.group({
                'value': '50000,00',
                'currency': 'BRL',
                'annex': null
            }),
            'projectCost': fb.group({
                'value': '10000,00',
                'currency': 'BRL',
                'annex': null
            }),
            'demand': fb.group({
                'amount': 1000,
                'period': null
            }),
            'fiscals': 'Incentivos fiscais disponíveis',
            'oemActivities': this.oemActivitiesFormArray
        })

        this.oemActivities = this.utils.getOemActivities()
        this.insertOemActivities()

        this.userService.getUsers().subscribe(
            users => {
                users.forEach(user => {
                    let dept = user.department as string
                    if (!this.users[dept]) this.users[dept] = new Array<User>()
                    this.users[dept].push(user)
                })
                //console.log(this.users)
            })

        npiService.npisList.subscribe(res => this.npisList = res)

        let regulations = utils.getRegulations()
        let additionalArray = this.createForm.get('regulations').get('standard') as FormGroup
        regulations.forEach(reg => {
            additionalArray.addControl(reg.value, fb.control(null))
        })

        this.createForm.get('npiRef').valueChanges.subscribe(res => { this.loadNpiRef(res) })
    }

    ngOnInit() {
        this.localeService.use('pt-br');
        this.oemDatePickerConfig = this.initDatePickerConfigArray(this.oemActivities.length)
        this.subscribeToInputChanges()
        //setTimeout(() => this.openUploadModal("resources"), 600)
    }

    createNpi(): void {
        let npiForm = this.createForm.value
        console.log(npiForm)

        for (let field in this.uploadService.uploaders) {
            npiForm[field].annex =
                (this.uploadService.uploaders[field].queue as FileItem[]).map(
                    fI => new FileDescriptor(field, fI.file)
                )
        }
        console.log(npiForm)
        this.sendingForm = true

        this.resolveSubmission
            .finally(() => {
                this.sendingForm = false;
                //setTimeout(()=> this.modalRef.hide(), 500)
            })
            .subscribe(res => {
                console.log('All complete');
                console.log(res);
                this.messenger.set({
                    'type': 'success',
                    'message': 'NPI cadastrado com sucesso'
                });
                this.formSent = true;
                this.clearFields();
                this.router.navigateByUrl('/npi/' + res.create.data.number)
            }, err => {
                this.invalidFieldsError(err)
                this.formSent = false;
            })
    }

    invalidFieldsError(err) {
        console.log(err)
        if (err.error.message.errors) {
            var errors = err.error.message.errors
            console.log(errors)
            var errorFields = Object.keys(errors)
            var invalidFieldsMessage = 'Corrija o' +
                (errorFields.length == 1 ? ' campo ' : 's campos ')
            try {
                for (let i = 0; i < errorFields.length; i++) {
                    let propsArr = errorFields[i].split(".")
                    let control = this.createForm.get(propsArr[0])
                    for (let i = 1; i < propsArr.length; i++) {
                        control = control.get(propsArr[i])
                    }
                    control.setErrors({ 'required': true })
                    invalidFieldsMessage += Globals.LABELS[propsArr[0]] +
                        (i < errorFields.length - 1 ? i < errorFields.length - 2 ? ', ' : ' e ' : '. ')
                }
            } catch (e) {
                console.log(e)
            }
            this.messenger.set({
                type: 'error',
                message: invalidFieldsMessage
            })
        }
        this.formSent = false;
        this.sendingForm = false;
    }

    saveNpi() {
        this.createForm.value.stage = 1
        this.resolveSubmission = this.npiService.createNpi(this.createForm.value)
            .concatMap(create => {
                console.log('NPI created');
                console.log(create.data);
                if (this.uploadService.totalSize) this.openSendingFormModal()
                return this.uploadService.upload(create.data.number).map(
                    upload => {
                        var res = { create, upload }
                        console.log(res)
                        return res
                    }
                )
            })

        this.createNpi()
    }

    submitToAnalisys() {
        this.createForm.value.stage = 2
        this.resolveSubmission = this.npiService.createNpi(this.createForm.value)
            .switchMap(create => {
                console.log('NPI created');
                console.log(create.data);
                if (this.uploadService.totalSize) this.openSendingFormModal()
                return this.uploadService.upload(create.data.number).map(
                    upload => {
                        var res = { create, upload }
                        console.log(res)
                        return res
                    }
                )
            }).switchMap(
                createUpload => {
                    console.log('Promoting NPI', createUpload.create.data.number);
                    return this.npiService.promoteNpi(createUpload.create.data.number)
                        .map(promote => {
                            return {
                                promote,
                                create: createUpload.create,
                                upload: createUpload.upload
                            }
                        })
                }
            )
        this.createNpi()
    }

    cancelNpi() {
        this.clearFields()
    }

    clearFields() {
        this.createForm.patchValue({
        });
        this.createForm.markAsPristine();
        this.createForm.markAsUntouched();
    }

    selectFiles(event) {
        event.stopPropagation()
    }

    fieldHasErrors(field) {
        let propsArr = field.split(".")
        let control = this.createForm.get(propsArr[0])
        for (let i = 1; i < propsArr.length; i++) {
            control = control.get(propsArr[i])
        }
        return control.hasError('required')
    }

    isRegulationApplyable() {
        return Object.keys((this.createForm.get("regulations").get("standard") as FormArray).controls)
            .some(reg => this.createForm.get("regulations").get("standard").get(reg).value == true)
    }

    loadNpiRef(res) {
        this.npiService.getNpi(res).subscribe(npi => { this.npiRef = npi[0] })
    }

    openNpiChooserModal() {
        const initialState = {
            npisList: this.npisList
        }
        this.modalRef = this.modalService.show(NpiChooserModalComponent, { initialState });
        this.modalRef.content.onConfirm.subscribe(npi => {
            this.npiRef = npi
            this.createForm.patchValue({
                npiRef: npi.number
            })
        })
    }

    openUploadModal(field: String) {
        this.modalRef = this.modalService.show(UploaderComponent, {
            initialState: { field },
            class: 'modal-lg modal-dialog-centered upload-modal'
        });
    }

    openSendingFormModal() {
        this.modalRef = this.modalService.show(SendingFormModalComponent, {
            class: 'modal-md modal-dialog-centered',
            backdrop: 'static',
            keyboard: false
        })
    }

    ngOnDestroy() {
        if (this.modalRef)
            this.modalRef.hide()
    }
    // ==================== OEM related methods ===================

    subscribeToInputChanges() {
        this.oemActivitiesFormArray.controls.forEach(activityControl => {

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

            /*if (this.utils.getOemActivity('DEV').dep.includes(activityControl.get('activity').value)) {
                activityControl.get('endDate').valueChanges.subscribe(
                    endDate => this.updateDevDate()
                )
            }*/
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

    insertOemActivities() {
        this.oemActivities.forEach(activity => {
            console.log(activity.value)
            var activityControl = this.fb.group(
                {
                    //_id: null,
                    activity: activity.value,
                    dept: activity.dept,
                    responsible: null,
                    term: activity.term,
                    startDate: this.getModelStartDate(activity.value),
                    endDate: this.getModelActivityEndDate(activity.value),
                    registry: null,
                    apply: true,
                }
            )
            let indexOfActivity = this.oemActivitiesFormArray.controls.indexOf(activityControl)
            if (indexOfActivity > -1)
                this.oemDatePickerConfig[indexOfActivity] = Object.assign(
                    this.oemDatePickerConfig[indexOfActivity],
                    {
                        minDate: activityControl.get('startDate').value
                    })

            this.oemActivitiesFormArray.controls.push(activityControl)
            //console.log(activityControl.value)
        });
    }

    //===================== Model functions ================================

    getModelStartDate(activityLabel: String): Date {
        let dependencies = this.getModelDependencyActivities(activityLabel)
        let startDate = new Date()
        if (dependencies) {
            dependencies.forEach(depActivity => {
                let depEndDate = this.getModelActivityEndDate(depActivity.value)
                //console.log(depEndDate)
                if (depEndDate)
                    startDate = new Date(Math.max(startDate.valueOf(), depEndDate.valueOf()))
                else console.log('no endDate for ', depActivity)
            })
        }
        return startDate
    }

    getModelActivityEndDate(activityLabel: String): Date {
        let activities = this.oemActivities
        let activity = activities.find(a => a.value == activityLabel)
        if (activity) {
            //console.log('activity: ' + activityLabel + ' -> ', greatestDate)
            return new Date(this.getModelStartDate(activityLabel).valueOf() + (activity.term as number) * DAYS)
        }
        return null
    }

    getModelDependencyActivities(activityLabel: String): Array<any> {
        let activities = this.oemActivities
        let dependencies = []
        let dependenciesLabels = this.utils.getOemActivity(activityLabel).dep
        if (dependenciesLabels) 
            dependencies = activities.filter(act => dependenciesLabels.includes(act.value))
        return dependencies
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
        let greatestDate = new Date()
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

        let indexOfActivity = this.oemActivitiesFormArray.controls.indexOf(activityControl)
        if (indexOfActivity > -1)
            this.oemDatePickerConfig[indexOfActivity] = Object.assign(
                this.oemDatePickerConfig[indexOfActivity],
                { minDate: startDate }
            )

        document.getElementById(activityControl.get('activity').value + "_START_DATE").dispatchEvent(new Event('valueChanges'))
        document.getElementById(activityControl.get('activity').value + "_END_DATE").dispatchEvent(new Event('valueChanges'))

        //Calculate if release date is dalayed
        //if (this.utils.getOemActivity('DEV').dep.includes(activityControl.get('activity').value)) {
            //console.log(activityControl.get('activity').value)
            document.getElementById(activityControl.get('activity').value + "_END_DATE").dispatchEvent(new Event('change'))
            //this.updateDelayedStatus()
        //}
    }

    getControlActivityStartDate(activityControl: AbstractControl): Date {
        let activityLabel = activityControl.get('activity').value
        //console.log(activityLabel)
        let dependenciesControls = this.getControlsDependencyActivities(activityControl)
        let startDate = new Date()

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
        let activity = this.oemActivitiesFormArray.controls.find(a => a.get('activity').value == activityLabel)
        if (activity) {
            if (activity.get('endDate').value) return new Date(Date.parse(activity.get('endDate').value))
            //console.log('activity: ' + activityLabel + ' -> ', greatestDate)
            return new Date(this.getControlActivityStartDate(activity).valueOf() + activity.get('term').value * DAYS)
        }
        return null
    }

    getControlsDependencyActivities(activityControl: AbstractControl): Array<AbstractControl> {
        let activityLabel = activityControl.get('activity').value
        let dependencies = []
        let dependenciesLabels = this.utils.getOemActivity(activityLabel).dep
        if (dependenciesLabels) {
            dependenciesLabels.forEach(dependencyLabel => {
                var dependencyControl = this.oemActivitiesFormArray.controls.find(npiAct => npiAct.get('activity').value == dependencyLabel)
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
        this.utils.getOemActivities().forEach(act => {
            if (act.dep && act.dep.includes(activityLabel)) {
                let activityControl = this.oemActivitiesFormArray.controls
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

    //========================================================================

    toggleApplyAll(event) {
        //console.log(event.target.checked)
        let status = event.target.checked
        this.oemActivitiesFormArray.controls.forEach(control => {
            let actLabel = control.get('activity').value
            if (!this.utils.getOemActivity(actLabel).required)
                control.patchValue({
                    apply: status
                })
        })
    }

    updateDevDate() {
        let devDate = new Date(null)
        //console.log(devDate)
        let releaseDependents = this.utils.getOemActivity('DEV').dep
        releaseDependents.forEach(depLabel => {
            let depControl = this.oemActivitiesFormArray.controls.find(a => a.get('activity').value == depLabel)
            let depEndDate = new Date(this.getControlActivityStartDate(depControl).valueOf() + (depControl.get('apply').value ? depControl.get('term').value : 0) * DAYS)
            //            console.log(depLabel, depEndDate, this.npi.inStockDate)
            devDate = new Date(Math.max(devDate.valueOf(), depEndDate.valueOf()))
        })
        this.devDate = devDate
        //this.updateDelayedStatus()
    }

}
