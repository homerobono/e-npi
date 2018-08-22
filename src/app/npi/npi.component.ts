import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { createNumberMask } from 'text-mask-addons/dist/textMaskAddons';

import { NpiService } from '../services/npi.service';
import { AuthService } from '../services/auth.service';
import { MessageService } from '../services/message.service';

import Npi from '../models/npi.model';
import { Location } from '@angular/common';
import User from '../models/user.model';
import { Subject, Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';

@Component({
  selector: 'app-npi',
  templateUrl: './npi.component.html',
  styleUrls: ['./npi.component.scss']
})
export class NpiComponent implements OnInit {
  path: String
  response: any
  date: Date
  npiNumber: Number
  npiSubject = new Subject<Npi>()
  npi: Npi
  authorName: String
  authorId: String

  titleEdit = false

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

  viewForm: FormGroup;

  constructor(fb: FormBuilder,
    private npiService: NpiService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private messenger: MessageService,
    private localeService: BsLocaleService,
    private location: Location
  ) {
    this.npi = new Npi(null)
    //this.npiSubject.next(this.npi)
    this.viewForm = fb.group({
      'date': null,
      'entry': null,
      'cost': '',
      'price': '',
      'investment': '',
      'inStockDateType': '',
      'inStockDate': '',
      'npiRef': ''
    })
  }

  ngOnInit() {
    this.messenger.response.subscribe(
      res => { this.response = res }
    )
    this.localeService.use('pt-br');
    this.route.params.subscribe(
      params => {
        this.npiNumber = params.npiNumber
        this.getNpi(this.npiNumber)
      }
    )
    //changes.subscribe(res => {this.path = res[0].path; console.log('CHANGED ROUTE!')})
    console.log(this.route.firstChild.snapshot.routeConfig.path.includes('edit'))
  }

  getNpi(npiNumber) {
    console.log('getting npi ' + npiNumber)
    this.npiService.getNpi(npiNumber)
      .subscribe(
        npi => {
          console.log(npi)
          this.npiSubject.next(npi);
          this.npi = npi
          this.authorId = npi.requester._id
          this.authorName = npi.requester.firstName + 
          (npi.requester.lastName ? ' ' + npi.requester.lastName : '')
        }, err => {
          this.location.replaceState(null)
          this.router.navigateByUrl('/error')
        }
      )
  }

  updateNpi(npiForm): Observable<Boolean> {
    //npiForm.name = 
    return this.npiService.updateNpi(npiForm).
      map(res => {
        this.messenger.set({
          'type' : 'success',
          'message' : 'NPI: NPI atualizada com sucesso' 
        });
        this.getNpi(this.npiNumber)
        return true
      }, err => {
        console.log(err);
        return false
      }).share()
  }

  toggleTitleEdit(event){
    if (this.route.firstChild.snapshot.routeConfig.path=="edit")
      this.titleEdit = !this.titleEdit
    else
      this.titleEdit = false
  }

  changeTitle(event: KeyboardEvent) {
    switch(event.key){
      case "Enter":
        console.log('saving title')
        this.titleEdit = false
        break
      case "Escape":
        console.log('Escape')
        this.titleEdit = false
        break
      default:
    } 
  }

}
