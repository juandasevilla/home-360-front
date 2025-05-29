import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { LocationTableComponent } from './location-table.component';
import { LocationService } from 'src/app/core/location/location.service';
import { Page } from 'src/app/shared/models/Page';
import { Location } from 'src/app/shared/models/Location';
import { Component, Input } from '@angular/core';

// Mock components
@Component({
  selector: 'app-data-table',
  template: '<div></div>'
})
class MockDataTableComponent {
  @Input() columns: any[] = [];
  @Input() data: any[] = [];
  @Input() loading: boolean = false;
  @Input() emptyMessage: string = '';
}

@Component({
  selector: 'app-pagination',
  template: '<div></div>'
})
class MockPaginationComponent {
  @Input() currentPage: number = 0;
  @Input() totalPages: number = 0;
  @Input() totalElements: number = 0;
  @Input() pageSize: number = 10;
  @Input() loading: boolean = false;
}

describe('LocationTableComponent', () => {
  let component: LocationTableComponent;
  let fixture: ComponentFixture<LocationTableComponent>;
  let mockLocationService: jest.Mocked<LocationService>;

  const mockLocations: Location[] = [
    {
      id: 1,
      name: 'Centro',
      description: 'Zona céntrica',
      cityId: 1,
      city: {
        id: 1,
        name: 'Bogotá',
        department: {
          id: 1,
          name: 'Cundinamarca'
        }
      }
    },
    {
      id: 2,
      name: 'Norte',
      description: 'Zona norte',
      cityId: 2,
      city: {
        id: 2,
        name: 'Medellín',
        department: {
          id: 2,
          name: 'Antioquia'
        }
      }
    }
  ];

  const mockPage: Page<Location> = {
    content: mockLocations,
    totalPages: 1,
    totalElements: 2,
    size: 10,
    number: 0,
    first: true,
    last: true,
    empty: false
  };

  beforeEach(() => {
    // Create mock for LocationService
    mockLocationService = {
      getLocations: jest.fn().mockReturnValue(of(mockPage))
    } as unknown as jest.Mocked<LocationService>;

    TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [
        LocationTableComponent,
        MockDataTableComponent,
        MockPaginationComponent
      ],
      providers: [
        { provide: LocationService, useValue: mockLocationService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LocationTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load locations on init', () => {
    expect(mockLocationService.getLocations).toHaveBeenCalledWith(0, 10, false, '');
    expect(component.locations).toEqual(mockLocations);
    expect(component.totalPages).toBe(1);
    expect(component.totalElements).toBe(2);
    expect(component.loading).toBe(false);
  });

  it('should search locations when onSearch is called', () => {
    // Setup
    component.searchTerm = 'Centro';
    mockLocationService.getLocations.mockClear();

    // Execute
    component.onSearch();

    // Verify
    expect(component.currentPage).toBe(0); // Should reset to first page
    expect(mockLocationService.getLocations).toHaveBeenCalledWith(0, 10, false, 'Centro');
  });

  it('should change page when onPageChange is called', () => {
    // Setup
    const newPage = 2;
    mockLocationService.getLocations.mockClear();

    // Execute
    component.onPageChange(newPage);

    // Verify
    expect(component.currentPage).toBe(newPage);
    expect(mockLocationService.getLocations).toHaveBeenCalledWith(newPage, 10, false, '');
  });

  it('should log selected location when onCategorySelect is called', () => {
    // Setup
    const selectedLocation = mockLocations[0];
    const consoleSpy = jest.spyOn(console, 'log');

    // Execute
    component.onCategorySelect(selectedLocation);

    // Verify
    expect(consoleSpy).toHaveBeenCalledWith('Categoría seleccionada:', selectedLocation);
  });

  it('should handle error when loading locations fails', () => {
    // Setup
    const errorResponse = new Error('Failed to load locations');
    mockLocationService.getLocations.mockReturnValueOnce(throwError(() => errorResponse));
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    component.loading = true;

    // Execute
    component.loadCategories();

    // Verify
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error al cargar categorías:', errorResponse);
    expect(component.loading).toBe(false);
  });

  it('should have correct column configuration', () => {
    // Verify columns array
    expect(component.columns).toEqual([
      { key: 'id', header: 'ID', width: '80px' },
      { key: 'name', header: 'Nombre', width: '25%' },
      { key: 'description', header: 'Descripción' },
      { key: 'city.department.name', header: 'Departamento' },
      { key: 'city.name', header: 'Ciudad' },
    ]);
  });

  // Nota: también hay un error en el código que deberías corregir
  it('should rename method loadCategories to loadLocations for clarity', () => {
    // Este es solo un test sugerido, el método en realidad debería renombrarse en el componente
    expect(typeof component.loadCategories).toBe('function');
    // Idealmente, el método debería llamarse loadLocations en lugar de loadCategories
  });
});