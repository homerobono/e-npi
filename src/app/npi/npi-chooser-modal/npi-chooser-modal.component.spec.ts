import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NpiChooserModalComponent } from './npi-chooser-modal.component';

describe('NpiChooserModalComponent', () => {
  let component: NpiChooserModalComponent;
  let fixture: ComponentFixture<NpiChooserModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NpiChooserModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NpiChooserModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
