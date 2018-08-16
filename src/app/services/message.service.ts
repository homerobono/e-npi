import { Injectable } from '@angular/core';
import { Observer, Observable, Subject } from 'rxjs/Rx';
import 'rxjs/add/operator/map';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  constructor(){}

  response = new Subject<{'type', 'message', 'log'}>() 

  public set(response){
    this.response.next(response)
    localStorage.setItem('head', response.head)
    localStorage.setItem('message', response.message)
    localStorage.setItem('type', response.type)
    localStorage.setItem('log', response.log)
  }

  public get(){
    let response = {
      head : localStorage.getItem('head'),
      type : localStorage.getItem('type'),
      message : localStorage.getItem('message'),
      log : localStorage.getItem('log')
    }
    if (response && response.message) {
      if (!response.type) response.type = 'info'
      return response
    }
    return null;
  }
  public clear(){
    localStorage.removeItem('message')
    localStorage.removeItem('type')
    localStorage.removeItem('log')
    this.response.next(null)
  }

  public getAndClear(){
    var response = this.get();
    this.clear();
    return response;
  }

}
