import { Directive, Renderer2, ElementRef, Input, SimpleChanges, HostListener } from '@angular/core';
import { Globals } from 'config';
import Npi from './models/npi.model';

const rowClasses = ['table-primary', 'table-success', 'table-warning', 'table-danger', 'table-info', 'table-secondary']
const cellClasses = ['text-primary', 'text-success', 'text-warning', 'text-danger', 'text-info', 'text-secondary']

const depts = Globals.ACTIVITIES_DEPTS

@Directive({
  selector: '[appActivityRow]'
})
export class ActivityRowDirective {
  @Input('appActivityRow') deptRole: string
  @Input() npi: Npi
  constructor(private el: ElementRef, private renderer: Renderer2) { }

  @HostListener('mouseenter') onHoverIn() {
    this.colorizeElement('row')
  }

  @HostListener('mouseleave') onHoverOut() {
    this.unColorizeElement('row')
  }

  ngOnChanges(changes: SimpleChanges) {
    this.colorizeElement('cell')
  }

  colorizeElement(selector) {
    for (let i = 0; i < depts.length; i++) {
      if (this.deptRole == depts[i]) {
        //console.log(event)
        if (this.el.nativeElement.nodeName == 'TR' && selector=='row')
          this.renderer.addClass(this.el.nativeElement, rowClasses[i])
        else
          if (this.el.nativeElement.nodeName == 'TD' && selector=='cell')
            this.renderer.addClass(this.el.nativeElement, cellClasses[i])
        break
      }
    }
  }

  unColorizeElement(selector) {
    for (let i = 0; i < depts.length; i++) {
      if (this.deptRole == depts[i]) {
        //console.log(event)
        if (this.el.nativeElement.nodeName == 'TR' && selector=='row')
          this.renderer.removeClass(this.el.nativeElement, rowClasses[i])
        else
          if (this.el.nativeElement.nodeName == 'TD' && selector=='cell')
            this.renderer.removeClass(this.el.nativeElement, cellClasses[i])
        break
      }
    }
  }
}
