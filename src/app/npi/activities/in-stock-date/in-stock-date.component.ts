import { Component, Output, EventEmitter } from '@angular/core';
import { ElementRef, Renderer2, Input, HostListener } from '@angular/core';

import { slideInOutBottomAnimation, slideInOutTopAnimation, scaleUpDownAnimation } from '../../../_animations/slide_in_out.animation'

@Component({
  selector: 'app-in-stock-date',
  templateUrl: './in-stock-date.component.html',
  styleUrls: ['./in-stock-date.component.scss'],
  animations: [slideInOutBottomAnimation, slideInOutTopAnimation, scaleUpDownAnimation],
})
export class InStockDateComponent {
  public releaseDate
  @Input() inStockDate: Date
  @Input() set releaseDateSetter(date: Date) {
    this.releaseDate = date
    this.updateDelayedStatus()
  }
  @Input() public appInStockDate

  @Output() setDelayedStatus = new EventEmitter<Boolean>()

  public state = 'hidden'
  
  @HostListener("window:scroll", [])
  onWindowScroll() {
    //console.log((this.appInStockDate as HTMLElement).attributes)
    let table = document.getElementById('tableHead')
    let tableTop = table.getBoundingClientRect().top - window.innerHeight
    if (window.pageYOffset < table.getBoundingClientRect().top + 600)
      this.state = 'hidden';
    else
      this.state = 'show';
  }

  constructor(private el: ElementRef, private renderer: Renderer2) { }

  updateDelayedStatus() {
    let isDelayed : Boolean = this.releaseDate.valueOf() > this.inStockDate.valueOf()
    this.setDelayedStatus.emit(isDelayed)
 }


}
