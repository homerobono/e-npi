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

  constructor(private http: HttpClient) { }

  getNpi(npiNumber: Number): Observable<Npi[]> {
    return this.http.get(this.npiUrl + npiNumber)
      .map(res => {
        console.log(res)
        var Npis: Npi[] = []
        res['data'].forEach(npi => {
          console.log('converting npis')
          try {
            var transNpi = new Npi(npi)
            Npis.push(transNpi)
          } catch (e) {
            console.log(e)
          }
        });
        return Npis;
      })
      .shareReplay();
  }

  getNpis(): Observable<Npi[]> {
    return this.http.get(this.npisUrl)
      .map(res => {
        console.log(res)
        var Npis: Npi[] = []
        res['data'].forEach(npi => {
          console.log('converting npis')
          try {
            var transNpi = new Npi(npi)
            Npis.push(transNpi)
          } catch (e) {
            console.log(e)
          }
        });
        return Npis;
      })
      .shareReplay();
  }

  createNpi(npiForm): Observable<any> {
    console.log('registering npi');
    console.log(npiForm);
    var npi = this.formToModel(npiForm)
    console.log(npi);
    return this.http.post(this.npisUrl, npi);
  }

  newNpiVersion(id): Observable<any> {
    console.log('creating new npi version from '+ id);
    return this.http.post(this.npiUrl, {id});
  }

  updateNpi(npiForm): Observable<any> {
    console.log('updating npi');
    var npi = this.formToModel(npiForm)
    console.log(npi);
    return this.http.put(this.npiUrl, npi);
  }

  deleteNpi(npiId: String): Observable<any> {
    console.log('deleting npi');
    return this.http.delete(this.npiUrl + npiId);
  }

  removeAll(): Observable<any> {
    console.log('deleting npi');
    return this.http.delete(this.npisUrl);
  }

  formToModel(npiForm): Npi {
    var model = npiForm
    var toUnmaskFields = [
      'cost',
      'price',
      'investment',
    ]

    toUnmaskFields.forEach(prop => {
      if (npiForm[prop] && npiForm[prop] instanceof String ||
        typeof npiForm[prop] == 'string') {
        model[prop] = parseFloat(
          npiForm[prop].replace(/\./g, '').replace(/,/, '.')
        )
      }
    })

    if (npiForm.projectCost)
      if (npiForm.projectCost.cost &&
        (npiForm.projectCost.cost instanceof String ||
          typeof npiForm.projectCost.cost == 'string'))
        model.projectCost.cost = parseFloat(
          npiForm.projectCost.cost.replace(/\./g, '').replace(/,/, '.')
        )

    if (model.entry == 'oem') {

      model.inStockDate =
        {
          'fixed': npiForm.inStockDateType == 'fixed' ?
            npiForm.inStockFixedDate ?
              new Date(npiForm.inStockFixedDate) : null : null,
          'offset': npiForm.inStockDateType == 'offset' ?
            npiForm.inStockOffsetDate : null
        }
      /*model.inStockDate =
        {
          'fixed': npiForm.inStockDate instanceof Date ? npiForm.inStockDate : null,
          'offset': !(npiForm.inStockDate instanceof Date) ? npiForm.inStockDate as Number : null
        }
      if (npiForm.inStockDate == null || npiForm.inStockDate == '')
        model.inStockDate = null
      //console.log('date: ')
      //console.log(model.inStockDate)
      */
    }
    return model
  }

}
