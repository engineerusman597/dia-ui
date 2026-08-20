import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupportTeamClientListComponent } from './support-team-client-list.component';

describe('SupportTeamClientListComponent', () => {
  let component: SupportTeamClientListComponent;
  let fixture: ComponentFixture<SupportTeamClientListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupportTeamClientListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupportTeamClientListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
