import { Component, OnInit } from '@angular/core';
import { MessageService } from '../services/message.service';
import { Router, ActivatedRoute } from '@angular/router';
import { slideInOutAnimation } from '../_animations/slide_in_out.animation'
import { Location } from '@angular/common';
 
@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss'],
  animations: [slideInOutAnimation],

  // attach the fade in animation to the host (root) element of this component
  //host: { '[@slideInOutAnimation]': '' }
})
export class AlertComponent implements OnInit {
  response : any
  route : String
  constructor(
    private messenger : MessageService,
    private location : Location,
    private router : Router
  ) { }

  ngOnInit(): void {
    this.messenger.response.subscribe(
      res => { this.response = res },
      err => { console.log('error on subscribe') }
    )
  }
  
  clearMessages(){
    console.log('clearing messages')
    this.messenger.clear()
  }

  alertContent():{class, icon}{
    switch(this.response.type){
      case 'success':
        return { class:'alert-success', icon:'fa-check' }
        //break;
      case 'info':
        return { class:'alert-info', icon:'fa-info' }
        //break;
      case 'error':
        return { class:'alert-danger', icon:'fa-times' }
        //break;
      case 'warning':
        return { class:'alert-warning', icon:'fa-exclamation-triangle' }
        //break;
      default:
        return { class:'alert-info', icon:'fa-info' }
    }
  }

}
