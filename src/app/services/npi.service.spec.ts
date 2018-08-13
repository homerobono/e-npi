import { TestBed, inject } from '@angular/core/testing';

import { NpiService } from './npi.service';

describe('NpiService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NpiService]
    });
  });

  it('should be created', inject([NpiService], (service: NpiService) => {
    expect(service).toBeTruthy();
  }));
});
