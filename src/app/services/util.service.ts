import { Injectable } from '@angular/core';
import { Globals } from '../../../config';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor() { }

  getTimeDifference(end: Date, start: Date): String {
    if (!end) end = new Date()
    if (!start) start = new Date()
    var diff = Math.abs(end.getTime() - start.getTime()) / 1000
    var rest = null
    var suffix = 's'
    var rest_suffix = null
    if (diff > 60) {
      rest = diff % 60
      diff /= 60
      rest_suffix = diff < 4 && rest > 0.5 ? suffix : null
      suffix = 'min'
      if (diff > 60) {
        rest = diff % 60
        diff /= 60
        rest_suffix = diff < 4 && rest > 0.5 ? suffix : null
        suffix = 'h'
        if (diff > 24) {
          rest = diff % 24
          diff /= 24
          rest_suffix = diff < 4 && rest > 0.5 ? suffix : null
          suffix = 'd'
          if (diff > 30) {
            rest = diff % 30
            diff /= 30
            rest_suffix = diff < 4 && rest > 0.5 ? 
              ' dia' + (rest > 2 ? 's' : '')
              : null
            suffix = ' mes' + (diff > 2 ? 'es' : '') +
              (rest_suffix ? ' e ': '')
            if (diff > 12) {
              rest = diff % 12
              diff /= 12
              rest_suffix = diff < 4 && rest > 0.5 ? 
              ' mes' + (rest > 2 ? 'es' : '')
              : null
              suffix = ' ano' + (diff > 2 ? 's' : '') +
              (rest_suffix ? ' e ': '')
            }
          }
        }
      }
    }
    return diff.toFixed(0) + suffix + (rest_suffix ? rest.toFixed(0) + rest_suffix : '')
  }

  getRegulation(regulation){
    return Globals.REGULATIONS.find(r => r.value == regulation)
  }

  getRegulations(){
    return Globals.REGULATIONS
  }

  getEntry(entry) {
    return Globals.ENTRIES[entry]
  }

  getEntries() {
    return Globals.ENTRIES
  }

  getEntriesArray() {
    return Globals.ENTRIES_ARR
  }

  getOemActivities() {
    return Globals.OEM_ACTIVITIES
  }

  getStatuses() {
    return Globals.STATUS
  }

  getStatus(stage: Number) {
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

  getCriticalAnalisys(dept) {
    var depts = ['EPROC', 'OPR', 'ADM', 'COM']
    switch (dept) {
      case 'oem':
        depts = ['PRD'].concat(depts)
        break;
      default:
    }
    return depts;
  }

  getActivities() {
    return Globals.MACRO_STAGES
  }

  getActivity(value) {
    for (var i = 0; i < Globals.MACRO_STAGES.length; i++) {
      var activity = Globals.MACRO_STAGES[i]
      if (activity.value == value)
        return activity.label
    }
    return ''
  }

}
