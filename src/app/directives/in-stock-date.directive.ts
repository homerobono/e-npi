import { Directive, ElementRef, Renderer2, SimpleChanges, Input } from '@angular/core';

@Directive({
  selector: '[appInStockDate]'
})
export class InStockDateDirective {

  @Input() public appInStockDate

  constructor(private el: ElementRef, private renderer: Renderer2) { }

  ngOnChanges(changes: SimpleChanges) {
    console.log(changes)
    let left = changes.appInStockDate.currentValue + 5 + 'px'
    this.renderer.setStyle(this.el.nativeElement, 'left', left)
    //let dateField = document.getElementsByTagName('input').item(0)
  }

}
