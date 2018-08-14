import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { Globals } from 'config';

import Npi from '../models/npi.model';
import 'rxjs/add/operator/map';

@Injectable({
  providedIn: 'root'
})

export class NpiService {
  api_url = Globals.ENPI_SERVER_URL
  npisUrl = `${this.api_url}/npis`;
  npiUrl = `${this.api_url}/npi/`;
  newNpiUrl = `${this.api_url}/npis`;

  constructor( private http: HttpClient ) {}
  
  getNpi(npiId: String): Observable<Npi> {
    return this.http.get(this.npiUrl+npiId)
    .map(res => { return res as Npi })
    .shareReplay();
  }

  getNpis(): Observable<Npi[]> {
    return this.http.get(this.npisUrl).delay(1000)
    .map(res => { 
      var Npis : Npi[] = []
      res['data'].docs.forEach(npi => {
        var transNpi = new Npi(npi)
        Npis.push(transNpi)
      });
      return Npis;
    })
    .shareReplay();
  }

  createNpi(npi: Npi): Observable<any> {
    console.log('registering npi');
    console.log(npi);
    return this.http.post(this.npiUrl, npi);
  }
  
  updateNpi(npiId, npi: Npi): Observable<any> {
    console.log('updating npi');
    return this.http.put(this.npisUrl, {npiId, npi});
  }

  deleteNpi(npiId: String): Observable<any> {
    console.log('deleting npi');
    return this.http.delete(this.npiUrl+npiId);
  }
}
