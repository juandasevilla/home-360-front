import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { TextareaComponent } from './textarea.component';

describe('TextareaComponent', () => {
  let component: TextareaComponent;
  let fixture: ComponentFixture<TextareaComponent>;
  let textareaElement: HTMLTextAreaElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TextareaComponent],
      imports: [FormsModule, ReactiveFormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(TextareaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    textareaElement = fixture.debugElement.query(By.css('textarea')).nativeElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default values', () => {
    expect(component.id).toBe('');
    expect(component.placeholder).toBe('');
    expect(component.rows).toBe(4);
    expect(component.required).toBe(false);
    expect(component.hasError).toBe(false);
    expect(component.showCharCount).toBe(true);
    expect(component.currentLength).toBe(0);
    expect(component.value).toBe('');
    expect(component.disabled).toBe(false);
  });

  it('should set textarea properties correctly', () => {
    component.id = 'test-id';
    component.placeholder = 'Test placeholder';
    component.rows = 6;
    component.required = true;
    fixture.detectChanges();

    expect(textareaElement.id).toBe('test-id');
    expect(textareaElement.placeholder).toBe('Test placeholder');
    expect(textareaElement.rows).toBe(6);
    expect(textareaElement.required).toBe(true);
  });

  it('should call onChange and onTouched when textarea changes', () => {
    // Espías para los métodos onChange y onTouched
    const onChangeSpy = jest.spyOn(component, 'onChange');
    const onTouchedSpy = jest.spyOn(component, 'onTouched');

    // Simular un cambio en el textarea
    textareaElement.value = 'test textarea content';
    textareaElement.dispatchEvent(new Event('input'));
    
    expect(component.value).toBe('test textarea content');
    expect(onChangeSpy).toHaveBeenCalledWith('test textarea content');
    expect(onTouchedSpy).toHaveBeenCalled();
  });

  it('should implement ControlValueAccessor methods correctly', () => {
    // Probar writeValue
    component.writeValue('test write value');
    expect(component.value).toBe('test write value');
    
    // Probar registerOnChange
    const mockFn = jest.fn();
    component.registerOnChange(mockFn);
    component.onChange('test');
    expect(mockFn).toHaveBeenCalledWith('test');
    
    // Probar registerOnTouched
    const touchFn = jest.fn();
    component.registerOnTouched(touchFn);
    component.onTouched();
    expect(touchFn).toHaveBeenCalled();
    
    // Probar setDisabledState
    component.setDisabledState(true);
    expect(component.disabled).toBe(true);
    fixture.detectChanges();
    expect(textareaElement.disabled).toBe(true);
  });

  it('should add error class when hasError is true', () => {
    component.hasError = true;
    fixture.detectChanges();
    
    const textareaField = fixture.debugElement.query(By.css('.textarea__field')).nativeElement;
    expect(textareaField.classList.contains('textarea__field--error')).toBe(true);
  });

  it('should show character counter when showCharCount is true and maxLength is set', () => {
    component.showCharCount = true;
    component.maxLength = 100;
    component.value = 'test';
    component.currentLength = 4;
    fixture.detectChanges();
    
    const counter = fixture.debugElement.query(By.css('.textarea__char-count'));
    expect(counter).toBeTruthy();
    expect(counter.nativeElement.textContent.trim()).toBe('4/100');
  });

  it('should not show character counter when showCharCount is false', () => {
    component.showCharCount = false;
    component.maxLength = 100;
    fixture.detectChanges();
    
    const counter = fixture.debugElement.query(By.css('.textarea__char-count'));
    expect(counter).toBeFalsy();
  });

  it('should not show character counter when maxLength is not set', () => {
    component.showCharCount = true;
    component.maxLength = undefined;
    fixture.detectChanges();
    
    const counter = fixture.debugElement.query(By.css('.textarea__char-count'));
    expect(counter).toBeFalsy();
  });

  it('should work with Angular forms', () => {
    const formControl = new FormControl('initial value');
    
    // Vincular el formControl al componente
    formControl.registerOnChange((val: string) => {
      component.writeValue(val);
    });
    
    component.registerOnChange((val: string) => {
      formControl.setValue(val, { emitEvent: false });
    });
    
    // Verificar valor inicial
    component.writeValue(formControl.value);
    expect(component.value).toBe('initial value');
    
    // Cambiar valor desde el componente
    textareaElement.value = 'new value';
    textareaElement.dispatchEvent(new Event('input'));
    
    expect(formControl.value).toBe('new value');
    
    // Cambiar valor desde el formControl
    formControl.setValue('changed from form');
    expect(component.value).toBe('changed from form');
  });

  it('should apply maxLength attribute when maxLength is set', () => {
    component.maxLength = 150;
    fixture.detectChanges();
    
    expect(textareaElement.getAttribute('maxlength')).toBe('150');
  });

  it('should not apply maxLength attribute when maxLength is not set', () => {
    component.maxLength = undefined;
    fixture.detectChanges();
    
    expect(textareaElement.getAttribute('maxlength')).toBeNull();
  });
});
