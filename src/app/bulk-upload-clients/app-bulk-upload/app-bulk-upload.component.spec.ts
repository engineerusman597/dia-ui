import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppBulkUploadComponent } from './app-bulk-upload.component';

describe('AppBulkUploadComponent', () => {
  let component: AppBulkUploadComponent;
  let fixture: ComponentFixture<AppBulkUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppBulkUploadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppBulkUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
