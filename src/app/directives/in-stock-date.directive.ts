import { Directive, ElementRef, Renderer2, SimpleChanges, Input } from '@angular/core';

@Directive({
  selector: '[appInStockDate]'
})
export class InStockDateDirective {

  @Input() public appInStockDate

  constructor(private el: ElementRef, private renderer: Renderer2) { }

  ngOnChanges(changes: SimpleChanges) {
    let dateFieldElement = document.getElementById('tableBody').lastElementChild.children[5] as HTMLElement
    let left = dateFieldElement.offsetLeft + 5 + dateFieldElement.clientWidth + 2 + 'px'
    let width = dateFieldElement.clientWidth - 9 + 'px'

    this.renderer.setStyle(this.el.nativeElement, 'left', left)
    this.renderer.setStyle(this.el.nativeElement, 'width', width)
    //let dateField = document.getElementsByTagName('input').item(0)
  }

}
