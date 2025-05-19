import { Component } from '@angular/core';
import { FooterItem } from 'src/app/shared/models/FooterItem';
import { faFacebook, faTwitter, faInstagram, faLinkedin } from '@fortawesome/free-brands-svg-icons';

@Component({
  selector: 'app-footer-container',
  templateUrl: './footer-container.component.html',
  styleUrls: ['./footer-container.component.scss']
})
export class FooterContainerComponent {
  quickLinks: FooterItem[] = [
    { text: 'Inicio' },
    { text: 'Propiedades' },
    { text: 'Nosotros' }
  ];

  // Información de contacto
  contactInfo: FooterItem[] = [
    { text: 'info@hogar360.com' },
    { text: '(+57) 300 123 4567' },
    { text: 'Calle 123 #45-67, Bogotá' }
  ];

  // Enlaces de redes sociales
  socialLinks: FooterItem[] = [
    { icon: faFacebook },
    { icon: faTwitter },
    { icon: faInstagram },
    { icon: faLinkedin }
  ];

}
