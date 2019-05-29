import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadingModalComponent } from './downloading-modal.component';

describe('DownloadComponentComponent', () => {
  let component: DownloadingModalComponent;
  let fixture: ComponentFixture<DownloadingModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DownloadingModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DownloadingModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
