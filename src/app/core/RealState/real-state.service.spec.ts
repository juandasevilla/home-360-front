import { TestBed } from '@angular/core/testing';

import { RealStateService } from './real-state.service';

describe('RealStateService', () => {
  let service: RealStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RealStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
