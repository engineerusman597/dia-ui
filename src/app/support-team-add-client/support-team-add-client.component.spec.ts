import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupportTeamAddClientComponent } from './support-team-add-client.component';

describe('SupportTeamAddClientComponent', () => {
  let component: SupportTeamAddClientComponent;
  let fixture: ComponentFixture<SupportTeamAddClientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupportTeamAddClientComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupportTeamAddClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
