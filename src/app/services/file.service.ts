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
  delete(path: String, elementName: String);
  rename(path: String, elementName: String, newName: String);
  move(path: String, elementName: String, newPath: String);
}

@Injectable()
export class FileService implements IFileService {

  apiUrl = Globals.ENPI_SERVER_URL + '/files'
  listUrl = `${this.apiUrl}/list`;
  addUrl = `${this.apiUrl}/createFolder`;
  downloadUrl = `${this.apiUrl}/download`;
  removeUrl = `${this.apiUrl}/remove`;
  renameUrl = `${this.apiUrl}/rename`;
  moveUrl = `${this.apiUrl}/move`;

  inprocess = false
  asyncSuccess = false
  error = ''

  constructor(
    private http: HttpClient
  ) { }

  list(path, exts) {
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
      })
  };

  add(path: String, folderName: String) {
    console.log('adding ' + folderName)
    var data = {
      path: path,
      name: folderName,
    };
    return this.http.post(this.addUrl, { params: data })
  }
  
  downloadAll(path: String) {
    const fullPathName = path as string
    const headers = new HttpHeaders().set('content-type', 'application/blob');
    const params = new HttpParams().set('path', fullPathName)
    console.log(fullPathName)
    return this.http.get(this.downloadUrl, { 
      headers: headers,
      responseType: 'blob',
      params: params
    })
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

  delete(path: String, elementName: String) {
    console.log('removing ' + elementName)
    var data = {
      action: 'remove',
      path: path,
      name: elementName,
    };
    return this.http.post(this.removeUrl, { params: data })
  }
  
  rename(path: String, elementName: String, newName: String) {
    var data = {
      path: path,
      name: elementName,
      newName: newName,
    };
    return this.http.post(this.renameUrl, { params: data })
  }

  move(path: String, elementName: String, moveTo: String) {
    var data = {
      path: path,
      name: elementName,
      newPath: moveTo,
    };
    return this.http.post(this.moveUrl, { params: data })
  }

}
