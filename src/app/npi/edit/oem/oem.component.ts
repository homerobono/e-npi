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
  selector: 'app-edit-oem',
  templateUrl: './oem.component.html',
  styleUrls: ['./oem.component.scss']
})

export class OemComponent implements OnInit {

    @Input() npi: Npi

    response: any
    date: Date
    npiNumber: Number
    authorName: String
    authorId: String

    sendingEdit: Boolean = false;
    editSent: Boolean = false;
    editResponse: String  
    
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
      'cost': null,
      'price': null,
      'investment': null,
      'inStockDateType': null,
      'inStockFixedDate': null,
      'inStockOffsetDate': null,
      'npiRef': null
    })
  }

  ngOnInit() {
    this.messenger.response.subscribe(
      res => { this.response = res }
    )
    
    this.npiNumber = this.npi.number
    this.fillFormData()
    }

  editNpi(npiForm): void {
    this.sendingEdit = true

    npiForm.inStockDate = 
    {
      'fixed' : npiForm.inStockDateType=='fixed' ? 
        new Date(npiForm.inStockFixedDate): null,
      'offset' : npiForm.inStockDateType=='offset' ? 
        npiForm.inStockOffsetDate: null
    }
    npiForm.id = this.npi.id
    console.log(npiForm)

    this.npiComponent.updateNpi(npiForm).
    subscribe(() => {
      this.editSent = true;
      this.sendingEdit = false;
      this.router.navigate(['../view'], { relativeTo: this.route })
    }, err => {
      console.log(err);
      this.editSent = false;
      this.sendingEdit = false;
    });
  }

  fillFormData() {
    //console.log(this.npi)
    this.npiForm.patchValue({
      npiRef: this.npi.npiRef!=null ? this.npi.npiRef : null,
      investment: this.npi.investment!=null ?
        this.npi.investment.toFixed(2).toString().replace('.', ','): null,
      inStockDateType: this.npi.inStockDate ?
        this.npi.inStockDate instanceof (Date || String) ? null :
          this.npi.inStockDate.fixed ? 'fixed' :
            this.npi.inStockDate.offset ? 'offset' : null : null,
      inStockFixedDate: this.npi.inStockDate ?
        this.npi.inStockDate instanceof (Date || String) ?
          new Date(this.npi.inStockDate).toLocaleDateString('pt-br') :
          this.npi.inStockDate.fixed ?
            new Date(this.npi.inStockDate.fixed).toLocaleDateString('pt-br') :
            null: null,
      inStockOffsetDate: this.npi.inStockDate ?
        (!(this.npi.inStockDate instanceof (Date || String))) ?
          this.npi.inStockDate.offset ?
            this.npi.inStockDate.offset : null : null : null
    });
    if (this.npi.entry != 'internal' && this.npi.entry != 'oem')
      this.npiForm.patchValue({
        price:
          this.npi.price.toFixed(2).toString().replace('.', ','),
        cost:
          this.npi.cost.toFixed(2).toString().replace('.', ','),
      })

    if (this.npi.investment)
      this.npiForm.patchValue({
      })
  }
}
