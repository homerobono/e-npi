import { Directive, ElementRef, Input, HostListener, Renderer2, SimpleChanges, HostBinding } from '@angular/core';
import { UtilService } from '../services/util.service';
import { AbstractControl } from '@angular/forms';

@Directive({ selector: '[appBlink]' })

export class BlinkDirective {

  @Input() public activity: any;
  @Input() public dependencies: Array<AbstractControl>;
  @Input() public dependents: Array<AbstractControl>;

  @HostListener('focus') dateFocus() {
    if (this.dependencies)
      this.dependencies.forEach(dep => {
        let el = document.getElementById(dep.get('activity').value + '_END_DATE')
        this.highlightElement(el, 'orange')
      })
    if (this.dependents)
      this.dependents.forEach(dep => {
        let el = document.getElementById(dep.get('activity').value + '_END_DATE')
        this.highlightElement(el, 'blueviolet')
      })
  }

  @HostListener('focusout') dateFocusOut() {
    if (this.dependencies)
      this.dependencies.forEach(dep => {
        let el = document.getElementById(dep.get('activity').value + '_END_DATE')
        this.unHighlightElement(el)
      })
    if (this.dependents)
      this.dependents.forEach(dep => {
        let el = document.getElementById(dep.get('activity').value + '_END_DATE')
        this.unHighlightElement(el)
      })
  }

  constructor(private el: ElementRef,
    private renderer: Renderer2,
    private utils: UtilService) { }

  @HostListener('valueChanges') onValueChanges() {
    //let oldStyle = this.el.nativeElement.style
    //this.renderer.setStyle(this.el.nativeElement, 'border-width', '1px')
    if (!this.el.nativeElement.style.borderColor) {
      this.highlightElement(this.el.nativeElement, 'green')
      setTimeout(() => {
        //this.renderer.removeClass(this.el.nativeElement, 'border-warning')
        this.unHighlightElement(this.el.nativeElement)
      }, 3000)
    }
  }

  highlightElement(el: HTMLElement, color: string) {
    if (el) {
      this.renderer.setStyle(el, 'border-color', color)
      this.renderer.setStyle(el, 'color', color)
    }
  }

  unHighlightElement(el: HTMLElement) {
    if (el) {
      this.renderer.removeStyle(el, 'border-width')
      this.renderer.removeStyle(el, 'border-color')
      this.renderer.removeStyle(el, 'color')
    }
  }
}