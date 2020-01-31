import { TestBed } from '@angular/core/testing';

import { OcrProviderService } from './ocr-provider.service';

describe('OcrProviderService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OcrProviderService = TestBed.get(OcrProviderService);
    expect(service).toBeTruthy();
  });
});
