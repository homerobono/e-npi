import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MessageService } from '../services/message.service';
import { NpiService } from '../services/npi.service';
import Npi from '../models/npi.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  userLevel : Number = 0
  response = null
  npisList : Npi[]
  
  sortParam : String
  sortOrder : Number

  gettingNpis : Boolean = false
  manualRefresh : Boolean = false

  constructor( private npiService : NpiService,
               private router : Router,
               private authService : AuthService,
               private messenger : MessageService,
  ) { 
    this.userLevel = this.authService.getUserLevel();
    this.sortParam = 'number'
    this.sortOrder = -1
    this.npisList = []
  }

  ngOnInit(): void {
    console.log('getting npis');
    this.getNpis()
    }

  getNpis(){
    this.gettingNpis = true;
    this.npiService.getNpis()
      .subscribe(npis => { 
        this.npisList = npis.sort(
          this.sortBy(this.sortParam,this.sortOrder)
        );
        this.gettingNpis = false;
        this.manualRefresh = false;
        console.log(this.npisList)
      })
  }

  sortBy(property, sortOrder) {
    return function (a,b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
  } 

  editProfile(npiId:String) {
    this.router.navigate(['/npi/'+npiId]);
  }

  goToRegister() {
    this.messenger.clear()
    this.router.navigate(['/register']);
  }

  goToNpi(npiNumber) {
    this.router.navigate(['/npi/'+npiNumber]);
  }

  cancelNPI(npiId : String, npiNumber : Number, event: Event) {
    event.stopPropagation()
    if (!confirm(
      "Tem certeza que deseja cancelar a NPI " + 
      npiNumber + '?')
    ) return;
    console.log('canceling NPI')
    this.npiService.deleteNpi(npiId).subscribe(
      res => { 
        console.log(res)
        this.getNpis();
        this.messenger.set(
          {
            type: 'info',
            message : 'NPI cancelada'
          }
        ) 
      },
      err => {console.log('failed to delete')}
    );
  }

  refresh(){
    this.manualRefresh = true
    this.getNpis();
  }
}
