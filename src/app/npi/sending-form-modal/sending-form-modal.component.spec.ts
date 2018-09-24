import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SendingFormModalComponent } from './sending-form-modal.component';

describe('SendingFormModalComponent', () => {
  let component: SendingFormModalComponent;
  let fixture: ComponentFixture<SendingFormModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SendingFormModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SendingFormModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
