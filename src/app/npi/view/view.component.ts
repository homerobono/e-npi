import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { createNumberMask } from 'text-mask-addons/dist/textMaskAddons';

import { NpiService } from '../../services/npi.service';
import { AuthService } from '../../services/auth.service';
import { MessageService } from '../../services/message.service';

import Npi from '../../models/npi.model';
import { Location } from '@angular/common';
import User from '../../models/user.model';
import { NpiComponent } from '../npi.component';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss']
})
export class ViewComponent implements OnInit {
 
    _npi: Npi = new Npi(null)
    
    response: any
    date: Date
    authorName: String
    authorId: String
    
    currency = createNumberMask({
      prefix: 'R$ ',
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
  
    viewForm: FormGroup;
  
    constructor(fb: FormBuilder,
      private npiService: NpiService,
      private authService: AuthService,
      private router: Router,
      private route: ActivatedRoute,
      private messenger: MessageService,
      private localeService: BsLocaleService,
      private location: Location,
      private npiComponent: NpiComponent
    ) {
      this.viewForm = fb.group({
        'cost': '',
        'price': '',
        'investment': '',
        'inStockDateType': '',
        'inStockDate': '',
        'npiRef': ''
      })
    }
  
    ngOnInit() {
      this._npi = this.npiComponent.npi
      this.fillFormData()
      //console.log(this._npi)
      this.npiComponent.npiSubject.subscribe( 
        npi => {
          this._npi = npi
          //console.log(this._npi)
          this.fillFormData()
        })
    }
  
    fillFormData() {
      //console.log(typeof this._npi.inStockDate)
      this.viewForm.patchValue({
        npiRef: this._npi.npiRef ? this._npi.npiRef : null,
        inStockDate: this._npi.inStockDate ?
          this._npi.inStockDate instanceof (Date || String) ?
            new Date(this._npi.inStockDate).toLocaleDateString('pt-br') :
            this._npi.inStockDate.fixed ?
              new Date(this._npi.inStockDate.fixed).toLocaleDateString('pt-br') :
              this._npi.inStockDate.offset +
              (this._npi.inStockDate.offset > 1 ? ' dias' : ' dia') +
              " após aprovação"
          : null
  
      });
      if (this._npi.entry != 'internal' && this._npi.entry != 'oem')
        if(this._npi.price && this._npi.cost)
          this.viewForm.patchValue({
            price:
              this._npi.price.toFixed(2).toString().replace('.', ','),
            cost:
              this._npi.cost.toFixed(2).toString().replace('.', ','),
          })
  
      if (this._npi.investment)
        this.viewForm.patchValue({
          investment:
            this._npi.investment.toFixed(2).toString().replace('.', ','),
        })
    }
  
  }
  