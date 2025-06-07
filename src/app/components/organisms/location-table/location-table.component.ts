import { Component } from '@angular/core';
import { TableColumn } from 'src/app/shared/models/TableColumn';
import { Page } from 'src/app/shared/models/Page';
import { Location } from 'src/app/shared/models/Location';
import { LocationService } from 'src/app/core/location/location.service';

@Component({
  selector: 'app-location-table',
  templateUrl: './location-table.component.html',
  styleUrls: ['./location-table.component.scss']
})
export class LocationTableComponent {
  columns: TableColumn[] = [
      { key: 'id', header: 'ID', width: '80px' },
      { key: 'name', header: 'Nombre', width: '25%' },
      { key: 'description', header: 'Descripción' },
      { key: 'city.department.name', header: 'Departamento' },
      { key: 'city.name', header: 'Ciudad' },
    ];
    
    locations: Location[] = [];
    loading: boolean = false;
    currentPage: number = 0;
    totalPages: number = 0;
    totalElements: number = 0;
    pageSize: number = 10;
    searchTerm: string = '';
    
    constructor(private locationService: LocationService) {}
    
    ngOnInit(): void {
      this.loadCategories();
    }
    
    loadCategories(): void {
      this.loading = true;
      
      this.locationService.getLocations(this.currentPage, this.pageSize, false, this.searchTerm).subscribe({
        next: (response: Page<Location>) => {
          this.locations = response.content;
          this.totalPages = response.totalPages;
          this.totalElements = response.totalElements;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar categorías:', error);
          this.loading = false;
        }
      });
    }

    onSearch(): void {
    this.currentPage = 0; 
    this.loadCategories();
    }
    
    onPageChange(page: number): void {
      this.currentPage = page;
      this.loadCategories();
    }
    
    onCategorySelect(location: Location): void {
      console.log('Categoría seleccionada:', location);    
    }
}


