import { Component, Inject, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, FormArray, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { createNumberMask } from 'text-mask-addons/dist/textMaskAddons';
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker'
import { defineLocale } from 'ngx-bootstrap/chronos';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

import { AuthService } from '../../../services/auth.service';
import { MessageService } from '../../../services/message.service';
import { NpiService } from '../../../services/npi.service'

import Npi from '../../../models/npi.model';

import { ptBrLocale } from 'ngx-bootstrap/locale';
import { UtilService } from '../../../services/util.service';
import { Globals } from 'config';
import { NpiChooserModalComponent } from '../../npi-chooser-modal/npi-chooser-modal.component';
import { UploaderComponent } from '../../../file-manager/uploader/uploader.component';
import { UploadService } from '../../../services/upload.service';
import { concatMap, multicast } from 'rxjs/operators';
import { SendingFormModalComponent } from '../../sending-form-modal/sending-form-modal.component';
import { FileItem } from 'ng2-file-upload';
import { FileDescriptor } from '../../../models/file-descriptor';
import { of, Observable, Subject } from 'rxjs';
import { map } from 'rxjs-compat/operator/map';
import { UsersService } from 'src/app/services/users.service';
import User from 'src/app/models/user.model';
import { FileManagerComponent } from 'src/app/file-manager/file-manager.component';

defineLocale('pt-br', ptBrLocale)
const DAYS = 24 * 3600 * 1000

@Component({
  selector: 'app-migration-edit',
  templateUrl: './migration-edit.component.html',
  styleUrls: ['./migration-edit.component.scss']
})
export class MigrationEditComponent implements OnInit {

  resolveSubmission: Observable<any>
  private ngUnsubscribe = new Subject();

  sendingForm: Boolean = false;
  formSent: Boolean = false;
  migrateResponse: String;

  npi: Npi = new Npi()
  npiVersions: Npi[]
  npisList: Npi[]
  modalRef: BsModalRef;
  npiRef: Npi

  oemActivitiesFormArray: FormArray
  criticalFormArray: FormArray
  activitiesFormArray: FormArray
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
    public route: ActivatedRoute,
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
        //dateInputFormat: 'DD/MM/YYYY'
      }
    )
    var oemDefaultDeadLine = new Date(Date.now() + 3600000 * 24 * (167 + 30))
    this.oemActivitiesFormArray = fb.array([])
    this.activitiesFormArray = fb.array([])
    this.criticalFormArray = fb.array([])

    this.migrateForm = fb.group({
      'number': null,
      'created': null,
      'client': null,
      'requester': null,
      'name': null,
      'entry': new FormControl({ value: null, disabled: true }),
      'npiRef': null,
      'designThinking': fb.group({
        'apply': null,
        'annex': []
      }),
      'description': fb.group({
        'description': null,
        'annex': null
      }),
      'resources': fb.group({
        'description': null,
        'annex': null
      }),
      'regulations': fb.group({
        'standard': fb.group({}),
        'additional': null,
        'description': null,
        'annex': null
      }),
      'cost': fb.group({
        'value': null,
        'currency': 'BRL'
      }),
      'price': fb.group({
        'value': null,
        'currency': 'BRL'
      }),
      'inStockDateType': 'fixed',
      'inStockDate': oemDefaultDeadLine,
      'investment': fb.group({
        'value': null,
        'currency': 'BRL',
        'annex': null
      }),
      'projectCost': fb.group({
        'value': null,
        'currency': 'BRL',
        'annex': null
      }),
      'demand': fb.group({
        'amount': 1000,
        'period': null
      }),
      'fiscals': null,
      'oemActivities': this.oemActivitiesFormArray,
      'critical': this.criticalFormArray,
      'clientApproval': fb.group({
        'approval': null,
        'comment': null,
        'annex': []
      }),
      'activities': this.activitiesFormArray,
      'validation': fb.group({
        'final': [null, Validators.required],
        'signature': fb.group({
          'user': null,
          'date': null
        })
      })
    })
  }

  ngOnInit() {
    this.localeService.use('pt-br');

    this.npiService.npisList.subscribe(res => this.npisList = res)

    this.route.params.concatMap(
      params =>
        this.npiService.getNpi(params.npiNumber)
    ).subscribe(
      npis => {
        this.npi = npis[0]
        this.npiVersions = npis
        this.insertOemActivities()
        this.insertCriticalAnalisys()
        this.insertActivities()
        this.fillFormData()
      }, err => {
        //this.location.replaceState(null)
        this.router.navigateByUrl('/error')
      }
    )

    let regulations = this.utils.getRegulations()
    let additionalArray = this.migrateForm.get('regulations').get('standard') as FormGroup
    regulations.forEach(reg => {
      additionalArray.addControl(reg.value, this.fb.control(null))
    })

    this.migrateForm.get('npiRef').valueChanges.subscribe(res => this.loadNpiRef(res))

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
      });

    this.subscribeToInputChanges()
  }

  fillFormData() {

    this.fillNestedFormData(this.migrateForm, this.npi)

    this.migrateForm.patchValue({
      npiRef: this.npi.npiRef ? this.npi.npiRef.number : null,

      projectCost: this.npi.projectCost ?
        {
          value: this.npi.projectCost.value ?
            this.npi.projectCost.value.toFixed(2).toString().replace('.', ',')
            : null,
          currency: this.npi.projectCost.currency ?
            this.npi.projectCost.currency : null,
          annex: this.npi.projectCost.annex ?
            this.npi.projectCost.annex : []
        } : null,
      investment: this.npi.investment ?
        {
          value: this.npi.investment.value ?
            this.npi.investment.value.toFixed(2).toString().replace('.', ',')
            : null,
          currency: this.npi.investment.currency ?
            this.npi.investment.currency : null,
          annex: this.npi.investment.annex ?
            this.npi.investment.annex : []
        } : null,
      requester: this.npi.requester._id
    })
    if (this.npi.entry == 'pixel' || this.npi.entry == 'custom')
      this.migrateForm.patchValue({
        price: this.npi.price ? {
          value: this.npi.price.value ?
            this.npi.price.value.toFixed(2).toString().replace('.', ',')
            : null,
          currency: this.npi.price.currency ?
            this.npi.price.currency : null,
        } : null,
        cost: this.npi.cost ? {
          value: this.npi.cost.value ?
            this.npi.cost.value.toFixed(2).toString().replace('.', ',')
            : null,
          currency: this.npi.cost.currency ?
            this.npi.cost.currency : null,
        } : null,
      });

    this.npi.critical.forEach(analisys => {
      let control = (this.migrateForm.get("critical") as FormArray).controls
        .find(actControl => actControl.get("dept").value == analisys.dept)
      control.patchValue({
        signature: {
          user: analisys.signature.user._id,
          date: analisys.signature.date
        }
      })
    });

    if (this.npi.oemActivities)
      this.npi.oemActivities.forEach(activity => {
        let control = (this.migrateForm.get("oemActivities") as FormArray).controls
          .find(actControl => actControl.get("activity").value == activity.activity)
        control.patchValue({
          signature: {
            user: activity.signature.user._id,
            date: activity.signature.date
          }
        })
      });

    this.npi.activities.forEach(activity => {
      let control = (this.migrateForm.get("activities") as FormArray).controls
        .find(actControl => actControl.get("activity").value == activity.activity)
      control.patchValue({
        signature: {
          user: activity.signature.user._id,
          date: activity.signature.date
        }
      })
    });
  }

  fillNestedFormData(form: FormGroup | FormArray, model) {
    Object.keys(form.controls).forEach((field: string) => {
      const control = form.get(field)
      if ((control instanceof FormGroup || control instanceof FormArray)
        && model[field]) {
        this.fillNestedFormData(control, model[field])
      } else
        if (model[field] != null && model[field] != undefined) {
          try {
            control.setValue(model[field])
          }
          catch (err) { console.log(err) }
        }
    })
  }

  migrateUpdateNpi(migrateForm): void {

    this.openSendingFormModal()

    let npiForm = migrateForm
    console.log(npiForm, this.uploadService.uploaders)

    npiForm.number = this.npi.number
    npiForm.id = this.npi.id

    for (let field in this.uploadService.uploaders) {
      console.log(field, this.uploadService.uploaders[field].queue)
      let propsArr = field.split(".")
      let subfield = npiForm[propsArr[0]]
      console.log(subfield)
      if (propsArr.length > 1)
        subfield = subfield.find(act => act.activity == propsArr[1])
      console.log(subfield)
      if (!subfield.annex)
        subfield.annex = []
      subfield.annex = subfield.annex.concat(
        (this.uploadService.uploaders[field].queue as FileItem[]).map(
          fI => new FileDescriptor(field, fI.file)
        ))
    }

    console.log(npiForm)
    this.sendingForm = true

    this.resolveSubmission
      .finally(() => {
        this.sendingForm = false;
        setTimeout(() => this.modalRef.hide(), 500)
      })
      .subscribe(res => {
        if (res.upload && !this.uploadService.isUploading) {
          console.log('All complete');
          console.log(res);
          this.messenger.set({
            'type': 'success',
            'message': 'NPI editada com sucesso'
          });
          this.formSent = true;
          this.router.navigateByUrl('/npi/' + res.update.data.npi.number)
        }
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

  updateNpi(migrateForm) {
    migrateForm.stage = 5
    migrateForm.entry = this.npi.entry
    migrateForm.__t = this.npi.entry

    if (migrateForm.clientApproval.approval == "deny") {
      delete migrateForm.activities
      delete migrateForm.validation
      migrateForm.stage = 0
    }
    console.log(migrateForm)

    this.resolveSubmission = this.npiService.migrateUpdateNpi(migrateForm)

    this.migrateUpdateNpi(migrateForm)
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
    if (!isNaN(res) && res != null) {
      console.log(res)
      this.npiService.getNpi(res).subscribe(npi => { this.npiRef = npi[0] })
    }
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

  openFileAction(field) {
    if (!this.npi[field].annex || !this.npi[field].annex.length)
      this.openUploadModal(field)
    else this.openFileManager(field)
  }

  openUploadModal(field: String) {
    this.modalRef = this.modalService.show(UploaderComponent, {
      initialState: { field },
      class: 'modal-lg modal-dialog-centered upload-modal'
    });
  }

  openFileManager(field) {
    const initialState = {
      npiId: this.npi.id,
      field,
      editFlag: true
    }
    this.modalRef = this.modalService.show(
      FileManagerComponent,
      {
        initialState,
        class: "modal-lg"
      });
  }

  openSendingFormModal() {
    this.modalRef = this.modalService.show(SendingFormModalComponent, {
      class: 'modal-md modal-dialog-centered',
      backdrop: 'static',
      keyboard: false
    })
  }
  // ==================== OEM related methods ===================

  insertOemActivities() {
    if (this.npi.oemActivities)
      this.npi.oemActivities.forEach(activity => {
        var oemActivityControl = this.fb.group(
          {
            _id: activity._id,
            activity: activity.activity,
            dept: activity.dept,
            responsible: activity.responsible._id,
            endDate: activity.signature.date,
            annex: activity.annex,
            registry: activity.registry,
            apply: activity.apply,
            signature: this.fb.group({
              user: null,
              date: activity.signature.date
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

  //========================================================================
  //===================== Model functions ================================
  //========================================================================

  toggleApplyAll(event) {
    //console.log(event.target.checked)
    let status = event.target.checked
    this.activitiesFormArray.controls.forEach(control => {
      let actLabel = control.get('activity').value
      if (!this.utils.getActivity(actLabel, 'oem').required)
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
  //===================== Critical Analisys ================================
  //========================================================================

  insertCriticalAnalisys() {
    this.npi.critical.forEach(analisys => {
      let control = this.fb.group({
        _id: analisys._id,
        dept: analisys.dept,
        status: analisys.status,
        comment: analisys.comment,
        signature: this.fb.group({
          user: analisys.signature.user._id,
          date: analisys.signature.date,
        })
      })
      this.criticalFormArray.controls.push(control)
      control.valueChanges.subscribe(value => {
        this.migrateForm.addControl('critical', this.criticalFormArray)
        //this.migrateForm.updateValueAndValidity()
      });
    });
  }

  //========================================================================
  //===================== Activities functions ================================
  //========================================================================

  insertActivities() {
    //console.log(this.npi.getCriticalApprovalDate().toLocaleDateString())
    this.npi.activities.forEach(activity => {
      var activityControl = this.fb.group(
        {
          _id: activity._id,
          activity: activity.activity,
          dept: activity.dept,
          responsible: activity.responsible._id,
          registry: activity.registry,
          endDate: activity.signature.date,
          annex: activity.annex,
          apply: activity.apply,
          closed: activity.closed,
          signature: this.fb.group({
            user: null,
            date: activity.signature.date
          })
        }
      )
      this.activitiesFormArray.controls.push(activityControl)
      activityControl.valueChanges.subscribe(value => {
        this.migrateForm.addControl('activities', this.activitiesFormArray)
      });
    });
  }

  subscribeToInputChanges() {
    this.activitiesFormArray.controls.forEach(activityControl => {
      if (activityControl.get('activity').value == "PILOT")
        activityControl.get('endDate').valueChanges.subscribe(
          endDate => {
            console.log("Data piloto atualizada")
            this.pilotDate =
              new Date(endDate)
                .toLocaleDateString('pt-br')
          })
    })
  }

  //===================== Form Controls Methods ================================

  getControlsDependencyActivities(activity: any): Array<AbstractControl> {
    let activityLabel = activity['activity']
    let dependencies = []
    let dependenciesLabels = this.utils.getActivity(activityLabel, this.migrateForm.get('entry').value).dep
    if (dependenciesLabels) {
      dependenciesLabels.forEach(dependencyLabel => {
        var dependencyControl = (this.migrateForm.get("activities") as FormArray).controls.find(npiAct => npiAct.get('activity').value == dependencyLabel)
        var dependenciesArr = dependencyControl ? [dependencyControl] : []
        if (dependencyControl && !dependencyControl.get('apply').value) {
          dependenciesArr = this.getControlsDependencyActivities(dependencyControl.value)
          //console.log('recursing ', dependencyLabel, dependency)
        }
        if (dependenciesArr && dependenciesArr.length) {
          dependencies = dependencies.concat(dependenciesArr)
        }
      })
    }
    return dependencies
  }

  getControlsDependentActivities(activity: any): Array<AbstractControl> {
    let activityLabel = activity['activity']
    let deps = []
    this.utils.getActivities(this.migrateForm.get('entry').value).forEach(act => {
      if (act.dep && act.dep.includes(activityLabel)) {
        let activityControl = (this.migrateForm.get("activities") as FormArray).controls
          .find(a => a.get('activity').value == act.value)
        if (activityControl) {
          deps.push(activityControl)
          if (!activityControl.get('apply').value)
            deps = deps.concat(this.getControlsDependentActivities(activityControl.value))
        }
      }
    })
    return deps
  }
  //========================================================================
  //===================== Model functions ================================

  ngOnDestroy() {
    console.log('Destroying npiComponent')
    this.uploadService.cleanUp()
    this.ngUnsubscribe.next()
    this.ngUnsubscribe.complete()
  }

}
