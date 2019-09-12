import { Component, OnInit, HostListener, Input } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { UtilService } from 'src/app/services/util.service';
import { Subject, throwError } from 'rxjs';
import { of } from 'rxjs/observable/of';
import Npi from 'src/app/models/npi.model';
import User from 'src/app/models/user.model';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NpiComponent } from '../../npi.component';
import { UploaderComponent } from 'src/app/file-manager/uploader/uploader.component';
import { FileManagerComponent } from 'src/app/file-manager/file-manager.component';

@Component({
  selector: 'app-revision',
  templateUrl: './revision.component.html',
  styleUrls: ['./revision.component.scss']
})
export class RevisionComponent implements OnInit {

  npi: Npi
  onConfirm = new Subject<any>()
  myActivities: Array<any>
  revisionForm: FormGroup
  options: {}

  constructor(
    public modalRef: BsModalRef,
    public utils: UtilService,
    public fb: FormBuilder,
    private modalService: BsModalService
  ) {
  }

  ngOnInit() {
    this.myActivities = this.myActivities.map(activity => {
      activity.number = this.npi.activities.findIndex(a => a.activity == activity.activity)
      return activity
    })
    console.log(this.options)
    this.revisionForm = this.fb.group({})
    this.myActivities.forEach(act => {
      this.revisionForm.addControl(act.activity, this.fb.group({
        apply: this.options[act.activity],
        annex: [],
        replace: []
      }))
    })
  }

  @HostListener('window:keyup', ['$event'])
  keyUpEvent(e) {
    e.stopPropagation()
    if (e.keyCode == 13) {
      this.confirm()
    }
  }

  openActivityFileSelector(activity) {
    this.activityFileSelector(activity).subscribe()
  }

  activityFileSelector(activity) {
    return this.openFileUploader(
      "activities." + activity.activity,
      { ok: "Prosseguir", cancel: "Cancelar" }
    )
      .concatMap((res: boolean) => {
        console.log("upload files selected", res)
        this.revisionForm.get(activity.activity).get("annex").setValue(res)
        if (res) {
          return this.openFileManager("activities." + activity.activity)
        } else
          return throwError("Canceled by user")
      })
      .concatMap(res => {
        if (res) {
          console.log("confirm update")
          return of(true)
        }
        else if (res != null) {
          console.log("going back")
          return this.activityFileSelector(activity)
        } else {
          console.log("cancel update")
          return of(null)
        }
      })
  }

  openFileUploader(field: String, options?: {}) {
    let modalRef = this.modalService.show(UploaderComponent, {
      initialState: { field, options, title: 'Adicione os arquivos atualizados:' },
      class: 'modal-lg modal-dialog-centered upload-modal'
    });
    return modalRef.content.onConfirm
  }

  openFileManager(field) {
    const initialState = {
      npiId: this.npi.id,
      npiNumber: this.npi.number,
      npiVersion: this.npi.version,
      field,
      editFlag: false,
      title: "Selecione os arquivos a serem removidos/substituídos:",
      cancelButton: "<i class='fa fa-sm fa-chevron-left'></i> Voltar",
      footer: "<i>Obs.: Os arquivos selecionados serão removidos para dar lugar aos novos. " +
        "Se houver arquivos com nomes iguais, aos novos será adicionado o número da versão no final.</i>",
      showSelect: true
    }
    console.log("opening modal com", initialState)
    this.modalRef = this.modalService.show(
      FileManagerComponent,
      {
        initialState,
        class: "modal-lg"
      });
    return this.modalRef.content.onConfirm
  }

  willBeAnyActivityUpdated() {
    return Object.values(this.revisionForm.value).some(o => o['apply'] && o['annex'] && o['annex'].length)
  }

  confirm() {
    this.onConfirm.next(this.revisionForm.value)
    this.modalRef.hide()
  }

}
