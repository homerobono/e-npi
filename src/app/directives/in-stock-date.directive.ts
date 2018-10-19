import { Directive, ElementRef, Renderer2, SimpleChanges, Input, HostListener } from '@angular/core';

@Directive({
  selector: '[appInStockDate]'
})
export class InStockDateDirective {

  @Input() public appInStockDate
  public state = 'hidden'

  @HostListener("window:scroll", [])
  onWindowScroll() {
    //console.log((this.appInStockDate as HTMLElement).attributes)
    let table = document.getElementById('tableHead')
    let tableY = table.getBoundingClientRect().top - window.innerHeight
    if (window.pageYOffset < table.getBoundingClientRect().top + 600){
      //this.renderer.setStyle(this.el.nativeElement, 'display', 'none')
      this.state = 'hidden';
      (this.el.nativeElement as HTMLElement).setAttribute('state', 'hidden')
    }
    else{
      //this.renderer.setStyle(this.el.nativeElement, 'display', 'block');
      this.state = 'show';
      (this.el.nativeElement as HTMLElement).setAttribute('state', 'show')
    }
  }

  constructor(private el: ElementRef, private renderer: Renderer2) { 
    (this.el.nativeElement as HTMLElement).setAttribute('state', 'hidden')
  }
}
