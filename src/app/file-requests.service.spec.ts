import { TestBed } from '@angular/core/testing';

import { FileRequestsService } from './file-requests/file-requests.service';

describe('FileRequestsService', () => {
  let service: FileRequestsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileRequestsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
