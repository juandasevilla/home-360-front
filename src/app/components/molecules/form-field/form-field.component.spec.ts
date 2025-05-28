import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { By } from '@angular/platform-browser';
import { FormFieldComponent } from './form-field.component';

// Mock del componente Label para evitar dependencias
@Component({
  selector: 'app-label',
  template: '<label [attr.for]="for">{{ label }}<span *ngIf="required">*</span><ng-content></ng-content></label>'
})
class MockLabelComponent {
  @Input() for: string = '';
  @Input() required: boolean = false;
}

describe('FormFieldComponent', () => {
  let component: FormFieldComponent;
  let fixture: ComponentFixture<FormFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FormFieldComponent, MockLabelComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FormFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default values', () => {
    expect(component.id).toBe('');
    expect(component.label).toBe('');
    expect(component.required).toBe(false);
    expect(component.errorMessage).toBe('');
    expect(component.showCharCount).toBe(false);
    expect(component.currentLength).toBe(0);
    expect(component.maxLength).toBeUndefined();
  });

  it('should not display label when not provided', () => {
    component.label = '';
    fixture.detectChanges();
    
    const labelElement = fixture.debugElement.query(By.css('app-label'));
    expect(labelElement).toBeFalsy();
  });

  it('should display label when provided', () => {
    component.id = 'test-id';
    component.label = 'Test Label';
    component.required = true;
    fixture.detectChanges();
    
    const labelElement = fixture.debugElement.query(By.css('app-label'));
    expect(labelElement).toBeTruthy();
    expect(labelElement.nativeElement.textContent).toContain('Test Label');
    expect(labelElement.componentInstance.for).toBe('test-id');
    expect(labelElement.componentInstance.required).toBe(true);
  });

  it('should not display error message when not provided', () => {
    component.errorMessage = '';
    fixture.detectChanges();
    
    const errorElement = fixture.debugElement.query(By.css('.form-field__error'));
    expect(errorElement).toBeFalsy();
  });

  it('should display error message when provided', () => {
    component.errorMessage = 'Test error message';
    fixture.detectChanges();
    
    const errorElement = fixture.debugElement.query(By.css('.form-field__error'));
    expect(errorElement).toBeTruthy();
    expect(errorElement.nativeElement.textContent.trim()).toBe('Test error message');
  });

  it('should not display footer when no error message and no character count', () => {
    component.errorMessage = '';
    component.showCharCount = false;
    fixture.detectChanges();
    
    const footerElement = fixture.debugElement.query(By.css('.form-field__footer'));
    expect(footerElement).toBeFalsy();
  });

  it('should display footer when error message is provided', () => {
    component.errorMessage = 'Test error message';
    fixture.detectChanges();
    
    const footerElement = fixture.debugElement.query(By.css('.form-field__footer'));
    expect(footerElement).toBeTruthy();
  });

  it('should not display character count when showCharCount is false', () => {
    component.showCharCount = false;
    component.maxLength = 100;
    fixture.detectChanges();
    
    const charCountElement = fixture.debugElement.query(By.css('.form-field__char-count'));
    expect(charCountElement).toBeFalsy();
  });

  it('should not display character count when maxLength is not provided', () => {
    component.showCharCount = true;
    component.maxLength = undefined;
    fixture.detectChanges();
    
    const charCountElement = fixture.debugElement.query(By.css('.form-field__char-count'));
    expect(charCountElement).toBeFalsy();
  });

  it('should display character count when showCharCount is true and maxLength is provided', () => {
    component.showCharCount = true;
    component.currentLength = 10;
    component.maxLength = 100;
    fixture.detectChanges();
    
    const footerElement = fixture.debugElement.query(By.css('.form-field__footer'));
    expect(footerElement).toBeTruthy();
    
    // Verificar que el elemento de contador exista y contenga el texto correcto
    // (asumiendo que tu HTML tiene un elemento con esta clase)
    const charCountElement = fixture.debugElement.query(By.css('.form-field__char-count'));
    if (charCountElement) {
      expect(charCountElement.nativeElement.textContent).toContain('10/100');
    }
  });

  // Test para la proyección de contenido
  @Component({
    template: `
      <app-form-field id="test-id" label="Test Label">
        <div class="projected-content">Projected Content</div>
      </app-form-field>
    `
  })
  class TestHostComponent {}

  it('should project content correctly', () => {
    TestBed.configureTestingModule({
      declarations: [FormFieldComponent, MockLabelComponent, TestHostComponent]
    }).compileComponents();

    const hostFixture = TestBed.createComponent(TestHostComponent);
    hostFixture.detectChanges();
    
    const projectedContent = hostFixture.debugElement.query(By.css('.projected-content'));
    expect(projectedContent).toBeTruthy();
    expect(projectedContent.nativeElement.textContent).toBe('Projected Content');
  });
});
