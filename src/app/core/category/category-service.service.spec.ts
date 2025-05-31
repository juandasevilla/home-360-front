import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CategoryServiceService } from './category-service.service';
import { Category } from 'src/app/shared/models/Category';
import { Page } from 'src/app/shared/models/Page';

describe('CategoryServiceService', () => {
  let service: CategoryServiceService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:8080/api/v1/category';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CategoryServiceService]
    });
    
    service = TestBed.inject(CategoryServiceService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verificar que no haya solicitudes pendientes
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createCategory', () => {
    it('should send a POST request with the category data', () => {
      const mockCategory: Category = {
        name: 'Test Category',
        description: 'Test Description'
      };

      const mockResponse: Category = {
        id: 1,
        name: 'Test Category',
        description: 'Test Description'
      };

      // Llamar al método del servicio
      service.createCategory(mockCategory).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      // Interceptar la solicitud HTTP
      const req = httpMock.expectOne(apiUrl);
      
      // Verificar que fue una solicitud POST
      expect(req.request.method).toBe('POST');
      
      // Verificar que se enviaron los datos correctos
      expect(req.request.body).toEqual(mockCategory);
      
      // Responder con datos mock
      req.flush(mockResponse);
    });
  });

  describe('getCategories', () => {
    it('should send a GET request with default pagination parameters', () => {
      const mockPageResponse: Page<Category> = {
        content: [
          { id: 1, name: 'Category 1', description: 'Description 1' },
          { id: 2, name: 'Category 2', description: 'Description 2' }
        ],
        totalPages: 1,
        totalElements: 2,
        size: 10,
        number: 0,
        first: true,
        last: true,
        empty: false
      };

      // Llamar al método del servicio sin parámetros (usa valores por defecto)
      service.getCategories().subscribe(response => {
        expect(response).toEqual(mockPageResponse);
      });

      // Interceptar la solicitud HTTP
      const req = httpMock.expectOne(`${apiUrl}/page?page=0&size=10&orderAsc=false`);
      
      // Verificar que fue una solicitud GET
      expect(req.request.method).toBe('GET');
      
      // Verificar los parámetros de consulta
      expect(req.request.params.get('page')).toBe('0');
      expect(req.request.params.get('size')).toBe('10');
      expect(req.request.params.get('orderAsc')).toBe('false');
      
      // Responder con datos mock
      req.flush(mockPageResponse);
    });

    it('should send a GET request with custom pagination parameters', () => {
      const customPage = 2;
      const customSize = 5;
      const customOrderAsc = true;
      
      const mockPageResponse: Page<Category> = {
        content: [
          { id: 6, name: 'Category 6', description: 'Description 6' },
          { id: 7, name: 'Category 7', description: 'Description 7' }
        ],
        totalPages: 3,
        totalElements: 12,
        size: customSize,
        number: customPage,
        first: false,
        last: false,
        empty: false
      };

      // Llamar al método del servicio con parámetros personalizados
      service.getCategories(customPage, customSize, customOrderAsc).subscribe(response => {
        expect(response).toEqual(mockPageResponse);
      });

      // Interceptar la solicitud HTTP
      const req = httpMock.expectOne(`${apiUrl}/page?page=2&size=5&orderAsc=true`);
      
      // Verificar que fue una solicitud GET
      expect(req.request.method).toBe('GET');
      
      // Verificar los parámetros de consulta
      expect(req.request.params.get('page')).toBe('2');
      expect(req.request.params.get('size')).toBe('5');
      expect(req.request.params.get('orderAsc')).toBe('true');
      
      // Responder con datos mock
      req.flush(mockPageResponse);
    });

    it('should handle errors when the API request fails', () => {
      // Spy en console.error para evitar mensajes de error en la consola durante las pruebas
      jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Llamar al método del servicio
      let errorResponse: any;
      service.getCategories().subscribe(
        () => fail('Expected an error, not categories'),
        error => {
          errorResponse = error;
        }
      );

      // Interceptar la solicitud HTTP
      const req = httpMock.expectOne(`${apiUrl}/page?page=0&size=10&orderAsc=false`);
      
      // Simular un error de servidor
      req.flush('Server error', { 
        status: 500, 
        statusText: 'Internal Server Error' 
      });
      
      // Verificar que el error se manejó correctamente
      expect(errorResponse.status).toBe(500);
    });
  });
});
