import { TestBed, inject } from '@angular/core/testing';

import { AccessGuardService } from './services/access.guard.service';

describe('Access.GuardService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AccessGuardService]
    });
  });

  it('should be created', inject([AccessGuardService], (service: Access.GuardService) => {
    expect(service).toBeTruthy();
  }));
});
