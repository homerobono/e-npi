import { Injectable } from '@angular/core';
import { Globals } from '../../../config';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor() { }

  getActivities(kind?: String) {
    return kind && kind == "oem" ? Globals.OEM_STAGES : Globals.MACRO_STAGES
  }

  getActivity(activity, kind?: String) {
    return (kind && kind == "oem" ? Globals.OEM_STAGES : Globals.MACRO_STAGES)
      .find(a => a.value == activity)
  }

  getOemActivities() {
    return Globals.OEM_ACTIVITIES
  }

  getOemActivity(activity) {
    return Globals.OEM_ACTIVITIES.find(a => a.value == activity)
  }

  getCriticalAnalysis(dept) {
    var depts = ['EPROC', 'OPR', 'ADM', 'COM']
    switch (dept) {
      case 'oem':
        depts = ['PRD'].concat(depts)
        break;
      default:
    }
    return depts;
  }

  getCurrencies() {
    return Globals.CURRENCIES
  }

  getCurrency(currency) {
    return Globals.CURRENCIES.find(r => r.value == currency)
  }

  getDemandPeriod(demandPeriod) {
    return Globals.DEMAND_PERIODS.find(r => r.value == demandPeriod)
  }

  getDemandPeriods() {
    return Globals.DEMAND_PERIODS
  }

  getDepartment(department) {
    return Globals.DEPARTMENTS.find(d => d.value == department)
  }

  getDepartments() {
    return Globals.DEPARTMENTS
  }

  getPixelCriticalDepartments() {
    return Globals.NPI_PIXEL_CRITICAL_DEPTS
  }

  getCriticalDepartments() {
    return Globals.NPI_PIXEL_CRITICAL_DEPTS
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

  getRegulation(regulation) {
    return Globals.REGULATIONS.find(r => r.value == regulation)
  }

  getRegulations() {
    return Globals.REGULATIONS
  }

  getStatuses() {
    return Globals.STATUS
  }

  getStatus(stage: Number) {
    return Globals.STATUS[stage as number]
  }

  getLabel(word: String) {
    let subwords = word.split('.')
    let label = Globals.LABELS[subwords[0]]
    for (let i=1; i<subwords.length; i++){
      label = label[subwords[i]]
    }
    return label
  }

  formatDate(date: Date): String {
    return date ? ('0' + date.getDate()).slice(-2) + '/'
      + ('0' + (date.getMonth() + 1)).slice(-2) + '/'
      + date.getFullYear() : null
  }

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
              ' dia' + (rest > 1 ? 's' : '')
              : null
            suffix = (diff > 1 ? 'meses' : 'mês') +
              (rest_suffix ? ' e ' : '')
            if (diff > 12) {
              rest = diff % 12
              diff /= 12
              rest_suffix = diff < 4 && rest > 0.5 ?
                (rest > 1 ? ' meses' : ' mês')
                : null
              suffix = ' ano' + (diff > 1 ? 's' : '') +
                (rest_suffix ? ' e ' : '')
            }
          }
        }
      }
    }
    return diff.toFixed(0) + suffix + (rest_suffix ? rest.toFixed(0) + rest_suffix : '')
  }

}
