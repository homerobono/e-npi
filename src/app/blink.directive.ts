import { Directive, ElementRef, Input, Renderer, HostListener, Renderer2, SimpleChanges, HostBinding } from '@angular/core';

@Directive({ selector: '[appBlink]' })

export class BlinkDirective {
    
    @Input() public appBlink: any;

    constructor(private el: ElementRef, private renderer: Renderer2) {
    }

    ngOnChanges(changes: SimpleChanges) {
      //console.log(this.appBlink)
      let oldStyle = this.el.nativeElement.style
      this.renderer.setStyle(this.el.nativeElement, 'border-width', '1px')
      this.renderer.setStyle(this.el.nativeElement, 'border-color', 'blue')
      this.renderer.setStyle(this.el.nativeElement, 'color', 'blue')
      setTimeout(()=>{
        //this.renderer.removeClass(this.el.nativeElement, 'border-warning')
        this.renderer.removeStyle(this.el.nativeElement, 'border-width')
        this.renderer.removeStyle(this.el.nativeElement, 'border-color')
        this.renderer.removeStyle(this.el.nativeElement, 'color')
      }, 3000)
  }
    
}