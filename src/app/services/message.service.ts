import { Injectable } from '@angular/core';
import { Observer, Observable, Subject } from 'rxjs/Rx';
import 'rxjs/add/operator/map';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  constructor(){}

  public set(response){
    localStorage.setItem('message', response.message)
    localStorage.setItem('type', response.type)
  }

  public get(){
    let response = {
      type : localStorage.getItem('type'),
      message : localStorage.getItem('message')
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
  }

  public getAndClear(){
    var response = this.get();
    this.clear();
    return response;
  }

}
