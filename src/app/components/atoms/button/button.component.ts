import { Component, EventEmitter, Input, Output } from '@angular/core';

import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent {
  @Input() text!: string;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() buttonStyle: 'primary' | 'secondary' | 'pagination-active' = 'primary';
  @Input() disabled = false;
  @Input() icon?: IconDefinition;
  @Output() buttonClick = new EventEmitter<void>();

  onClick() {
    this.buttonClick.emit();
  }
}
