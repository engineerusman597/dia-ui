import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkUploadClientsComponent } from './bulk-upload-clients.component';

describe('BulkUploadClientsComponent', () => {
  let component: BulkUploadClientsComponent;
  let fixture: ComponentFixture<BulkUploadClientsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BulkUploadClientsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BulkUploadClientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
