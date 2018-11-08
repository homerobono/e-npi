import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InStockDateComponent } from './in-stock-date.component';

describe('InStockDateComponent', () => {
  let component: InStockDateComponent;
  let fixture: ComponentFixture<InStockDateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InStockDateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InStockDateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
