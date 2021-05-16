import { TestBed } from '@angular/core/testing';

import { PcshopFormService } from './pcshop-form.service';

describe('PcshopFormService', () => {
  let service: PcshopFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PcshopFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
