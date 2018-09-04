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

  newNpiVersion(npiForm): Observable<any> {
    console.log('creating new npi version from ' + npiForm.id);
    console.log(npiForm);
    var npi = this.formToModel(npiForm)
    console.log(npi);
    return this.http.post(this.npiUrl, npi);
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

      if (npiForm.inStockDateType && npiForm.inStockDate != null) {
        if (npiForm.inStockDateType == 'offset') {
          if (typeof npiForm.inStockDate == 'number' ||
            npiForm.inStockDate instanceof Number) {
            model.inStockDate = {
              fixed: null,
              offset: npiForm.inStockDate
            }
          } else {
            model.inStockDate = {
              fixed: null,
              offset: npiForm.inStockDate.offset
            }
          }
        } else if (npiForm.inStockDateType == 'fixed') {
          if (npiForm.inStockDate instanceof Date) {
            model.inStockDate = {
              fixed: new Date(npiForm.inStockDate),
              offset: null
            }
          } else {
            model.inStockDate = {
              fixed: npiForm.inStockDate.fixed,
              offset: null
            }
          }
        }
      }
      /* else {
        model.inStockDate = {
          fixed: null,
          offset: null
        }
      }

      /*
              model.inStockDate =
                {
                  'fixed': npiForm.inStockDateType == 'fixed' ?
                    npiForm.inStockFixedDate ?
                      new Date(npiForm.inStockFixedDate) : null : null,
                  'offset': npiForm.inStockDateType == 'offset' ?
                    npiForm.inStockOffsetDate : null
                }
      
              if (model.inStockDate.fixed == null && model.inStockDate.offset == null) {
                console.log('trying todo the right thing')
                model.inStockDate =
                  {
                    'fixed': npiForm.inStockDateType == 'fixed' ?
                      npiForm.inStockDate instanceof Date ?
                        npiForm.inStockDate : null : null,
                    'offset': npiForm.inStockDateType == 'offset' ?
                      npiForm.inStockDate instanceof Number ||
                        npiForm.inStockDate instanceof String ||
                        typeof npiForm.inStockDate == 'string' ||
                        typeof npiForm.inStockDate == 'number' ?
                        npiForm.inStockDate as Number : null : null
                  }
              }
      
              //if (npiForm.inStockDate == null || npiForm.inStockDate == '')
              //model.inStockDate = null
              //console.log('date: ')
     */ 
    }

    console.log(model.inStockDate)
    return model
  }

}
