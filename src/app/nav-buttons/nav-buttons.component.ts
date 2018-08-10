import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-nav-buttons',
  templateUrl: './nav-buttons.component.html',
  styleUrls: ['./nav-buttons.component.scss']
})
export class NavButtonsComponent implements OnInit {

  constructor( private location : Location,
               private route: ActivatedRoute
              ) { }

  ngOnInit() {
  }

  back(){
    this.location.back();
  }
  next(){
    this.location.forward();
  }

}
