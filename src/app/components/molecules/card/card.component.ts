import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent {
  @Input() realState: any;

  constructor(private router: Router) { }

  ngOnInit() {
    
  }

  onCardClick(): void {
    if (this.realState) {
      console.log('Navegando con data completa:', this.realState);
      
      // Navegar enviando toda la data como state
      this.router.navigate(['/property', this.realState.id], {
        state: { 
          propertyData: this.realState 
        }
      });
    }
  }

  
}
