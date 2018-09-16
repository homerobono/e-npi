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

@Component({
  selector: 'app-npi',
  templateUrl: './npi.component.html',
  styleUrls: ['./npi.component.scss'],
  animations: [slideInOutBottomAnimation],
})

export class NpiComponent implements OnInit {

  resetFormFlagSubject = new Subject<Boolean>()
  resetFormFlag = true

  newFormVersion = new Subject<Boolean>()
  newFormVersionFlag: Boolean = false

  postConclusionEdit: Boolean = false
  editForm = new BehaviorSubject<Boolean>(false)
  editFlag: Boolean = false

  showNpiToolbar: Boolean = false

  response: any
  date: Date
  npiNumber: Number
  npi: Npi
  npiVersions: Npi[]
  authorName: String
  authorId: String

  titleEdit = false
  titleField: String

  sendingForm: Boolean = false;
  formSent: Boolean = false;
  editResponse: String

  scrollYPosition: Number

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
  ) {
    console.log('constructed again')
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
        minDate: new Date()
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
    this.route.params.subscribe(
      params => this.getNpi(params.npiNumber)
    )
    this.editForm.subscribe(
      flag => {
        console.log(flag)
        this.editFlag = flag
        flag ? this.npiForm.enable() : this.npiForm.disable()
      }
    )
    //setTimeout(() => console.log(this.npiForm.value), 1000)
    //changes.subscribe(res => {this.path = res[0].path; console.log('CHANGED ROUTE!')})
    //console.log(this.route.firstChild.snapshot.routeConfig.path.includes('edit'))
  }

  scrollBackToPosition(){
    var y = this.route.snapshot.params.scroll
    //console.log(y)
    if (y)
      setTimeout(() => window.scroll(0,y), 1)
  }

  getNpi(npiNumber) {
    //console.log('getting npi ' + npiNumber)
    this.npiService.getNpi(npiNumber)
      .subscribe(
        npis => {
          this.npi = npis[0]
          this.npiVersions = npis
          this.titleField = this.npi.name
          this.authorId = this.npi.requester._id
          this.authorName = this.npi.requester.firstName +
            (this.npi.requester.lastName ? ' ' + this.npi.requester.lastName : '')
          console.log(this.npi)
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

    npiForm.id = this.npi.id
    npiForm.entry = this.npi.entry

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
      this.npiService.updateNpi(npiForm).
        subscribe(
          res => this.successResponse(res),
          err => this.invalidFieldsError(err)
        )
  }

  successResponse(res) {
    console.log(res)
    this.formSent = true;

    if (res.data.changedFields && Object.keys(res.data.changedFields).length > 0)
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

  refresh(){
    this.getNpi(this.npi.number)
  }

  invalidFieldsError(err) {
    this.toggleEdit()
    console.log(err)
    if (err.error.message.errors) {
      var errors = err.error.message.errors
      var errorFields = Object.keys(errors)
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

  toggleEdit(){
    this.editForm.next(!this.editFlag)
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

  saveNpi(npiForm) {
    this.submitNpi(npiForm)
  }

  submitToAnalisys(npiForm) {
    npiForm.stage = 2
    if (!confirm(
      "Tem certeza que deseja enviar para Análise Crítica? Todos os funcionários envolvidos serão notificados da submissão.")
    ) return;
    this.submitNpi(npiForm)
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
    this.resetFormFlagSubject.next(!this.resetFormFlag)
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
      }
      )
  }

  finalizeNpi() {
    if (!confirm(
      "Tem certeza que deseja concluir a NPI? Depois de finalizada somente alguns campos poderão ser editados, mediante justificativa e posterior análise.")
    ) return;
    var finalForm = this.npiForm.value
    finalForm.stage = 5
    this.submitNpi(finalForm)
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
        activity.enable()
      }
    }
  }

  showYOffset() {
    try {
      console.log(pageYOffset)
    } catch (e) { console.log(e) }
  }

  openFileManager(){
    const initialState = {
      title: 'Modal with component'
    };
    let dialogRef = this.dialog.open(FileManagerComponent);
  }

  loadVersion(npi: Npi){
    this.npi = npi
  }

}

