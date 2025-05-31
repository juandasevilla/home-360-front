import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;
  let buttonElement: HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ButtonComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    buttonElement = fixture.debugElement.query(By.css('button')).nativeElement;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should have default values', () => {
    expect(component.type).toBe('button');
    expect(component.buttonStyle).toBe('primary');
    expect(component.disabled).toBe(false);
  });

  it('should render the button text', () => {
    component.text = 'Test Button';
    fixture.detectChanges();
    expect(buttonElement.textContent?.trim()).toBe('Test Button');
  });

  it('should apply button type', () => {
    component.type = 'submit';
    fixture.detectChanges();
    expect(buttonElement.type).toBe('submit');
  });

  it('should apply button style class', () => {
    component.buttonStyle = 'secondary';
    fixture.detectChanges();
    expect(buttonElement.classList.contains('button--secondary')).toBe(true);
  });

  it('should disable the button', () => {
    component.disabled = true;
    fixture.detectChanges();
    expect(buttonElement.disabled).toBe(true);
  });

  it('should emit buttonClick event when clicked', () => {
    // Mock para el método buttonClick.emit
    const buttonClickSpy = jest.spyOn(component.buttonClick, 'emit');
    
    // Simular clic en el botón
    buttonElement.click();
    
    // Verificar que se emitió el evento
    expect(buttonClickSpy).toHaveBeenCalled();
  });

  it('should not emit buttonClick event when disabled', () => {
    component.disabled = true;
    fixture.detectChanges();
    
    // Mock para el método buttonClick.emit
    const buttonClickSpy = jest.spyOn(component.buttonClick, 'emit');
    
    // Intentar simular clic en el botón
    buttonElement.click();
    
    // Verificar que NO se emitió el evento
    expect(buttonClickSpy).not.toHaveBeenCalled();
  });

  it('should call onClick method when button is clicked', () => {
    // Mock para el método onClick
    const onClickSpy = jest.spyOn(component, 'onClick');
    
    // Simular clic en el botón
    buttonElement.click();
    
    // Verificar que se llamó al método
    expect(onClickSpy).toHaveBeenCalled();
  });
});