import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { RealStateTableComponent } from './real-state-table.component';
import { RealStateService } from 'src/app/core/RealState/real-state.service';
import { Page } from 'src/app/shared/models/Page';
import { RealState } from 'src/app/shared/models/RealState';
import { RealStateFilter } from 'src/app/shared/models/RealStateFilter';
import { Component, Input } from '@angular/core';

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

describe('RealStateTableComponent', () => {
  let component: RealStateTableComponent;
  let fixture: ComponentFixture<RealStateTableComponent>;
  let mockRealStateService: jest.Mocked<RealStateService>;

  const mockRealStates: any[] = [
    { 
      id: 1, 
      name: 'Casa Moderna', 
      rooms: 3, 
      bathrooms: 2, 
      price: 250000,
      location: { city: { name: 'Bogotá' } },
      category: { name: 'Casa' }
    },
    { 
      id: 2, 
      name: 'Apartamento Centro', 
      rooms: 2, 
      bathrooms: 1, 
      price: 150000,
      location: { city: { name: 'Medellín' } },
      category: { name: 'Apartamento' }
    }
  ];

  const mockPageResponse: Page<RealState> = {
    content: mockRealStates,
    totalPages: 1,
    totalElements: 2,
    size: 10,
    number: 0,
    first: true,
    last: true,
    empty: false
  };

  beforeEach(() => {
    mockRealStateService = {
      getRealStates: jest.fn().mockReturnValue(of(mockPageResponse))
    } as unknown as jest.Mocked<RealStateService>;

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [
        RealStateTableComponent,
        MockDataTableComponent,
        MockPaginationComponent
      ],
      providers: [
        { provide: RealStateService, useValue: mockRealStateService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RealStateTableComponent);
    component = fixture.componentInstance;
    
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load real states on init', () => {
    component.ngOnInit();
    
    expect(mockRealStateService.getRealStates).toHaveBeenCalledWith(0, 10, false, {});
    expect(component.realStates).toEqual(mockRealStates);
    expect(component.totalPages).toBe(1);
    expect(component.totalElements).toBe(2);
    expect(component.loading).toBe(false);
  });

  it('should apply filters when loading real states', () => {
    component.filterForm.setValue({
      categoryName: 'Casa',
      bathrooms: 2,
      rooms: 3,
      locationName: 'Bogotá',
      minPrice: 200000,
      maxPrice: 300000
    });
    
    component.loadRealStates();
    
    const expectedFilters: RealStateFilter = {
      categoryName: 'Casa',
      bathrooms: 2,
      rooms: 3,
      locationName: 'Bogotá',
      minPrice: 200000,
      maxPrice: 300000
    };
    
    expect(mockRealStateService.getRealStates).toHaveBeenCalledWith(0, 10, false, expectedFilters);
  });

  it('should handle error when loading real states fails', () => {
    const errorResponse = new Error('Failed to load real states');
    mockRealStateService.getRealStates.mockReturnValueOnce(throwError(() => errorResponse));
    
    component.loadRealStates();
    
    expect(console.error).toHaveBeenCalledWith('Error al cargar categorías:', errorResponse);
    expect(component.loading).toBe(false);
  });

  it('should reset to first page when searching', () => {
    component.currentPage = 2;
    component.onSearch();
    
    expect(component.currentPage).toBe(0);
    expect(mockRealStateService.getRealStates).toHaveBeenCalled();
  });

  it('should update current page when page changes', () => {
    component.onPageChange(2);
    
    expect(component.currentPage).toBe(2);
    expect(mockRealStateService.getRealStates).toHaveBeenCalled();
  });

  it('should log selected real state when onRealStateSelect is called', () => {
    const selectedRealState = mockRealStates[0];
    
    component.onRealStateSelect(selectedRealState);
    
    expect(console.log).toHaveBeenCalledWith('Categoría seleccionada:', location);
  });

  it('should toggle sort order', () => {
    component.orderAsc = false;
    component.toggleSort();
    
    expect(component.orderAsc).toBe(true);
    expect(mockRealStateService.getRealStates).toHaveBeenCalled();
  });

  it('should clear filters', () => {
    component.filterForm.setValue({
      categoryName: 'Casa',
      bathrooms: 2,
      rooms: 3,
      locationName: 'Bogotá',
      minPrice: 200000,
      maxPrice: 300000
    });
    
    component.clearFilters();
    
    expect(component.filterForm.value).toEqual({
      categoryName: '',
      bathrooms: null,
      rooms: null,
      locationName: '',
      minPrice: null,
      maxPrice: null
    });
    
    expect(component.currentPage).toBe(0);
    expect(mockRealStateService.getRealStates).toHaveBeenCalled();
  });

  it('should toggle filters visibility', () => {
    component.showFilters = false;
    component.toggleFilters();
    
    expect(component.showFilters).toBe(true);
    
    component.toggleFilters();
    
    expect(component.showFilters).toBe(false);
  });
});
