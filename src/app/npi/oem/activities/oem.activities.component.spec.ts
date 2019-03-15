import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Oem.ActivitiesComponent } from './oem.activities.component';

describe('Oem.ActivitiesComponent', () => {
  let component: Oem.ActivitiesComponent;
  let fixture: ComponentFixture<Oem.ActivitiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Oem.ActivitiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Oem.ActivitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
