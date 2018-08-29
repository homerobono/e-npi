import { Injectable } from '@angular/core';
import { Globals } from '../../../config';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor() { }

  getEntry(entry){
    return Globals.ENTRIES[entry]
  }

  getEntries(){
    return Globals.ENTRIES
  }

  getOemActivities(){
    return Globals.OEM_ACTIVITIES
  }

  getStatus(stage: Number){
    return Globals.STATUS[stage as number]
  }

  getDepartment(department) {
    for (var i = 0; i < Globals.DEPARTMENTS.length; i++) {
      var dept = Globals.DEPARTMENTS[i]
      if (dept.value == department)
        return dept.label
    }
    return ''
  }

  getDepartments() {
    return Globals.DEPARTMENTS
  }
  
  getCriticalAnalisys(dept){
    var depts = ['EPROC','OPR','ADM','COM']
    switch(dept){
      case 'oem':
        depts = ['PRD'].concat(depts)
        break;
      default:
    }
    return depts;
  }
}
