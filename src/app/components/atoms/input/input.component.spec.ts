import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { InputComponent } from './input.component';

describe('InputComponent', () => {
  let component: InputComponent;
  let fixture: ComponentFixture<InputComponent>;
  let inputElement: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InputComponent],
      imports: [FormsModule, ReactiveFormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(InputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    inputElement = fixture.debugElement.query(By.css('input')).nativeElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default values', () => {
    expect(component.id).toBe('');
    expect(component.placeholder).toBe('');
    expect(component.type).toBe('text');
    expect(component.required).toBe(false);
    expect(component.hasError).toBe(false);
    expect(component.errorMessage).toBe('');
    expect(component.showCharCount).toBe(false);
    expect(component.value).toBe('');
    expect(component.disabled).toBe(false);
  });

  it('should set input properties correctly', () => {
    component.id = 'test-id';
    component.placeholder = 'Test placeholder';
    component.type = 'email';
    component.required = true;
    fixture.detectChanges();

    expect(inputElement.id).toBe('test-id');
    expect(inputElement.placeholder).toBe('Test placeholder');
    expect(inputElement.type).toBe('email');
    expect(inputElement.required).toBe(true);
  });

  it('should call onChange and onTouched when input changes', () => {
    // Spy en los métodos onChange y onTouched
    const onChangeSpy = jest.spyOn(component, 'onChange');
    const onTouchedSpy = jest.spyOn(component, 'onTouched');

    // Simular un cambio en el input
    inputElement.value = 'test value';
    inputElement.dispatchEvent(new Event('input'));
    
    expect(component.value).toBe('test value');
    expect(onChangeSpy).toHaveBeenCalledWith('test value');
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
    expect(inputElement.disabled).toBe(true);
  });

  it('should calculate currentLength correctly', () => {
    component.value = 'hello';
    expect(component.currentLength).toBe(5);
    
    component.value = '';
    expect(component.currentLength).toBe(0);
  });

  it('should display character count text correctly', () => {
    component.value = 'test';
    component.maxLength = 10;
    
    expect(component.charCountText).toBe('4/10');
    
    component.value = 'longer text';
    expect(component.charCountText).toBe('11/10');
  });

  it('should show character counter when showCharCount is true', () => {
    component.showCharCount = true;
    component.maxLength = 20;
    component.value = 'test';
    fixture.detectChanges();
    
    const counter = fixture.debugElement.query(By.css('.input__char-count'));
    expect(counter).toBeTruthy();
    expect(counter.nativeElement.textContent).toContain('4/20');
  });

  it('should not show character counter when showCharCount is false', () => {
    component.showCharCount = false;
    component.maxLength = 20;
    fixture.detectChanges();
    
    const counter = fixture.debugElement.query(By.css('.input__char-count'));
    expect(counter).toBeFalsy();
  });

  it('should add error class when hasError is true', () => {
    component.hasError = true;
    fixture.detectChanges();
    
    expect(inputElement.classList.contains('input--error')).toBe(true);
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
    inputElement.value = 'new value';
    inputElement.dispatchEvent(new Event('input'));
    
    expect(formControl.value).toBe('new value');
    
    // Cambiar valor desde el formControl
    formControl.setValue('changed from form');
    expect(component.value).toBe('changed from form');
  });
});