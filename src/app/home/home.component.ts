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
import { Subject } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [fadeAnimation],
})
export class HomeComponent implements OnInit {

  private ngUnsubscribe = new Subject();

  me : any // user ID
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

  stageOrder = [2, 3, 4, 5, 0, 1]

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
    this.me = authService.getUser()
    this.userLevel = this.authService.getUserLevel();
    this.sortParams =
      [{ field: 'number', order: -1 },
      { field: 'name', order: 1 },
      { field: 'entry', order: 1 },
      { field: 'stage', order: -1 },
      { field: 'updated', order: -1 }]

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
    if (pageYOffset < document.body.offsetHeight - outerHeight) {
      this.showGoToBottomButton = true
    } else
      this.showGoToBottomButton = false
  }

  getNpis() {
    this.gettingNpis = true;
    this.npiService.npisList.takeUntil(this.ngUnsubscribe)
    .subscribe(npis => {
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

  toggleStage(clickedStage) {
    let stage = this.stageOrder[clickedStage]
    this.stageOrder.splice(clickedStage, 1)
    this.stageOrder.unshift(stage)
    this.data.sort(
      this.sortBy(this.sortParams)
    );
    this.applyFilter(this.filterForm.value)
  }

  toggleSortBy(property) {
    //console.log(this.sortParam)
    let clickedParam = this.sortParams[0]
    if (clickedParam.field == property) {
      if (property == 'stage')
        this.stageOrder.reverse()
      clickedParam.order *= -1
    }

    let i = this.sortParams.findIndex(o => o.field === property)
    let sortParam = this.sortParams[i]
    this.sortParams.splice(i, 1)
    this.sortParams.unshift(sortParam)

    this.data.sort(
      this.sortBy(this.sortParams)
    );
    this.applyFilter(this.filterForm.value)
  }

  sortBy(properties: Array<any>) {
    let stageOrder = this.stageOrder
    return function (a, b) {
      for (let i = 0; i < properties.length; i++) {
        let param = properties[i]
        if (param.field == 'stage') {
          if (stageOrder.indexOf(a.stage) > stageOrder.indexOf(b.stage)) return 1
          if (stageOrder.indexOf(a.stage) < stageOrder.indexOf(b.stage)) return -1
        }
        else {
          if (a[param.field] > b[param.field]) return (1 * param.order)
          if (a[param.field] < b[param.field]) return (-1 * param.order)
        }
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
        this.refresh()
        //this.getNpis();
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
      window.scrollTo({ left: 0, 
        top: document.body.offsetHeight - outerHeight,
        behavior: 'smooth' });
  }

  ngOnDestroy(){
    console.log('Destroying component')
    this.ngUnsubscribe.next()
    this.ngUnsubscribe.complete()
  }

}
