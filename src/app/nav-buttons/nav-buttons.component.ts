import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from '../services/message.service';

@Component({
  selector: 'app-nav-buttons',
  templateUrl: './nav-buttons.component.html',
  styleUrls: ['./nav-buttons.component.scss']
})
export class NavButtonsComponent implements OnInit {
  public parent = '/home/'
  public parentLabel = "NPI's"

  constructor( private location : Location,
               private route: ActivatedRoute,
               private messenger: MessageService
              ) { }

  ngOnInit() {
    console.log(this.route.snapshot.url[0])
    this.parent = `/${this.route.snapshot.url[0].path}`
    switch(this.route.snapshot.url[0].path){
      case 'user':
        this.parent = '/users'
        this.parentLabel = 'Usuários'
        break
      case 'register':
        this.parent = '/users'
        this.parentLabel = 'Usuários'
        break
      case 'npi':
        this.parent = '/home'
        this.parentLabel = 'Home'
        break
      default:
        this.parentLabel = 'Home'
        this.parent = '/home'
        break
    }
  }

  back(){
    this.messenger.clear()
    this.location.back();
  }
  next(){
    this.messenger.clear()
    this.location.forward();
  }

}
