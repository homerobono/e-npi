import { Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Response } from '@angular/http';
import { Observable, Subject } from 'rxjs/Rx';
import { Globals } from 'config';

import Npi from '../models/npi.model';
import 'rxjs/add/operator/do';
import { timer, BehaviorSubject } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { UploadService } from './upload.service';

@Injectable({
  providedIn: 'root'
})

export class NpiService {
  api_url = Globals.ENPI_SERVER_URL
  npisUrl = `${this.api_url}/npis`;
  npiUrl = `${this.api_url}/npi/`;
  npiMigrateUrl = `${this.api_url}/npis/migrate`;

  npisList: BehaviorSubject<Npi[]>
  manualRefresh: BehaviorSubject<Boolean>

  constructor(
    private http: HttpClient,
    private uploadService: UploadService
  ) {
    this.npisList = new BehaviorSubject([])
    this.manualRefresh = new BehaviorSubject(false)
    this.npisList = this.manualRefresh.
      switchMap(() => timer(0, 10000).
        concatMap(() => this.getNpis())
      ).shareReplay() as BehaviorSubject<Npi[]>
  }

  getNpi(npiNumber: Number): Observable<Npi[]> {
    console.log(npiNumber)
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
      .shareReplay()
  }

  getNpis(): Observable<Npi[]> {
    return this.http.get(this.npisUrl)
      .map(res => {
        var Npis: Npi[] = []
        res['data'].forEach(npi => {
          try {
            var transNpi = new Npi(npi)
            Npis.push(transNpi)
          } catch (e) {
            console.log(e)
          }
        });
        return Npis;
      })
  }

  createNpi(npiForm): Observable<any> {
    console.log('registering npi');
    console.log(npiForm);
    var npi = this.formToModel(npiForm)
    console.log(npi);
    return this.http.post(this.npisUrl, npi)
  }

  migrateNpi(npiForm): Observable<any> {
    console.log('migrating npi');
    console.log(npiForm);
    var npi = this.formToModel(npiForm)
    console.log(npi);
    return this.http.post(this.npiMigrateUrl, npi)
  }

  newNpiVersion(npiForm): Observable<any> {
    console.log('creating new npi version from ' + npiForm.id);
    console.log(npiForm);
    var npi = this.formToModel(npiForm)
    console.log(npi);
    return this.http.post(this.npiUrl, npi)
      .concatMap(update => {
        console.log('new NPI version created');
        return this.uploadService.upload(npiForm.number).map(
          upload => {
            var res = { update, upload }
            console.log(res)
            return res
          }
        )
      })
  }

  updateNpi(npiForm): Observable<any> {
    console.log('updating npi');
    var npi = this.formToModel(npiForm)
    console.log(npi);
    return this.http.put(this.npiUrl, npi)
      .concatMap(update => {
        console.log('NPI updated');
        return this.uploadService.upload(npiForm.number).map(
          upload => {
            var res = { update, upload }
            console.log(res)
            return res
          }
        )
      })
  }

  promoteNpi(npiNumber): Observable<any> {
    console.log('promoting npi');
    console.log(npiNumber);
    return this.http.get(this.npiUrl + npiNumber + '/promote')
  }

  updateAndPromoteNpi(npiForm) {
    return this.updateNpi(npiForm).concatMap(
      updateUpload => {
        console.log('Promoting NPI', updateUpload);
        return this.promoteNpi(updateUpload.update.data.npi.number)
          .map(promote => {
            return {
              promote,
              update: updateUpload.update,
              upload: updateUpload.upload
            }
          })
      }
    )
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
    if (npiForm.price)
      if (npiForm.price.value &&
        (npiForm.price.value instanceof String ||
          typeof npiForm.price.value == 'string'))
        model.price.value = parseFloat(
          npiForm.price.value.replace(/\./g, '').replace(/,/, '.')
        )
    if (npiForm.cost)
      if (npiForm.cost.value &&
        (npiForm.cost.value instanceof String ||
          typeof npiForm.cost.value == 'string'))
        model.cost.value = parseFloat(
          npiForm.cost.value.replace(/\./g, '').replace(/,/, '.')
        )
    if (npiForm.investment)
      if (npiForm.investment.value &&
        (npiForm.investment.value instanceof String ||
          typeof npiForm.investment.value == 'string'))
        model.investment.value = parseFloat(
          npiForm.investment.value.replace(/\./g, '').replace(/,/, '.')
        )
    if (npiForm.projectCost)
      if (npiForm.projectCost.value &&
        (npiForm.projectCost.value instanceof String ||
          typeof npiForm.projectCost.value == 'string'))
        model.projectCost.value = parseFloat(
          npiForm.projectCost.value.replace(/\./g, '').replace(/,/, '.')
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
    }

    console.log(model.inStockDate)
    return model
  }

  ngOnDestroy() {
    console.log('Destroying service')
  }

}
