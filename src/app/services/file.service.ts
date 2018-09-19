import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { v4 } from 'uuid';
import FileElement from '../models/file.model';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Globals } from 'config';
import { ResponseContentType, Response } from '@angular/http';

export interface IFileService {
  add(path: String, folderName: String);
  delete(id: String);
  update(id: String, update: Partial<FileElement>);
  queryInFolder(folderId: String): Observable<FileElement[]>;
  get(id: String): FileElement;
}

@Injectable()
export class FileService implements IFileService {
  private map = new Map<String, FileElement>();

  apiUrl = Globals.ENPI_SERVER_URL + '/files'
  listUrl = `${this.apiUrl}/list`;
  addUrl = `${this.apiUrl}/createFolder`;
  downloadUrl = `${this.apiUrl}/download`;

  inprocess = false
  asyncSuccess = false
  error = ''

  constructor(
    private http: HttpClient
  ) { }

  list(path, exts): Observable<FileElement[]> {
    var data = {
      action: 'list',
      path: path,
      fileExtensions: exts && exts.length ? exts : undefined
    };

    this.inprocess = true;
    this.error = '';

    return this.http.post(this.listUrl, { params: data }).map(
      res => {
        var filesArray = []
        res['result'].forEach(element => {
          filesArray.push(new FileElement(element))
        });
        return filesArray
      }
    ) as Observable<FileElement[]>
  };

  add(path: String, folderName: String) {
    console.log('adding ' + folderName)
    var data = {
      action: 'createFolder',
      path: path,
      name: folderName,
    };
    this.http.post(this.addUrl, { params: data }).subscribe()
  }

  download(path: String, fileName: String) {
    const fullFileName = path as string + fileName as string
    const headers = new HttpHeaders().set('content-type', 'application/blob');
    const params = new HttpParams().set('path', fullFileName)
    console.log(fullFileName)
    return this.http.get(this.downloadUrl, { 
      headers: headers,
      responseType: 'blob',
      params: params
    })
  }

  delete(id: String) {
    this.map.delete(id);
  }

  update(id: String, update: Partial<FileElement>) {
    let element = this.map.get(id);
    element = Object.assign(element, update);
    //this.map.set(element.id, element);
  }

  private querySubject: BehaviorSubject<FileElement[]>;
  queryInFolder(folderId: String) {
    console.log('querying ' + folderId)
    const result: FileElement[] = [];
    this.map.forEach(element => {
      /*if (element.parent === folderId) {
        result.push(this.clone(element));
      }*/
    });
    if (!this.querySubject) {
      this.querySubject = new BehaviorSubject(result);
    } else {
      this.querySubject.next(result);
    }
    return this.querySubject.asObservable();
  }

  get(filePath: String) {
    return this.map.get(filePath);
  }

}
