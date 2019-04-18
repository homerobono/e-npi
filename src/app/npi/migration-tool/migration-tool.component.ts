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
  selector: 'app-migration-tool',
  templateUrl: './migration-tool.component.html',
  styleUrls: ['./migration-tool.component.scss']
})
export class MigrationToolComponent implements OnInit {

  resolveSubmission: Observable<any>

  sendingForm: Boolean = false;
  formSent: Boolean = false;
  migrateResponse: String;

  npisList: Npi[]
  modalRef: BsModalRef;
  npiRef: Npi

  oemActivitiesFormArray: FormArray
  criticalFormArray: FormArray
  oemMacroActivitiesFormArray: FormArray
  nonOemMacroActivitiesFormArray: FormArray
  devDate: Date
  entry: String = 'oem'

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
  oemActivities: Array<any>

  pixelCriticalDepts: Array<any>
  nonPixelCriticalDepts: Array<any>

  deptUsers: any = {}
  allUsers = new Array<User>()
  pilotDate: String

  migrateForm: FormGroup;

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
        dateInputFormat: 'DD/MM/YYYY'
      }
    )
    var oemDefaultDeadLine = new Date(Date.now() + 3600000 * 24 * (167 + 30))
    this.oemActivitiesFormArray = fb.array([])
    this.oemMacroActivitiesFormArray = fb.array([])
    this.nonOemMacroActivitiesFormArray = fb.array([])
    this.criticalFormArray = fb.array([])

    this.migrateForm = fb.group({
      'number': null,
      'created': null,
      'client': 'Pixel',
      'requester': null,
      'name': 'Versões',
      'entry': 'oem',
      'npiRef': null,
      'designThinking': fb.group({
        'apply': null,
        'annex': []
      }),
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
      'oemActivities': this.oemActivitiesFormArray,
      'critical': this.criticalFormArray,
      'clientApproval': fb.group({
        'approval': 'accept',
        'comment': null,
        'annex': []
      }),
      'activities': null,
      'validation': fb.group({
        'final': ['Parecer Final', Validators.required],
        'signature': fb.group({
          'user': null,
          'date': null
        })
      })
    })

    this.pixelCriticalDepts = this.utils.getPixelCriticalDepartments()
    this.nonPixelCriticalDepts = this.pixelCriticalDepts.slice(1)
    this.oemActivities = this.utils.getOemActivities()

  }

  ngOnInit() {
    this.localeService.use('pt-br');

    this.npiService.npisList.subscribe(res => this.npisList = res)

    this.insertOemActivities()
    this.insertCriticalAnalisys()
    this.insertActivities()

    let regulations = this.utils.getRegulations()
    let additionalArray = this.migrateForm.get('regulations').get('standard') as FormGroup
    regulations.forEach(reg => {
      additionalArray.addControl(reg.value, this.fb.control(null))
    })

    this.migrateForm.get('npiRef').valueChanges.subscribe(res => { this.loadNpiRef(res) })

    this.userService.getUsers().subscribe(
      users => {
        this.allUsers = users.filter(user =>
          user.status == 'active' && user.department && user.level < 3
        );
        this.allUsers.forEach(user => {
          let dept = user.department as string
          if (!this.deptUsers[dept])
            this.deptUsers[dept] = new Array<User>()
          this.deptUsers[dept].push(user)
        })

        this.migrateForm.patchValue({
          'requester': this.allUsers[0]._id
        })
        this.migrateForm.patchValue({
          'validation': {
            'signature': {
              'user': this.allUsers[0]._id,
              'date': new Date()
            }
          }
        })

        this.oemActivitiesFormArray.controls.forEach(control => {
          if (this.deptUsers[control.get("dept").value])
            control.patchValue({
              'responsible': this.deptUsers[control.get("dept").value][0]._id
            })
        })
        this.criticalFormArray.controls.forEach(control => {
          if (this.deptUsers[control.get("dept").value])
            control.patchValue({
              'signature': {
                'user': this.deptUsers[control.get("dept").value][0]._id,
                'date': new Date()
              }
            })
        })
        this.oemMacroActivitiesFormArray.controls.forEach(control => {
          if (this.deptUsers[control.get("dept").value])
            control.patchValue({
              'responsible': this.deptUsers[control.get("dept").value][0]._id
            })
        })
        this.nonOemMacroActivitiesFormArray.controls.forEach(control => {
          if (this.deptUsers[control.get("dept").value])
            control.patchValue({
              'responsible': this.deptUsers[control.get("dept").value][0]._id
            })
        })
      });

    this.subscribeToInputChanges()
  }

  migrateNpi(migrateForm): void {
    let npiForm = migrateForm
    console.log(npiForm, this.uploadService.uploaders)

    for (let field in this.uploadService.uploaders) {
      let subfields = field.split(".")
      if (subfields[0] == 'activities' || field == 'oemActivities') {
        let index = npiForm[subfields[0]].findIndex(act => act.activity == subfields[1])
        npiForm[subfields[0]][index].annex =
          (this.uploadService.uploaders[field].queue as FileItem[]).map(
            fI => new FileDescriptor(field, fI.file)
          )
      } else {
        npiForm[field].annex =
          (this.uploadService.uploaders[field].queue as FileItem[]).map(
            fI => new FileDescriptor(field, fI.file)
          )
      }
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
          'message': 'NPI migrada com sucesso'
        });
        this.formSent = true;
        this.clearFields();
        this.router.navigateByUrl('/npi/' + res.migrate.data.number)
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
          let control = this.migrateForm.get(propsArr[0])
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

  saveNpi(migrateForm) {
    migrateForm.stage = 5
    migrateForm.validation.status = true

    if (migrateForm.clientApproval.approval == "deny") {
      delete migrateForm.activities
      delete migrateForm.validation
      migrateForm.stage = 0
    }
    console.log(migrateForm)

    if (migrateForm.entry != 'pixel') {
      migrateForm.critical.splice(0, 1)
    }


    this.resolveSubmission = this.npiService.migrateNpi(migrateForm)
      .concatMap(migrate => {
        console.log('NPI migrated');
        console.log(migrate.data);
        if (this.uploadService.totalSize) this.openSendingFormModal()
        return this.uploadService.upload(migrate.data.number).map(
          upload => {
            var res = { migrate, upload }
            console.log(res)
            return res
          }
        )
      })

    this.migrateNpi(migrateForm)
  }


  clearFields() {
    this.migrateForm.patchValue({
    });
    this.migrateForm.markAsPristine();
    this.migrateForm.markAsUntouched();
  }

  selectFiles(event) {
    event.stopPropagation()
  }

  fieldHasErrors(field) {
    let propsArr = field.split(".")
    let control = this.migrateForm.get(propsArr[0])
    for (let i = 1; i < propsArr.length; i++) {
      control = control.get(propsArr[i])
    }
    return control.hasError('required')
  }

  isRegulationApplyable() {
    return Object.keys((this.migrateForm.get("regulations").get("standard") as FormArray).controls)
      .some(reg => this.migrateForm.get("regulations").get("standard").get(reg).value == true)
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
      this.migrateForm.patchValue({
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

  subscribeToOemInputChanges() {
    this.oemActivitiesFormArray.controls.forEach(activityControl => {

      //this.activitiesFormArray.updateValueAndValidity()

      activityControl.get('term').valueChanges.subscribe(
        term => this.updateOemOwnDateField(term, activityControl))

      activityControl.get('endDate').valueChanges.subscribe(
        endDate => {
          this.updateOemDateFields(activityControl)
        })

      activityControl.get('apply').valueChanges.subscribe(
        apply => this.updateOemDateFields(activityControl))

      /*if (this.utils.getOemActivity('DEV').dep.includes(activityControl.get('activity').value)) {
          activityControl.get('endDate').valueChanges.subscribe(
              endDate => this.updateDevDate()
          )
      }*/
    })
  }

  insertOemActivities() {
    this.oemActivities.forEach(activity => {
      console.log(activity.dept)
      var oemActivityControl = this.fb.group(
        {
          //_id: null,
          activity: activity.value,
          responsible: null,
          dept: activity.dept,
          term: activity.term,
          startDate: this.getOemModelStartDate(activity.value),
          endDate: this.getOemModelActivityEndDate(activity.value),
          annex: null,
          registry: null,
          apply: true,
          signature: this.fb.group({
            user: null,
            date: new Date()
          })
        }
      )
      oemActivityControl.valueChanges.subscribe(value => {
        this.migrateForm.addControl('oemActivities', this.oemActivitiesFormArray)
      });
      this.oemActivitiesFormArray.controls.push(oemActivityControl)
      //console.log(activityControl.value)
    });
  }

  insertCriticalAnalisys() {
    console.log(this.pixelCriticalDepts)
    for (let i = 0; i < this.pixelCriticalDepts.length; i++) {
      let control = this.fb.group({
        dept: this.pixelCriticalDepts[i],
        status: "accept",
        comment: null,
        signature: this.fb.group({
          user: null,
          date: new Date()
        })
      })
      this.criticalFormArray.controls.push(control)
      control.valueChanges.subscribe(value => {
        //console.log('updating critical array')
        this.migrateForm.addControl('critical', this.criticalFormArray)
        this.migrateForm.updateValueAndValidity()
      });
    }
  }

  insertActivities() {
    var activitiesModelArray = this.utils.getActivities()
    //console.log(this.npi.getCriticalApprovalDate().toLocaleDateString())
    activitiesModelArray.forEach(activity => {
      if (activity.value != "RELEASE") {
        var activityControl = this.fb.group(
          {
            activity: activity.value,
            dept: activity.dept,
            responsible: null,
            term: null,
            startDate: null,
            endDate: new Date(),
            registry: null,
            annex: null,
            apply: true,
            closed: true,
            signature: this.fb.group({
              user: null,
              date: new Date()
            })
          }
        )
        this.oemMacroActivitiesFormArray.controls.push(activityControl)
        activityControl.valueChanges.subscribe(value => {
          if (this.migrateForm.get("entry").value == 'oem')
            this.migrateForm.addControl('activities', this.oemMacroActivitiesFormArray)
        });
      }
    });

    activitiesModelArray = this.utils.getActivities('oem')
    //console.log(this.npi.getCriticalApprovalDate().toLocaleDateString())
    activitiesModelArray.forEach(activity => {
      if (activity.value != "RELEASE") {
        var activityControl = this.fb.group(
          {
            activity: activity.value,
            dept: activity.dept,
            responsible: null,
            term: null,
            startDate: null,
            endDate: new Date(),
            registry: null,
            annex: null,
            apply: true,
            closed: true,
            signature: this.fb.group({
              user: null,
              date: new Date()
            })
          }
        )
        this.nonOemMacroActivitiesFormArray.controls.push(activityControl)
        activityControl.valueChanges.subscribe(value => {
          if (this.migrateForm.get("entry").value != 'oem')
            this.migrateForm.addControl('activities', this.nonOemMacroActivitiesFormArray)
        });
      }
      //console.log(activityControl.value)
    });

    this.migrateForm.setControl("activities", this.oemMacroActivitiesFormArray);
  }
  //===================== Model functions ================================

  displayActivityRow(activity: AbstractControl) {
    if (activity.get("apply").value)
        return "table-row"
    return "none"
}
  getOemModelStartDate(activityLabel: String): Date {
    let dependencies = this.getOemModelDependencyActivities(activityLabel)
    let startDate = new Date()
    if (dependencies) {
      dependencies.forEach(depActivity => {
        let depEndDate = this.getOemModelActivityEndDate(depActivity.value)
        //console.log(depEndDate)
        if (depEndDate)
          startDate = new Date(Math.max(startDate.valueOf(), depEndDate.valueOf()))
        else console.log('no endDate for ', depActivity)
      })
    }
    return startDate
  }

  getOemModelActivityEndDate(activityLabel: String): Date {
    let activities = this.oemActivities
    let activity = activities.find(a => a.value == activityLabel)
    if (activity) {
      //console.log('activity: ' + activityLabel + ' -> ', greatestDate)
      return new Date(this.getOemModelStartDate(activityLabel).valueOf() + (activity.term as number) * DAYS)
    }
    return null
  }

  getOemModelDependencyActivities(activityLabel: String): Array<any> {
    let activities = this.oemActivities
    let dependencies = []
    let dependenciesLabels = this.utils.getOemActivity(activityLabel).dep
    if (dependenciesLabels)
      dependencies = activities.filter(act => dependenciesLabels.includes(act.value))
    return dependencies
  }

  //===================== Form Controls Methods ================================

  updateOemOwnDateField(term, activityControl: AbstractControl) {
    //console.log(term)
    let startDate = this.getOemControlActivityStartDate(activityControl)
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

  updateOemDateFields(activityControl: AbstractControl) {
    let dependentsControls = this.getOemControlsDependentActivities(activityControl)
    if (dependentsControls) {
      let controlsLength = dependentsControls.length
      let i = 0;
      while (i < controlsLength) {
        let depControl = dependentsControls[i]
        let dependentsOfDependentsControls = this.getOemControlsDependentActivities(depControl)
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
        this.updateOemActivityDates(control)
      })
    }
  }

  updateOemActivityDates(activityControl: AbstractControl) {
    let greatestDate = new Date()
    let dependentActivities = this.getOemControlsDependencyActivities(activityControl)
    dependentActivities.forEach(dep => {
      let depEndDate = this.getOemControlActivityEndDate(dep)
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

    document.getElementById(activityControl.get('activity').value + "_END_DATE").dispatchEvent(new Event('valueChanges'))

    //Calculate if release date is dalayed
    //if (this.utils.getOemActivity('DEV').dep.includes(activityControl.get('activity').value)) {
    //console.log(activityControl.get('activity').value)
    document.getElementById(activityControl.get('activity').value + "_END_DATE").dispatchEvent(new Event('change'))
    //this.updateDelayedStatus()
    //}
  }

  getOemControlActivityStartDate(activityControl: AbstractControl): Date {
    let activityLabel = activityControl.get('activity').value
    //console.log(activityLabel)
    let dependenciesControls = this.getOemControlsDependencyActivities(activityControl)
    let startDate = new Date()

    if (dependenciesControls) {
      dependenciesControls.forEach(depActivity => {
        let depEndDate = this.getOemControlActivityEndDate(depActivity)
        //console.log(depEndDate)
        if (depEndDate)
          startDate = new Date(Math.max(startDate.valueOf(), depEndDate.valueOf()))
        //else console.log('no endDate for ', depActivity)
      })
    }
    return startDate
  }

  getOemControlActivityEndDate(activityControl: AbstractControl): Date {
    let activityLabel = activityControl.get('activity').value
    let activity = this.oemActivitiesFormArray.controls.find(a => a.get('activity').value == activityLabel)
    if (activity) {
      if (activity.get('endDate').value) return new Date(Date.parse(activity.get('endDate').value))
      //console.log('activity: ' + activityLabel + ' -> ', greatestDate)
      return new Date(this.getOemControlActivityStartDate(activity).valueOf() + activity.get('term').value * DAYS)
    }
    return null
  }

  getOemControlsDependencyActivities(activityControl: AbstractControl): Array<AbstractControl> {
    let activityLabel = activityControl.get('activity').value
    let dependencies = []
    let dependenciesLabels = this.utils.getOemActivity(activityLabel).dep
    if (dependenciesLabels) {
      dependenciesLabels.forEach(dependencyLabel => {
        var dependencyControl = this.oemActivitiesFormArray.controls.find(npiAct => npiAct.get('activity').value == dependencyLabel)
        var dependenciesArr = dependencyControl ? [dependencyControl] : []
        if (dependencyControl && !dependencyControl.get('apply').value) {
          dependenciesArr = this.getOemControlsDependencyActivities(dependencyControl)
          //console.log('recursing ', dependencyLabel, dependency)
        }
        if (dependenciesArr && dependenciesArr.length) {
          dependencies = dependencies.concat(dependenciesArr)
        }
      })
    }
    return dependencies
  }

  getOemControlsDependentActivities(activityControl: AbstractControl): Array<AbstractControl> {
    let activityLabel = activityControl.get('activity').value
    let deps = []
    this.utils.getOemActivities().forEach(act => {
      if (act.dep && act.dep.includes(activityLabel)) {
        let activityControl = this.oemActivitiesFormArray.controls
          .find(a => a.get('activity').value == act.value)
        if (activityControl) {
          deps.push(activityControl)
          if (!activityControl.get('apply').value)
            deps = deps.concat(this.getOemControlsDependentActivities(activityControl))
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
    this.oemMacroActivitiesFormArray.controls.forEach(control => {
      let actLabel = control.get('activity').value
      if (!this.utils.getActivity(actLabel, 'oem').required)
        control.patchValue({
          apply: status
        })
    })
    this.nonOemMacroActivitiesFormArray.controls.forEach(control => {
      let actLabel = control.get('activity').value
      if (!this.utils.getActivity(actLabel).required)
        control.patchValue({
          apply: status
        })
    })
  }

  toggleStatus(i, event) {
    event.stopPropagation()
    var statusControl = (this.criticalFormArray.controls[i] as FormGroup).get('status')
    if (event.target.value == statusControl.value) statusControl.setValue(null)
    setTimeout(() => console.log(statusControl.value), 100);
    //this.migrateForm.updateValueAndValidity()
  }

  //========================================================================
  //===================== Activities functions ================================
  //========================================================================



  subscribeToInputChanges() {
    this.migrateForm.get("entry").valueChanges.subscribe(entry => {
      console.log(entry)
      this.entry = entry
      if (entry == 'oem')
        this.migrateForm.addControl("activities", this.oemMacroActivitiesFormArray)
      else
        this.migrateForm.addControl("activities", this.nonOemMacroActivitiesFormArray)
    })
    this.oemMacroActivitiesFormArray.controls.forEach(activityControl => {
      activityControl.get('endDate').valueChanges.subscribe(
        endDate => {
          if (activityControl.get('activity').value == "PILOT")
            this.pilotDate =
              new Date(endDate)
                .toLocaleDateString('pt-br')
        })
    })
    this.nonOemMacroActivitiesFormArray.controls.forEach(activityControl => {
      activityControl.get('endDate').valueChanges.subscribe(
        endDate => {
          if (activityControl.get('activity').value == "PILOT")
            this.pilotDate =
              new Date(endDate)
                .toLocaleDateString('pt-br')
        })
    })
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
    let greatestDate = this.migrateForm.get('critical').value[4].signature
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

    //let indexOfActivity = this.activitiesFormArray.controls.indexOf(activityControl)

    document.getElementById(activityControl.get('activity').value + "_END_DATE").dispatchEvent(new Event('valueChanges'))
  }

  getControlActivityStartDate(activityControl: AbstractControl): Date {
    let activityLabel = activityControl.get('activity').value
    //console.log(activityLabel)
    let dependenciesControls = this.getControlsDependencyActivities(activityControl)
    let startDate = this.migrateForm.get('critical').value[4].signature

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
    let activity = (this.migrateForm.get("activities") as FormArray)
      .controls.find(a => a.get('activity').value == activityLabel)
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
    let dependenciesLabels = this.utils.getActivity(activityLabel, this.migrateForm.get('entry').value).dep
    if (dependenciesLabels) {
      dependenciesLabels.forEach(dependencyLabel => {
        var dependencyControl = (this.migrateForm.get("activities") as FormArray).controls.find(npiAct => npiAct.get('activity').value == dependencyLabel)
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
    this.utils.getActivities(this.migrateForm.get('entry').value).forEach(act => {
      if (act.dep && act.dep.includes(activityLabel)) {
        let activityControl = (this.migrateForm.get("activities") as FormArray).controls
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

}
