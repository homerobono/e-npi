import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MigrationEditComponent } from './migration-edit.component';

describe('MigrationEditComponent', () => {
  let component: MigrationEditComponent;
  let fixture: ComponentFixture<MigrationEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MigrationEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MigrationEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
