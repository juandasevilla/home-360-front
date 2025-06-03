import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { VisitService } from 'src/app/core/visit/visit.service';
import { Schedule } from 'src/app/shared/models/Schedule';
import { VisitFilter } from 'src/app/shared/models/VisitFilter';
import { VisitResponse } from 'src/app/shared/models/VisitResponse';

@Component({
  selector: 'app-property-detail',
  templateUrl: './property-detail.component.html',
  styleUrls: ['./property-detail.component.scss']
})
export class PropertyDetailComponent {
  realState: any;
  visits: Schedule[] = [];
  selectedVisit: Schedule | null = null;
  currentPage: number = 0;
  totalPages: number = 0;
  totalElements: number = 0;
  pageSize: number = 10;
  isLoading: boolean = false;
  
  // Filtros
  filterInitialDate: string = '';
  filterFinalDate: string = '';
  filterFinalTime: string = '23:59'; 
  filterInitialTime: string = '00:00';

  private formatToLocalDateTime(date: string, time:string): string {
    if (!date || !time) return '';
    return `${date}T${time}:00`;
  }

  constructor(private router: Router,
              private visitService: VisitService
  ) {}

  ngOnInit(): void {
    // Capturar la data del state que viene desde la card
    const navigation = this.router.getCurrentNavigation();
    
    if (navigation?.extras?.state?.['propertyData']) {
      // Data viene del navigation state
      this.realState = navigation.extras.state['propertyData'];
      this.loadInitialVisits();
      console.log('Data recibida desde card:', this.realState);
    } else {
      // Fallback: intentar desde history.state
      const historyState = history.state?.propertyData;
      
      if (historyState) {
        this.realState = historyState;
        this.loadInitialVisits();
        console.log('Data obtenida del history:', this.realState);
      } else {
        console.error('No se recibió data de la propiedad');
        // Opcional: redirigir al home si no hay data
        // this.router.navigate(['/home']);
      }
    }
  }



  loadInitialVisits(): void {
    if (!this.realState?.id) return;
    
    console.log('Cargando visitas iniciales para propiedad:', this.realState.id);
    this.isLoading = true;
    this.currentPage = 0;
    
    // Petición básica sin filtros
    this.visitService.getVisitsByRealState(this.realState.id, {
      page: 0,
      size: this.pageSize
    }).subscribe({
      next: (response: VisitResponse) => {
        this.visits = response.content;
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
        this.isLoading = false;
        console.log('Visitas iniciales cargadas:', response);
      },
      error: (error) => {
        console.error('Error cargando visitas iniciales:', error);
        this.isLoading = false;
      }
    });
  }

  /**
   * APLICAR FILTROS - Solo cuando el usuario interactúa
   */
  applyFilters(): void {
    if (!this.realState?.id) return;

    const initialDateTime = this.formatToLocalDateTime(this.filterInitialDate, this.filterInitialTime);
    const finalDateTime = this.formatToLocalDateTime(this.filterFinalDate, this.filterFinalTime);
    
    console.log('Aplicando filtros:', {
      initialDateTime,
      finalDateTime
    });
    
    this.isLoading = true;
    this.currentPage = 0; // Resetear a página 0 cuando se filtran
    this.selectedVisit = null; // Limpiar selección
    
    const filter: VisitFilter = {
      page: 0,
      size: this.pageSize
    };

    // Solo agregar filtros si tienen valor
    if (this.filterInitialDate.trim() !== '') {
      filter.initialDate = initialDateTime;
    }

    if (this.filterFinalDate.trim() !== '') {
      filter.finalDate = finalDateTime;
    }

    this.visitService.getVisitsByRealState(this.realState.id, filter)
      .subscribe({
        next: (response: VisitResponse) => {
          this.visits = response.content;
          this.totalPages = response.totalPages;
          this.totalElements = response.totalElements;
          this.isLoading = false;
          console.log('Visitas filtradas cargadas:', response);
        },
        error: (error) => {
          console.error('Error aplicando filtros:', error);
          this.isLoading = false;
        }
      });
  }

  /**
   * CAMBIAR PÁGINA - Mantiene filtros activos
   */
  onPageChange(page: number): void {
    if (!this.realState?.id) return;
    
    console.log('Cambiando a página:', page);
    this.isLoading = true;
    this.currentPage = page;
    
    const filter: VisitFilter = {
      page: page,
      size: this.pageSize
    };

    // Mantener filtros activos si existen
    if (this.filterInitialDate.trim() !== '') {
      filter.initialDate = this.formatToLocalDateTime(this.filterInitialDate, this.filterInitialTime);
    }

    if (this.filterFinalDate.trim() !== '') {
      filter.finalDate = this.formatToLocalDateTime(this.filterFinalDate, this.filterFinalTime);
    }

    this.visitService.getVisitsByRealState(this.realState.id, filter)
      .subscribe({
        next: (response: VisitResponse) => {
          this.visits = response.content;
          this.totalPages = response.totalPages;
          this.totalElements = response.totalElements;
          this.isLoading = false;
          console.log('Nueva página cargada:', response);
        },
        error: (error) => {
          console.error('Error cambiando página:', error);
          this.isLoading = false;
        }
      });
  }

  /**
   * LIMPIAR FILTROS - Volver al estado inicial
   */
  clearFilters(): void {
    console.log('Limpiando filtros y volviendo al estado inicial');
    this.filterInitialDate = '';
    this.filterFinalDate = '';
    this.selectedVisit = null;
    this.filterInitialTime = '00:00';
    this.filterFinalTime = '23:59';
    
    // Cargar datos iniciales sin filtros
    this.loadInitialVisits();
  }

  /**
   * EVENTOS DE FILTROS - Ejecutar cuando el usuario cambia fechas
   */
  onInitialDateChange(): void {
    console.log('Fecha inicial cambiada:', this.filterInitialDate);
    if (this.filterInitialDate.trim() !== '') {
      this.applyFilters();
    }
  }

  onInitialTimeChange(): void {
    console.log('Hora inicial cambiada:', this.filterInitialTime);
    if (this.filterInitialDate.trim() !== '') {
      this.applyFilters();
    }
  }

  onFinalTimeChange(): void {
    console.log('Hora final cambiada:', this.filterFinalTime);
    if (this.filterFinalDate.trim() !== '') {
      this.applyFilters();
    }
  }

  onFinalDateChange(): void {
    console.log('Fecha final cambiada:', this.filterFinalDate);
    if (this.filterFinalDate.trim() !== '') {
      this.applyFilters();
    }
  }

  /**
   * APLICAR FILTROS MANUALMENTE - Si ambas fechas están llenas
   */
  onApplyFilters(): void {
    this.applyFilters();
  }

  /**
   * Seleccionar/deseleccionar visita
   */
  onVisitSelected(visit: Schedule): void {
    const visitDate = new Date(visit.initialDate);
    const now = new Date();
    
    if (visitDate > now) {
      this.selectedVisit = this.selectedVisit?.id === visit.id ? null : visit;
      console.log('Visita seleccionada:', this.selectedVisit);
    }
  }

  /**
   * Verificar si una visita está seleccionada
   */
  isVisitSelected(visit: Schedule): boolean {
    return this.selectedVisit?.id === visit.id;
  }

  /**
   * Verificar si una visita está deshabilitada
   */
  isVisitDisabled(visit: Schedule): boolean {
    const visitDate = new Date(visit.initialDate);
    const now = new Date();
    return visitDate <= now;
  }

  /**
   * Confirmar visita seleccionada
   */
  onConfirmVisit(): void {
    if (this.selectedVisit) {
      console.log('Confirmar visita:', this.selectedVisit);
      alert(`Visita confirmada para el ${new Date(this.selectedVisit.initialDate).toLocaleDateString('es-ES')}`);
    }
  }

  /**
   * Volver al home
   */
  goBack(): void {
    this.router.navigate(['/home']);
  }


}
