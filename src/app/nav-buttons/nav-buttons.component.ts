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

  constructor( private location : Location,
               private route: ActivatedRoute,
               private messenger: MessageService
              ) { }

  ngOnInit() {
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
