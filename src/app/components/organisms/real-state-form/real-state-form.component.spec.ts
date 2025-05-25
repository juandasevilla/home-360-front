import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RealStateFormComponent } from './real-state-form.component';

describe('RealStateFormComponent', () => {
  let component: RealStateFormComponent;
  let fixture: ComponentFixture<RealStateFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RealStateFormComponent]
    });
    fixture = TestBed.createComponent(RealStateFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
