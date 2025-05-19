import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-textarea',
  templateUrl: './textarea.component.html',
  styleUrls: ['./textarea.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextareaComponent),
      multi: true
    }
  ]
})
export class TextareaComponent {
  @Input() id: string = '';
  @Input() placeholder: string = '';
  @Input() rows: number = 4;
  @Input() required: boolean = false;
  @Input() hasError: boolean = false;
  
  value: string = '';
  disabled: boolean = false;
  
  onChange: any = () => {};
  onTouched: any = () => {};
  
  onTextareaChange(event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.value = value;
    this.onChange(value);
    this.onTouched();
  }
  
  writeValue(value: any): void {
    this.value = value || '';
  }
  
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

}
