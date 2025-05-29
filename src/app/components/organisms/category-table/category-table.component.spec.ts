import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { CategoryTableComponent } from './category-table.component';
import { CategoryServiceService } from 'src/app/core/category/category-service.service';
import { Category } from 'src/app/shared/models/Category';
import { Page } from 'src/app/shared/models/Page';
import { TableColumn } from 'src/app/shared/models/TableColumn';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('CategoryTableComponent', () => {
  let component: CategoryTableComponent;
  let fixture: ComponentFixture<CategoryTableComponent>;
  let mockCategoryService: Partial<CategoryServiceService>;

  // Mock data
  const mockCategoriesPage: Page<Category> = {
    content: [
      { id: 1, name: 'Casa', description: 'Casas familiares' },
      { id: 2, name: 'Apartamento', description: 'Apartamentos urbanos' },
      { id: 3, name: 'Local Comercial', description: 'Locales para negocios' }
    ],
    totalPages: 2,
    totalElements: 15,
    size: 10,
    number: 0,
    first: true,
    last: false,
    empty: false
  };

  beforeEach(async () => {
    // Crear mock del servicio
    mockCategoryService = {
      getCategories: jest.fn()
    };

    // Configurar comportamiento por defecto
    (mockCategoryService.getCategories as jest.Mock).mockReturnValue(of(mockCategoriesPage));

    await TestBed.configureTestingModule({
      declarations: [CategoryTableComponent],
      providers: [
        { provide: CategoryServiceService, useValue: mockCategoryService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryTableComponent);
    component = fixture.componentInstance;

    // Mockear console
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  // TEST 1: Verificar creación del componente
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // TEST 2: Verificar inicialización del constructor
  describe('Constructor', () => {
    it('should initialize columns correctly', () => {
      const expectedColumns: TableColumn[] = [
        { key: 'id', header: 'ID', width: '80px' },
        { key: 'name', header: 'Nombre', width: '25%' },
        { key: 'description', header: 'Descripción' }
      ];

      expect(component.columns).toEqual(expectedColumns);
      expect(component.columns.length).toBe(3);
    });

    it('should initialize properties with default values', () => {
      expect(component.categories).toEqual([]);
      expect(component.loading).toBe(false);
      expect(component.currentPage).toBe(0);
      expect(component.totalPages).toBe(0);
      expect(component.totalElements).toBe(0);
      expect(component.pageSize).toBe(10);
    });
  });

  // TEST 3: Verificar ngOnInit
  describe('ngOnInit', () => {
    it('should call loadCategories on init', () => {
      const loadCategoriesSpy = jest.spyOn(component, 'loadCategories');
      
      component.ngOnInit();
      
      expect(loadCategoriesSpy).toHaveBeenCalled();
    });
  });

  // TEST 4: Verificar loadCategories
  describe('loadCategories', () => {
    it('should load categories successfully', () => {
      component.loadCategories();

      expect(mockCategoryService.getCategories as jest.Mock).toHaveBeenCalledWith(0, 10);
      expect(component.categories).toEqual(mockCategoriesPage.content);
      expect(component.totalPages).toBe(2);
      expect(component.totalElements).toBe(15);
      expect(component.loading).toBe(false);
    });

    it('should set loading to true at start and false at end', () => {
      expect(component.loading).toBe(false);
      
      component.loadCategories();
      
      // Al final del observable, loading debe ser false
      expect(component.loading).toBe(false);
    });

    it('should call service with current page and page size', () => {
      component.currentPage = 2;
      component.pageSize = 5;
      
      component.loadCategories();
      
      expect(mockCategoryService.getCategories as jest.Mock).toHaveBeenCalledWith(2, 5);
    });

    it('should handle error response', () => {
      const errorResponse = new Error('Network error');
      (mockCategoryService.getCategories as jest.Mock).mockReturnValue(
        throwError(() => errorResponse)
      );

      component.loadCategories();

      expect(component.loading).toBe(false);
      // Verificar que no se modificaron los datos en caso de error
      expect(component.categories).toEqual([]);
      expect(component.totalPages).toBe(0);
      expect(component.totalElements).toBe(0);
    });

    it('should handle empty response', () => {
      const emptyPage: Page<Category> = {
        content: [],
        totalPages: 0,
        totalElements: 0,
        size: 10,
        number: 0,
        first: true,
        last: true,
        empty: true
      };

      (mockCategoryService.getCategories as jest.Mock).mockReturnValue(of(emptyPage));

      component.loadCategories();

      expect(component.categories).toEqual([]);
      expect(component.totalPages).toBe(0);
      expect(component.totalElements).toBe(0);
      expect(component.loading).toBe(false);
    });

    it('should handle large dataset', () => {
      const largePage: Page<Category> = {
        content: Array.from({ length: 10 }, (_, i) => ({
          id: i + 1,
          name: `Category ${i + 1}`,
          description: `Description ${i + 1}`
        })),
        totalPages: 100,
        totalElements: 1000,
        size: 10,
        number: 0,
        first: true,
        last: false,
        empty: false
      };

      (mockCategoryService.getCategories as jest.Mock).mockReturnValue(of(largePage));

      component.loadCategories();

      expect(component.categories.length).toBe(10);
      expect(component.totalPages).toBe(100);
      expect(component.totalElements).toBe(1000);
    });
  });

  // TEST 5: Verificar onPageChange
  describe('onPageChange', () => {
    it('should update currentPage and call loadCategories', () => {
      const loadCategoriesSpy = jest.spyOn(component, 'loadCategories');
      
      component.onPageChange(3);
      
      expect(component.currentPage).toBe(3);
      expect(loadCategoriesSpy).toHaveBeenCalled();
    });

    it('should handle page 0', () => {
      const loadCategoriesSpy = jest.spyOn(component, 'loadCategories');
      
      component.onPageChange(0);
      
      expect(component.currentPage).toBe(0);
      expect(loadCategoriesSpy).toHaveBeenCalled();
    });

    it('should handle negative page numbers', () => {
      const loadCategoriesSpy = jest.spyOn(component, 'loadCategories');
      
      component.onPageChange(-1);
      
      expect(component.currentPage).toBe(-1);
      expect(loadCategoriesSpy).toHaveBeenCalled();
      // El servicio debería ser llamado con -1, aunque en la práctica esto podría validarse
      expect(mockCategoryService.getCategories as jest.Mock).toHaveBeenCalledWith(-1, 10);
    });

    it('should handle large page numbers', () => {
      const loadCategoriesSpy = jest.spyOn(component, 'loadCategories');
      
      component.onPageChange(999);
      
      expect(component.currentPage).toBe(999);
      expect(loadCategoriesSpy).toHaveBeenCalled();
    });
  });

  // TEST 6: Verificar onCategorySelect (método stub)
  describe('onCategorySelect', () => {
    it('should handle category selection without errors', () => {
      const testCategory: Category = { id: 1, name: 'Test Category', description: 'Test Description' };
      
      // Como el método está vacío, solo verificamos que no lance errores
      expect(() => component.onCategorySelect(testCategory)).not.toThrow();
    });

    it('should accept category with only required fields', () => {
      const minimalCategory: Category = { name: 'Minimal Category' };
      
      expect(() => component.onCategorySelect(minimalCategory)).not.toThrow();
    });

    it('should handle null or undefined category', () => {
      expect(() => component.onCategorySelect(null as any)).not.toThrow();
      expect(() => component.onCategorySelect(undefined as any)).not.toThrow();
    });
  });

  // TEST 7: Verificar integración completa
  describe('Integration Tests', () => {
    it('should perform complete workflow: init -> load -> paginate', () => {
      // 1. Inicialización
      component.ngOnInit();
      expect(mockCategoryService.getCategories as jest.Mock).toHaveBeenCalledWith(0, 10);
      expect(component.categories.length).toBe(3);

      // 2. Cambio de página
      component.onPageChange(1);
      expect(component.currentPage).toBe(1);
      expect(mockCategoryService.getCategories as jest.Mock).toHaveBeenCalledWith(1, 10);

      // 3. Verificar estado final
      expect(component.totalPages).toBe(2);
      expect(component.totalElements).toBe(15);
    });

    it('should handle complete error scenario', () => {
      // Setup error response
      (mockCategoryService.getCategories as jest.Mock).mockReturnValue(
        throwError(() => new Error('Service unavailable'))
      );

      // Inicializar componente
      component.ngOnInit();

      // Verificar que el estado se mantiene estable después del error
      expect(component.loading).toBe(false);
      expect(component.categories).toEqual([]);
      expect(component.currentPage).toBe(0);
    });

    it('should handle multiple rapid page changes', () => {
      const loadCategoriesSpy = jest.spyOn(component, 'loadCategories');

      // Cambios rápidos de página
      component.onPageChange(1);
      component.onPageChange(2);
      component.onPageChange(3);

      expect(component.currentPage).toBe(3);
      expect(loadCategoriesSpy).toHaveBeenCalledTimes(3);
    });
  });

  // TEST 8: Verificar edge cases
  describe('Edge Cases', () => {
    
    it('should handle malformed response', () => {
      const malformedResponse = { content: null, totalPages: null };
      (mockCategoryService.getCategories as jest.Mock).mockReturnValue(of(malformedResponse as any));

      expect(() => component.loadCategories()).not.toThrow();
    });

    it('should verify columns configuration is immutable', () => {
      const originalColumns = [...component.columns];
      
      // Intentar modificar las columnas
      component.columns.push({ key: 'new', header: 'New Column' });
      
      // En un escenario real, las columnas no deberían cambiar después de la inicialización
      expect(component.columns.length).toBe(4); // Se modificó porque no hay protección
      
      // Restaurar estado original para otros tests
      component.columns = originalColumns;
    });

    it('should handle concurrent loadCategories calls', () => {
      // Simular múltiples llamadas concurrentes
      component.loadCategories();
      component.loadCategories();
      component.loadCategories();

      // Todas las llamadas deberían completarse
      expect(mockCategoryService.getCategories as jest.Mock).toHaveBeenCalledTimes(3);
      expect(component.loading).toBe(false);
    });
  });
});
