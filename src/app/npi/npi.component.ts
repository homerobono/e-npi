import { Component, OnInit, ViewChildren, ViewChild, HostListener, AfterViewInit, AfterViewChecked } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { BsLocaleService, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { createNumberMask } from 'text-mask-addons/dist/textMaskAddons';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { NpiService } from '../services/npi.service';
import { AuthService } from '../services/auth.service';
import { MessageService } from '../services/message.service';

import Npi from '../models/npi.model';
import { Location } from '@angular/common';
import { Subject, Observable, BehaviorSubject } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import { UtilService } from '../services/util.service';
import { Globals } from 'config';
import { slideInOutBottomAnimation } from '../_animations/slide_in_out.animation';
import { FileManagerComponent } from '../file-manager/file-manager.component';
import { MatDialog } from '@angular/material/dialog';
import { NpiChooserModalComponent } from './npi-chooser-modal/npi-chooser-modal.component';
import { FileDescriptor } from '../models/file-descriptor';
import { FileItem } from 'ng2-file-upload';
import { UploadService } from '../services/upload.service';
import { UploaderComponent } from '../file-manager/uploader/uploader.component';
import { SendingFormModalComponent } from './sending-form-modal/sending-form-modal.component';
import User from '../models/user.model';

@Component({
  selector: 'app-npi',
  templateUrl: './npi.component.html',
  styleUrls: ['./npi.component.scss'],
  animations: [slideInOutBottomAnimation],
})

export class NpiComponent implements OnInit {

  private ngUnsubscribe = new Subject();

  resolveSubmission: Observable<any>

  resetFormFlagSubject = new Subject()
  resetFormFlag = true

  newFormVersion = new Subject<Boolean>()
  newFormVersionFlag: Boolean = false

  postConclusionEdit: Boolean = false
  editFlag: Boolean = false

  showNpiToolbar: Boolean = false

  response: any
  date: Date

  user: User
  npisList: Npi[]
  npi: Npi

  invalidFields: Array<any> = []

  lastModifiedDifference: String
  canIChangeActivities: Boolean
  isReleaseEstimateDelayed: Boolean

  npiNumber: Number
  npiVersions: Npi[]
  authorName: String
  authorId: String

  titleEdit = false
  titleField: String

  sendingForm: Boolean = false;
  formSent: Boolean = false;
  editResponse: String

  scrollYPosition: Number

  modalRef: BsModalRef;
  npiRef: Npi

  motivations = [
    { value: 'CLIENT', label: 'Solicitação de Cliente' },
    { value: 'UPDATE', label: 'Atualização' },
    { value: 'CORRECTION', label: 'Correção' }
  ]

  afectedFields = [
    'LAYOUT',
    'FIRMWARE',
    'MECHANICS',
    'SPECS',
    'BOM',
    'QUOTATION',
    'REQUIRE',
    'STATIONERY'
  ]


  currency = createNumberMask({
    prefix: '',
    includeThousandsSeparator: true,
    thousandsSeparatorSymbol: '.',
    requireDecimal: true,
    decimalSymbol: ',',
    allowNegative: false,
  })

  public currencyMask = {
    mask: this.currency,
    guide: false,
  }

  public dateMask = {
    mask: ['/\d/', '/', '/\d/', '/']
  }

  datePickerConfig: Partial<BsDatepickerConfig>;
  npiForm: FormGroup;

  bsModalRef: BsModalRef

  constructor(
    private fb: FormBuilder,
    private npiService: NpiService,
    private authService: AuthService,
    private router: Router,
    public route: ActivatedRoute,
    private messenger: MessageService,
    private localeService: BsLocaleService,
    private location: Location,
    private utils: UtilService,
    private modalService: BsModalService,
    public dialog: MatDialog,
    private uploadService: UploadService
  ) {
    this.user = authService.getUser()
    this.npi = new Npi(null)
    this.npiVersions = new Array<Npi>()
    this.npiForm = fb.group({})
    //this.titleField = this.npi.name
    this.datePickerConfig = Object.assign(
      {},
      {
        containerClass: 'theme-default',
        showWeekNumbers: false,
        dateInputFormat: 'DD/MM/YYYY',
        minDate: new Date(),
        //placement: 'right'
      }
    )
  }

  @HostListener('window:scroll', ['$event'])
  handleScrollEvent(e) {
    this.scrollYPosition = pageYOffset
    if (pageYOffset > 240) {
      this.showNpiToolbar = true
    } else
      this.showNpiToolbar = false
  }

  ngOnInit() {
    this.messenger.response.subscribe(
      res => { this.response = res }
    )
    this.localeService.use('pt-br');

    this.canIChangeActivities = (typeof this.npi.activities != undefined) &&
      (this.user.level > 1 || (this.user.level == 1 && this.user.department == "MPR"))

    this.route.params.subscribe(
      params => this.getNpi(params.npiNumber)
    )

    this.npiService.npisList.subscribe(
      res => this.npisList = res
    )

    setInterval(() => this.lastModifiedDifference = this.utils.getTimeDifference(null, this.npi.updated),
      1000)

    //setTimeout(() => this.openFileManager('resources'), 400)

    //setTimeout(() => console.log(this.npiForm.value), 1000)
    //changes.subscribe(res => {this.path = res[0].path; console.log('CHANGED ROUTE!')})
    //console.log(this.route.firstChild.snapshot.routeConfig.path.includes('edit'))
  }

  scrollBackToPosition() {
    var y = this.route.snapshot.params.scroll
    //console.log(y)
    if (y)
      setTimeout(() => window.scroll(0, y), 1)
  }

  getNpi(npiNumber) {
    //console.log('getting npi ' + npiNumber)
    this.npiService.getNpi(npiNumber).takeUntil(this.ngUnsubscribe)
      .subscribe(
        npis => {
          this.npi = npis[0]
          this.npiVersions = npis
          this.titleField = this.npi.name
          if (this.npi.requester) {
            this.authorId = this.npi.requester._id
            this.authorName = this.npi.requester.firstName +
              (this.npi.requester.lastName ? ' ' + this.npi.requester.lastName : '')
          }
          this.lastModifiedDifference = this.utils.getTimeDifference(null, this.npi.updated)
          console.log(this.npi)
          //this.resetFormFlagSubject.next()
        }, err => {
          this.location.replaceState(null)
          this.router.navigateByUrl('/error')
        }
      )
  }

  submitNpi(npiForm): void {
    this.toggleEdit()
    this.sendingForm = true

    npiForm.name = this.titleField
    npiForm.number = this.npi.number
    npiForm.id = this.npi.id
    npiForm.entry = this.npi.entry

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

    if (this.newFormVersionFlag) {
      console.log('creating NPI version: ')
      npiForm.number = this.npi.number
      npiForm.stage = this.npi.stage
      this.npiService.newNpiVersion(npiForm).
        subscribe(
          res => this.successResponse(res),
          err => this.invalidFieldsError(err)
        )
    } else
      this.resolveSubmission.subscribe(
        res => this.successResponse(res),
        err => this.invalidFieldsError(err)
      )
  }

  saveNpi(npiForm) {
    if (this.npi.stage == 2 && this.isFinalApproval())
      this.promoteNpi(npiForm)
    else {
      this.resolveSubmission = this.npiService.updateNpi(this.npiForm.value)
      this.submitNpi(npiForm)
    }

  }

  submitToAnalisys(npiForm) {
    if (!confirm(
      "Tem certeza que deseja enviar para Análise Crítica? Todos os funcionários envolvidos serão notificados da submissão.")
    ) return;
    this.promoteNpi(npiForm)
  }

  promoteNpi(npiForm) {
    this.resolveSubmission = this.npiService.updateAndPromoteNpi(this.npiForm.value)
    this.submitNpi(npiForm)
  }

  closeActivity(activityControl) {
    let form = this.npiForm.value
    form.activities = [activityControl.value]
    this.saveNpi(this.npiForm.value)
  }

  successResponse(res) {
    console.log(res)
    this.formSent = true;

    if (res.update.data.changedFields && Object.keys(res.update.data.changedFields).length > 0)
      this.messenger.set({
        'type': 'success',
        'message': 'NPI atualizada com sucesso'
      });
    else
      this.messenger.set({
        'type': 'info',
        'message': 'Nenhum campo modificado'
      });
    this.sendingForm = false;
    this.refresh()
  }

  refresh() {
    this.getNpi(this.npi.number)
  }

  invalidFieldsError(err) {
    this.toggleEdit()
    console.log(err)
    if (err.error.message.errors) {
      var errors = err.error.message.errors
      var errorFields = Object.keys(errors)
      this.invalidFields = errorFields
      var invalidFieldsMessage = 'Corrija o' +
        (errorFields.length == 1 ? ' campo ' : 's campos ')
      try {
        for (let i = 0; i < errorFields.length; i++) {
          let propsArr = errorFields[i].split(".")
          let control = this.npiForm.get(propsArr[0])
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

  toggleEdit() {
    if (this.canIEdit())
      this.editFlag = !this.editFlag
  }

  toggleTitleEdit(event) {
    if (this.editFlag)
      if (event.target.id == 'titleLabel')
        this.titleEdit = true
      else
        this.titleEdit = false
  }

  changeTitle(event: KeyboardEvent) {
    switch (event.key) {
      case "Enter":
        console.log('saving title')
        this.titleEdit = false
        break
      case "Escape":
        console.log('Escape')
        this.titleEdit = false
        this.titleField = this.npi.name
        break
      default:
    }
  }

  fieldHasErrors(field) {
    return this.npiForm.controls[field].hasError('required')
  }

  cancelNpi() {
    if (this.npi.stage < 2)
      if (!confirm(
        "Tem certeza que deseja REMOVER a NPI #" + this.npi.number + " do banco de dados? Essa operação não poderá ser desfeita.")
      ) return;
    this.npiService.deleteNpi(this.npi.id).subscribe(
      res => {
        this.messenger.set({
          'type': 'success',
          'message': 'NPI #' + this.npi.number + ' cancelada'
        });
        this.router.navigate(['/home'])
      },
      err => { }
    )
  }

  reset() {
    this.resetFormFlagSubject.next()
    this.resetFormFlag = !this.resetFormFlag
  }

  setChild(form) {
    Object.keys(form.controls).forEach((field: string) => {
      this.npiForm.addControl(field, form.get(field))
    });
    this.npiForm.updateValueAndValidity()
  }

  newOemVersion(): void {

    this.npiService.newNpiVersion(this.npiForm.value).
      subscribe(res => {
        console.log(res)
        this.formSent = true;
        this.sendingForm = false;
        //this.router.navigate(['/npi/' + this.npi.number + '/edit'], { relativeTo: this.route })
      }, err => {
        console.log(err)
        this.formSent = false;
        this.sendingForm = false;
      })
  }

  finalApprove() {
    if (!confirm(
      "Tem certeza que deseja aprovar a NPI?")
    ) return;
    this.promoteNpi(this.npiForm.value)
  }

  finalizeNpi() {
    if (!confirm(
      "Tem certeza que deseja concluir a NPI? Depois de finalizada somente alguns campos poderão ser editados, mediante justificativa e posterior análise.")
    ) return;
    this.promoteNpi(this.npiForm.value)
  }

  togglePostConclusionEdit() {
    this.postConclusionEdit = !this.postConclusionEdit
  }

  enablePostConclusionEditFields(field) {
    let activitiesFormArray = (this.npiForm.get('activities') as FormArray)
    for (let i = 0; i < activitiesFormArray.length; i++) {
      let activity = activitiesFormArray.controls[i] as FormGroup
      if (activity.get('activity').value == field) {
        console.log('enabling ' + field)
        activity.enable({ emitEvent: false })
      }
    }
  }

  showYOffset() {
    try {
      console.log(pageYOffset)
    } catch (e) { console.log(e) }
  }

  openFileManager(field) {
    const initialState = {
      npiNumber: this.npi.number,
      field
    }
    this.modalRef = this.modalService.show(
      FileManagerComponent,
      {
        initialState,
        class: "modal-lg"
      });
  }

  loadVersion(npi: Npi) {
    this.npi = npi
  }

  loadNpiRef(res) {
    if (res && typeof res == 'number')
      this.npiService.getNpi(res).subscribe(npi => {
        this.npiRef = npi[0]
      })
  }

  isFinalApproval() {
    if (this.npi.stage == 2 && this.npiForm.getRawValue().critical)
      return this.npiForm.getRawValue().critical.every(analysis => analysis.status == 'accept')
    return false
  }

  openNpiChooserModal() {
    const initialState = {
      npisList: this.npisList
    }
    this.modalRef = this.modalService.show(NpiChooserModalComponent, { initialState });
    this.modalRef.content.onConfirm.subscribe(npi => {
      this.npiRef = npi
      this.npiForm.patchValue({
        npiRef: npi.number
      })
    })
  }

  openFileUploader(field: String) {
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

  canIEdit() {
    return this.npi.stage < 5 && (
      // Usuário Básico (padrão)
      (this.user.level == 0 && (
        (this.amITheOwner() && (this.npi.stage == 1 ||
          (this.npi.stage == 2 && !this.npi.isApproved() && (this.npi.hasCriticalDisapproval() || !this.npi.hasCriticalApproval())) ||
          (this.npi.stage == 4 && this.npi.isComplete()))
        ) ||
        (this.npi.stage == 4 && this.iHavePendingTask())
      ))
      || // Usuário Gestor
      (this.user.level == 1 && (
        (this.npi.stage == 1 && this.amITheOwner()) ||
        (this.npi.stage == 2 && (
          (!this.npi.isCriticallyApproved() && this.amICriticalAnalyser()) || 
          (this.npi.isCriticallyApproved() && this.user.department == "MPR"))
        ) ||
        (this.npi.stage == 3 && this.user.department == "COM" && this.user.level == 1) ||
        (this.npi.stage == 4 && (
          (!this.npi.isComplete() && this.iHavePendingTask()) ||
          (this.npi.isComplete() && (this.user.department == "MEP" || this.amITheOwner()))
        ))
      ))
      || // Usuário Master
      this.user.level == 2
    )
  }

  amICriticalAnalyser() {
    return this.npi.critical.some(
      analysis => analysis.dept == this.user.department && this.user.level == 1
    )
  }

  iHavePendingTask() {
    return this.user.level == 2 || this.npi.activities.some(activity =>
      !activity.closed && // em aberto
      (activity.responsible == this.user._id || ( // E (sou responsavel OU sou gestor da atividade)
        this.user.department == activity.dept && this.user.level >= 1)
      )
    )
  }

  amITheOwner(): Boolean {
    if (this.npi.requester && this.user)
      return this.npi.requester._id == this.user._id
    return false
  }

  setReleaseEstimateDelayedStatus(status) {
    console.log(status)
    this.isReleaseEstimateDelayed = status
  }

  ngOnDestroy() {
    console.log('Destroying npiComponent')
    this.uploadService.cleanUp()
    this.ngUnsubscribe.next()
    this.ngUnsubscribe.complete()
  }

  canCloseNpi() {
    return (this.npiForm.get("validation") != null && this.npiForm.get("validation").valid)
  }

}

