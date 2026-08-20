import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientsPendingApprovalComponent } from './clients-pending-approval.component';

describe('ClientsPendingApprovalComponent', () => {
  let component: ClientsPendingApprovalComponent;
  let fixture: ComponentFixture<ClientsPendingApprovalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientsPendingApprovalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientsPendingApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
