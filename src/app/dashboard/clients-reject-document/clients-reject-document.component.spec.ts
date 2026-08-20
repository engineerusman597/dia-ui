import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientsRejectDocumentComponent } from './clients-reject-document.component';

describe('ClientsRejectDocumentComponent', () => {
  let component: ClientsRejectDocumentComponent;
  let fixture: ComponentFixture<ClientsRejectDocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientsRejectDocumentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientsRejectDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
