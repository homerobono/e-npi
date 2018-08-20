import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService } from '../services/message.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
})
export class ErrorComponent implements OnInit {

  response: any
  
  constructor( 
    private router: Router,
    private route: ActivatedRoute,
    private messenger : MessageService,
    private location : Location
  ) { 
  }

  ngOnInit() {
    this.response = this.messenger.getAndClear()
    this.messenger.response.subscribe(
      (res) => { this.response = res});
    if (!this.response)
      this.response = this.messenger.getAndClear()
    if (!this.response)
      this.response = {}
    if (!this.response.head)
        this.response.head = 'Erro desconhecido'
    if (!this.response.message)
      this.response.message = 'Algo deu errado!'
  }

  back(){
    this.location.back()
  }

}
