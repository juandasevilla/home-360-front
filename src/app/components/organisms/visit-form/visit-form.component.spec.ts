import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitFormComponent } from './visit-form.component';

describe('VisitFormComponent', () => {
  let component: VisitFormComponent;
  let fixture: ComponentFixture<VisitFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VisitFormComponent]
    });
    fixture = TestBed.createComponent(VisitFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
