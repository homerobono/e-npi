import { Component, OnInit, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MessageService } from '../services/message.service';
import { NpiService } from '../services/npi.service';
import Npi from '../models/npi.model';
import { UtilService } from '../services/util.service';
import { Globals } from '../../../config';
import { fadeAnimation } from '../_animations/fade_in_out.animation'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [fadeAnimation],
})
export class HomeComponent implements OnInit {

  userLevel: Number = 0
  response = null
  filteredData: Npi[]
  data: Array<any>

  sortParams: Array<any>

  gettingNpis: Boolean = false
  manualRefresh: Boolean = false

  filterForm: FormGroup

  scrollYPosition: Number
  showGoToBottomButton: Boolean = true
  showGoToTopButton: Boolean

  ///////////////////////

  page = 1;
  public itemsPerPage: number = 30;
  public maxSize: number = 5;
  public numPages: number = 1;
  public length: number = 0;

  constructor(
    private fb: FormBuilder,
    private npiService: NpiService,
    private router: Router,
    private authService: AuthService,
    private messenger: MessageService,
    private utils: UtilService,
  ) {
    this.userLevel = this.authService.getUserLevel();
    this.sortParams =
      [{ field: 'number', order: 1 },
      { field: 'name', order: 1 },
      { field: 'entry', order: 1 },
      { field: 'stage', order: 1 },
      { field: 'updated', order: 1 }]

    this.filteredData = []
    this.data = []

    this.filterForm = fb.group({
      name: null,
      entry: null,
      stage: null,
      updated: null
    })

    this.filterForm.valueChanges.subscribe(
      res => this.applyFilter(res),
    )

    npiService.manualRefresh.subscribe(val => this.manualRefresh = val)
  }

  ngOnInit(): void {
    console.log('getting npis');
    this.getNpis()
    //console.log(this.filteredData)
    //console.log('y: ' + pageYOffset)
  }

  @HostListener('window:scroll', ['$event'])
  handleScrollEvent(e) {
    this.scrollYPosition = pageYOffset
    if (pageYOffset > 200) {
      this.showGoToTopButton = true
    } else
      this.showGoToTopButton = false
    if (pageYOffset < outerHeight - 160) {
      this.showGoToBottomButton = true
    } else
      this.showGoToBottomButton = false
  }

  getNpis() {
    this.gettingNpis = true;
    this.npiService.npisList.subscribe(
      npis => {
        this.data = npis.sort(
          this.sortBy(this.sortParams)
        );
        this.applyFilter(this.filterForm.value)
        this.data = npis
        this.gettingNpis = false;
        this.manualRefresh = false;
      })
  }

  applyFilter(filterFields) {
    //console.log(filterFields)
    let filteredData: Array<Npi> = this.data;
    for (let filterField in filterFields) {
      let filterString = filterFields[filterField]
      //console.log(filterString)
      if (filterString != null && filterString != '') {
        //console.log('filtering')
        try {
          filteredData = filteredData.filter((item: any) => {
            return item[filterField].toString().match(new RegExp(filterString, 'i'));
          });
        } catch (e) {
          console.log(e)
        }
      }
    }
    this.filteredData = filteredData
    //console.log(filteredData)
    //return filteredData
  }

  toggleSortBy(property) {
    //console.log(this.sortParam)
    let clickedParam = this.sortParams[0]
    if (clickedParam.field == property)
      clickedParam.order = (clickedParam.order as number - 2) % 3 + 1
    else
      clickedParam.order = -1

    console.log(this.sortParams)
    let i = this.sortParams.findIndex(o => o.field === property)
    console.log(i)
    let sortParam = this.sortParams[i]
    this.sortParams.splice(i, 1)
    this.sortParams.unshift(sortParam)
    console.log(this.sortParams)

    this.data.sort(
      this.sortBy(this.sortParams)
    );
    this.applyFilter(this.filterForm.value)
  }

  sortBy(properties: Array<any>) {
    //console.log(sortOrder ? sortOrder > 0 ? 'Up' : 'Down' : 'Unordered')
    return function (a, b) {
      for (let i = 0; i < properties.length; i++) {
        let param = properties[i]
        if (a[param.field] > b[param.field]) return (1 * param.order)
        if (a[param.field] < b[param.field]) return (-1 * param.order)
      }
      return 0
    }
  }

  editProfile(npiId: String) {
    this.router.navigate(['/npi/' + npiId]);
  }

  goToRegister() {
    this.messenger.clear()
    this.router.navigate(['/register']);
  }

  goToNpi(npiNumber) {
    this.router.navigate(['/npi/' + npiNumber]);
  }

  removeAll() {
    if (!confirm(
      "ATENÇÃO: Essa operação irá remover todas as NPI's. Tem certeza que deseja apagar todos os registros do banco de dados?")
    ) return;
    console.log('REMOVING ALL NPI\'s')
    this.npiService.removeAll().subscribe(
      res => {
        console.log(res)
        this.getNpis();
        this.messenger.set(
          {
            type: 'warning',
            message: 'NPI\'s removidas'
          }
        )
      },
      err => { console.log('failed to remove') }
    );
  }

  cancelNPI(npiId: String, npiNumber: Number, event: Event) {
    event.stopPropagation()
    if (!confirm(
      "Tem certeza que deseja cancelar a NPI " +
      npiNumber + '?')
    ) return;
    console.log('canceling NPI')
    this.npiService.deleteNpi(npiId).subscribe(
      res => {
        console.log(res)
        this.getNpis();
        this.messenger.set(
          {
            type: 'info',
            message: 'NPI cancelada'
          }
        )
      },
      err => { console.log('failed to delete') }
    );
  }

  refresh() {
    this.npiService.manualRefresh.next(true)
  }

  scrollTo(where) {
    if (where == 'top')
      window.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
    else if (where == 'bottom')
      window.scrollTo({ left: 0, top: outerHeight, behavior: 'smooth' });
  }


  ////////////////////////
  /*////////////////////////

  public changePage(page: any, data: Array<any> = this.data): Array<any> {
    let start = (page.page - 1) * page.itemsPerPage;
    let end = page.itemsPerPage > -1 ? (start + page.itemsPerPage) : data.length;
    return data.slice(start, end);
  }

  public changeSort(data: any, config: any): any {
    if (!config.sorting) {
      return data;
    }

    let columns = this.config.sorting.columns || [];
    let columnName: string = void 0;
    let sort: string = void 0;

    for (let i = 0; i < columns.length; i++) {
      if (columns[i].sort !== '' && columns[i].sort !== false) {
        columnName = columns[i].name;
        sort = columns[i].sort;
      }
    }

    if (!columnName) {
      return data;
    }

    // simple sorting
    return data.sort((previous: any, current: any) => {
      if (previous[columnName] > current[columnName]) {
        return sort === 'desc' ? -1 : 1;
      } else if (previous[columnName] < current[columnName]) {
        return sort === 'asc' ? -1 : 1;
      }
      return 0;
    });
  }

  public changeFilter(data: any, config: any): any {
    let filteredData: Array<any> = data;
    this.columns.forEach((column: any) => {
      if (column.filtering) {
        filteredData = filteredData.filter((item: any) => {
          return item[column.name].match(column.filtering.filterString);
        });
      }
    });

    if (!config.filtering) {
      return filteredData;
    }

    if (config.filtering.columnName) {
      return filteredData.filter((item: any) =>
        item[config.filtering.columnName].match(this.config.filtering.filterString));
    }

    let tempArray: Array<any> = [];
    filteredData.forEach((item: any) => {
      let flag = false;
      this.columns.forEach((column: any) => {
        if (item[column.name].toString().match(this.config.filtering.filterString)) {
          flag = true;
        }
      });
      if (flag) {
        tempArray.push(item);
      }
    });
    filteredData = tempArray;

    return filteredData;
  }

  public onChangeTable(config: any, page: any = { page: this.page, itemsPerPage: this.itemsPerPage }): any {
    if (config.filtering) {
      Object.assign(this.config.filtering, config.filtering);
    }

    if (config.sorting) {
      Object.assign(this.config.sorting, config.sorting);
    }

    let filteredData = this.changeFilter(this.data, this.config);
    let sortedData = this.changeSort(filteredData, this.config);
    this.rows = page && config.paging ? this.changePage(page, sortedData) : sortedData;
    
    this.length = sortedData.length;
  }

  public onCellClick(data: any): any {
    console.log(data);
  }
  */

}
