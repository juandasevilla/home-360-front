import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-property-detail',
  templateUrl: './property-detail.component.html',
  styleUrls: ['./property-detail.component.scss']
})
export class PropertyDetailComponent {
  realState: any;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Capturar la data del state que viene desde la card
    const navigation = this.router.getCurrentNavigation();
    
    if (navigation?.extras?.state?.['propertyData']) {
      // Data viene del navigation state
      this.realState = navigation.extras.state['propertyData'];
      console.log('Data recibida desde card:', this.realState);
    } else {
      // Fallback: intentar desde history.state
      const historyState = history.state?.propertyData;
      
      if (historyState) {
        this.realState = historyState;
        console.log('Data obtenida del history:', this.realState);
      } else {
        console.error('No se recibió data de la propiedad');
        // Opcional: redirigir al home si no hay data
        // this.router.navigate(['/home']);
      }
    }
  }


}
