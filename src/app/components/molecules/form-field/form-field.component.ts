import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-form-field',
  templateUrl: './form-field.component.html',
  styleUrls: ['./form-field.component.scss']
})
export class FormFieldComponent {
  @Input() id: string = '';
  @Input() label: string = '';
  @Input() required: boolean = false;
  @Input() errorMessage: string = '';

}
