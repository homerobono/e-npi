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

  constructor( private npiService : NpiService,
               private router : Router,
               private authService : AuthService,
               private messenger : MessageService,
  ) { 
    this.response = this.messenger.getAndClear();
    this.userLevel = this.authService.getUserLevel();
  }

  ngOnInit(): void {
    console.log('getting npis');
    this.messenger.response.subscribe(
      res => { this.response = res },
      err => { console.log('error on subscribe') }
    )
    this.getNpis()
    }

  getNpis(){
    this.npiService.getNpis()
      .subscribe(npis => { 
        console.log(this.npisList)
        this.npisList = npis;
        this.formatDate();
      })
  }

  editProfile(npiId:String) {
    this.router.navigate(['/npi/'+npiId]);
  }

  formatDate(): void {
    this.npisList.forEach(npi => {
      npi.createdString = new Date(npi.created).toLocaleDateString();
    });
  }

  goToRegister() {
    this.messenger.clear()
    this.router.navigate(['/register']);
  }

  cancelNPI(npiId : String) {
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

}
