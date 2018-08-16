import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { createNumberMask } from 'text-mask-addons/dist/textMaskAddons';

import { NpiService } from '../services/npi.service';
import { AuthService } from '../services/auth.service';
import { MessageService } from '../services/message.service';

import Npi from '../models/npi.model';

@Component({
  selector: 'app-npi',
  templateUrl: './npi.component.html',
  styleUrls: ['./npi.component.scss']
})
export class NpiComponent implements OnInit {

  response : any
  date : Date
  npiNumber : Number
  npi : Npi
  
  currency = createNumberMask({
    prefix : '',
    includeThousandsSeparator : true,
    thousandsSeparatorSymbol : '.',
    requireDecimal : true,
    decimalSymbol : ',',
    allowNegative : false,
  })

  public currencyMask = {
    mask : this.currency,
    guide : false,
  }  
  public dateMask = {
    mask : ['/\d/','/','/\d/','/']
  }

  viewForm : FormGroup;

  constructor( fb : FormBuilder,
              private npiService: NpiService,
              private authService: AuthService,
              private router: Router,
              private route: ActivatedRoute,
              private messenger: MessageService,
              private localeService: BsLocaleService
            ) 
  {
    this.npi = new Npi(null)
    this.viewForm = fb.group({
      'date' : null,
      'entry' : null,
      'cost' : '',
      'price' : '',
      'investment' : '',
      'inStockDateType' : '',
      'inStockDate' : '',
      'npiRef' : ''
    })
  }

  ngOnInit() {
    this.messenger.response.subscribe(
      res => { this.response = res }
    )
    this.localeService.use('pt-br');
    this.npiNumber = parseInt(this.route.snapshot.paramMap.get('npiNumber'));
    this.getNpi(this.npiNumber)
      
    }
  
    getNpi(npiNumber){
      console.log('getting npi ' + npiNumber)
      this.npiService.getNpi(npiNumber)
      .subscribe(npi => {
        console.log(npi)
        this.npi = npi;
        try {
          this.fillFormData();
        } catch (e){
          console.log(e)}
      })
    }

    fillFormData(){
      console.log(typeof this.npi.inStockDate)
      this.viewForm.patchValue({
        date : this.npi.createdString,
        inStockDate : 
          this.npi.inStockDate instanceof (Date || String) ?
            new Date(this.npi.inStockDate).toLocaleDateString('pt-br') :
              this.npi.inStockDate.fixed ?
                new Date(this.npi.inStockDate.fixed).toLocaleDateString('pt-br') :
                this.npi.inStockDate.offset + 
                (this.npi.inStockDate.offset > 1 ? ' dias' : ' dia') +
                " após aprovação"

      });
      if (this.npi.entry != 'internal' && this.npi.entry != 'oem')
        this.viewForm.patchValue({
          price : 
            this.npi.price.toFixed(2).toString().replace('.',','),
          cost : 
            this.npi.cost.toFixed(2).toString().replace('.',','),
        })

      if (this.npi.investment)
        this.viewForm.patchValue({
          investment : 
            this.npi.investment.toFixed(2).toString().replace('.',','),
        })
    }
}
