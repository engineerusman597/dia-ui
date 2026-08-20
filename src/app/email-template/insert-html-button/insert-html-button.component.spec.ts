import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InsertHtmlButtonComponent } from './insert-html-button.component';

describe('InsertHtmlButtonComponent', () => {
  let component: InsertHtmlButtonComponent;
  let fixture: ComponentFixture<InsertHtmlButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InsertHtmlButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InsertHtmlButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
