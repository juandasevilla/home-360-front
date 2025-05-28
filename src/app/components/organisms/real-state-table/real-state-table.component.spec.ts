import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RealStateTableComponent } from './real-state-table.component';

describe('RealStateTableComponent', () => {
  let component: RealStateTableComponent;
  let fixture: ComponentFixture<RealStateTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RealStateTableComponent]
    });
    fixture = TestBed.createComponent(RealStateTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
