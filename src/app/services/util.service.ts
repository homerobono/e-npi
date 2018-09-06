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

  getEntriesArray(){
    return Globals.ENTRIES_ARR
  }

  getOemActivities(){
    return Globals.OEM_ACTIVITIES
  }

  getStatuses(){
    return Globals.STATUS
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

  getActivities(){
    return Globals.MACRO_STAGES
  }

  getActivity(value){
    for (var i = 0; i < Globals.MACRO_STAGES.length; i++) {
      var activity = Globals.MACRO_STAGES[i]
      if (activity.value == value)
        return activity.label
    }
    return ''
  }

}
