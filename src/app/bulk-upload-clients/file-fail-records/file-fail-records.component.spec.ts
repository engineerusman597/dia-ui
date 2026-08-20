import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileFailRecordsComponent } from './file-fail-records.component';

describe('FileFailRecordsComponent', () => {
  let component: FileFailRecordsComponent;
  let fixture: ComponentFixture<FileFailRecordsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileFailRecordsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileFailRecordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
