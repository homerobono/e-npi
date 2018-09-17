import { Injectable } from '@angular/core';

import { v4 } from 'uuid';
import { File } from '../models/file.model';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

export interface IFileService {
  add(fileElement: File);
  delete(id: string);
  update(id: string, update: Partial<File>);
  queryInFolder(folderId: string): Observable<File[]>;
  get(id: string): File;
}

@Injectable()
export class FileService implements IFileService {
  private map = new Map<string, File>();

  constructor() {}

  add(fileElement: File) {
    console.log('adding '+fileElement)
    fileElement.id = v4();
    this.map.set(fileElement.id, this.clone(fileElement));
    return fileElement;
  }

  delete(id: string) {
    this.map.delete(id);
  }

  update(id: string, update: Partial<File>) {
    let element = this.map.get(id);
    element = Object.assign(element, update);
    this.map.set(element.id, element);
  }

  private querySubject: BehaviorSubject<File[]>;
  queryInFolder(folderId: string) {
    console.log('querying '+folderId)
    const result: File[] = [];
    this.map.forEach(element => {
      if (element.parent === folderId) {
        result.push(this.clone(element));
      }
    });
    if (!this.querySubject) {
      this.querySubject = new BehaviorSubject(result);
    } else {
      this.querySubject.next(result);
    }
    return this.querySubject.asObservable();
  }

  get(id: string) {
    return this.map.get(id);
  }

  clone(element: File) {
    return JSON.parse(JSON.stringify(element));
  }
}
