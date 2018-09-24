import { Component, Inject, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
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

defineLocale('pt-br', ptBrLocale)

@Component({
    selector: 'app-create',
    templateUrl: './create.component.html',
    styleUrls: ['./create.component.scss']
})

export class CreateComponent implements OnInit {

    sendingForm: Boolean = false;
    formSent: Boolean = false;
    createResponse: String;

    npisList: Npi[]
    modalRef: BsModalRef;
    npiRef: Npi

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
    createForm: FormGroup;

    constructor(
        fb: FormBuilder,
        private npiService: NpiService,
        private authService: AuthService,
        private router: Router,
        private messenger: MessageService,
        private localeService: BsLocaleService,
        private utils: UtilService,
        private modalService: BsModalService,
        private uploadService: UploadService
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
        this.createForm = fb.group({
            'date': new Date().toLocaleDateString('pt-br'),
            'complexity': 2,
            'client': 'Pixel',
            'name': 'Versões',
            'entry': 'pixel',
            'npiRef': null,
            'description': 'Requisitos gerais',
            'norms': fb.group({
                'description': 'Normas aplicáveis',
                'annex': null
            }),
            'resources': fb.group({
                'description': 'Recursos necessários',
                'annex': null
            }),
            'regulations': fb.group({
                standard: fb.group({}),
                additional: null
            }),
            'cost': fb.group({
                value: '30,00',
                currency: 'BRL'
            }),
            'price': fb.group({
                value: '90,00',
                currency: 'BRL'
            }),
            'inStockDateType': 'fixed',
            'inStockDate': oemDefaultDeadLine,
            'investment': fb.group({
                value: '50000,00',
                currency: 'BRL'
            }),
            'projectCost': fb.group({
                value: '10000,00',
                currency: 'BRL',
                'annex': String
            }),
            'demand': fb.group({
                'amount': 1000,
                'period': null
            }),
            'fiscals': 'Incentivos fiscais disponíveis',
            'oemActivities': fb.array([])
        })

        var oemActivities = utils.getOemActivities()
        for (var i = 0; i < oemActivities.length; i++) {
            (this.createForm.get('oemActivities') as FormArray).
                push(fb.group({
                    date: oemDefaultDeadLine,
                    comment: null,
                    dept: oemActivities[i].dept,
                    title: oemActivities[i].title,
                }))
        }

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
        setTimeout(() => this.openUploadModal("resources"), 600)
    }

    createNpi(npiForm): void {
        this.sendingForm = true
        this.openSendingFormModal()
        this.npiService.createNpi(npiForm).subscribe(
            createRes => {
                console.log('NPI created');
                createRes.npiNumber = createRes.data.number
                this.uploadService.upload(createRes.data.number).
                    subscribe(() => {
                        console.log('uploads completed');
                        console.log(createRes);
                        this.messenger.set({
                            'type': 'success',
                            'message': 'NPI cadastrado com sucesso'
                        });
                        this.formSent = true;
                        this.sendingForm = false;
                        this.clearFields();
                        this.router.navigateByUrl('/npi/' + createRes.data.number)
                    }, err => {
                        this.invalidFieldsError(err)
                        this.formSent = false;
                        this.sendingForm = false;
                    })
            }
        )
    }

    invalidFieldsError(err) {
        console.log(err)
        if (err.error.message.errors) {
            var errors = err.error.message.errors
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

    saveNpi(npiForm) {
        npiForm.stage = 1
        this.createNpi(npiForm)
    }

    submitToAnalisys(npiForm) {
        npiForm.stage = 2
        this.createNpi(npiForm)
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

    openSendingFormModal(){
        this.modalService.show(SendingFormModalComponent, {
            class: 'modal-sm modal-dialog-centered'
        })
    }

    ngOnDestroy(){
        delete this.uploadService.uploaders
    }
}
