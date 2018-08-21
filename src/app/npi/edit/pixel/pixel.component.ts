import { Component, Inject, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { createNumberMask } from 'text-mask-addons/dist/textMaskAddons';
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker' 
import { defineLocale } from 'ngx-bootstrap/chronos';

import { AuthService } from '../../../services/auth.service';
import { MessageService } from '../../../services/message.service';
import { NpiService } from '../../../services/npi.service'
import { UploadService } from '../../../services/upload.service'
import { FileUploader } from 'ng2-file-upload';

import Npi from '../../../models/npi.model';
import { Location } from '@angular/common';
import { NpiComponent } from '../../npi.component';

@Component({
  selector: 'app-pixel',
  templateUrl: './pixel.component.html',
  styleUrls: ['./pixel.component.scss']
})
export class PixelComponent implements OnInit {

    @Input() npi: Npi

    response: any
    date: Date
    npiNumber: Number
    //npi: Npi
    authorName: String
    authorId: String

    sendingEdit: Boolean = false;
    editSent: Boolean = false;
    editResponse: String  
    
    currency = createNumberMask({
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
  
  constructor(fb: FormBuilder,
    private npiService: NpiService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private messenger: MessageService,
    private localeService: BsLocaleService,
    private location: Location,
    private npiComponent : NpiComponent,
    private uploadService : UploadService
  ) {
    this.npi = new Npi(null)
    this.datePickerConfig = Object.assign(
      {},
      { 
        containerClass : 'theme-default',
        showWeekNumbers: false,
        dateInputFormat: 'DD/MM/YYYY',
        minDate: new Date()
      }
    )
    this.npiForm = fb.group({
      'cost': '',
      'price': '',
      'investment': '',
      'inStockDate': '',
      'npiRef': ''
    })
  }

  ngOnInit() {
    this.messenger.response.subscribe(
      res => { this.response = res }
    )
    this.localeService.use('pt-br');
    
        this.npiNumber = this.npi.number
        console.log(this.npi)
        this.fillFormData()
  }

  editNpi(npiForm): void {
    this.sendingEdit = true
    this.npiService.createNpi(npiForm).
    subscribe(res => {
      this.messenger.set({
         'type' : 'success',
         'message' : 'NPI atualizada com sucesso' 
      });
      this.editSent = true;
      this.sendingEdit = false;
    }, err => {
      console.log(err);
      this.editSent = false;
      this.sendingEdit = false;
    });
  }

  fillFormData() {
    console.log(typeof this.npi.inStockDate)
    this.npiForm.patchValue({
      npiRef: this.npi.npiRef ? this.npi.npiRef : null,
      inStockDateType: this.npi.inStockDate ?
        this.npi.inStockDate instanceof (Date || String) ? null :
          this.npi.inStockDate.fixed ? 'fixed' :
            this.npi.inStockDate.offset ? 'offset' : null : null,
      inStockDate: this.npi.inStockDate ?
        this.npi.inStockDate instanceof (Date || String) ?
          new Date(this.npi.inStockDate).toLocaleDateString('pt-br') : null : null,

    });
    this.npiForm.patchValue({
      price:
        this.npi.price.toFixed(2).toString().replace('.', ','),
      cost:
        this.npi.cost.toFixed(2).toString().replace('.', ','),
    })

    if (this.npi.investment)
      this.npiForm.patchValue({
        investment:
          this.npi.investment.toFixed(2).toString().replace('.', ','),
      })
  }
}
