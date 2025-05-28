import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { LabelComponent } from './label.component';

describe('LabelComponent', () => {
  let component: LabelComponent;
  let fixture: ComponentFixture<LabelComponent>;
  let labelElement: HTMLLabelElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LabelComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    labelElement = fixture.debugElement.query(By.css('label')).nativeElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default values', () => {
    expect(component.for).toBe('');
    expect(component.required).toBe(false);
  });

  it('should set the "for" attribute correctly', () => {
    component.for = 'test-input-id';
    fixture.detectChanges();
    expect(labelElement.getAttribute('for')).toBe('test-input-id');
  });

  it('should not show required indicator when required is false', () => {
    component.required = false;
    fixture.detectChanges();
    const requiredIndicator = fixture.debugElement.query(By.css('.label__required'));
    expect(requiredIndicator).toBeFalsy();
  });

  it('should show required indicator when required is true', () => {
    component.required = true;
    fixture.detectChanges();
    const requiredIndicator = fixture.debugElement.query(By.css('.label__required'));
    expect(requiredIndicator).toBeTruthy();
    expect(requiredIndicator.nativeElement.textContent).toContain('*');
  });

  it('should render the text content properly', () => {
    // Añadir contenido proyectado
    fixture.componentRef.setInput('for', 'test-id');
    fixture.nativeElement.innerHTML = '<app-label for="test-id">Test Label</app-label>';
    fixture.detectChanges();
    
    expect(labelElement.textContent).toContain('Test Label');
  });
});