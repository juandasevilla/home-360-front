import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LocationService } from './location.service';
import { Location } from 'src/app/shared/models/Location';
import { City } from 'src/app/shared/models/City';
import { Department } from 'src/app/shared/models/Department';
import { Page } from 'src/app/shared/models/Page';

describe('LocationService', () => {
  let service: LocationService;
  let httpMock: HttpTestingController;
  
  // URLs de API
  const locationApiUrl = 'http://localhost:8080/api/v1/location';
  const cityApiUrl = 'http://localhost:8080/api/v1/city';
  const departmentApiUrl = 'http://localhost:8080/api/v1/department';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [LocationService]
    });
    
    service = TestBed.inject(LocationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verificar que no haya solicitudes pendientes
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createLocation', () => {
    it('should create a new location via POST', () => {
      // Mock datos de entrada y respuesta
      const newLocation: Location = {
        name: 'Test Location',
        description: 'Test Description',
        cityId: 101
      };
      
      const createdLocation: Location = {
        id: 1,
        name: 'Test Location',
        description: 'Test Description',
        cityId: 101
      };

      // Llamar al método del servicio
      service.createLocation(newLocation).subscribe(response => {
        expect(response).toEqual(createdLocation);
      });

      // Interceptar la solicitud HTTP
      const req = httpMock.expectOne(locationApiUrl);
      
      // Verificar que fue una solicitud POST
      expect(req.request.method).toBe('POST');
      
      // Verificar el cuerpo de la solicitud
      expect(req.request.body).toEqual(newLocation);
      
      // Simular respuesta exitosa
      req.flush(createdLocation);
    });
  });

  describe('getLocations', () => {
    it('should get locations with default parameters', () => {
      // Mock respuesta paginada
      const mockLocations: Page<Location> = {
        content: [
          { id: 1, name: 'Location 1', description: 'Description 1', cityId: 1 },
          { id: 2, name: 'Location 2', description: 'Description 2', cityId: 2 }
        ],
        totalPages: 1,
        totalElements: 2,
        size: 10,
        number: 0,
        first: true,
        last: true,
        empty: false
      };

      // Llamar al método del servicio con parámetros por defecto
      service.getLocations().subscribe(response => {
        expect(response).toEqual(mockLocations);
      });

      // Interceptar la solicitud HTTP
      const req = httpMock.expectOne(`${locationApiUrl}/page?page=0&size=10&orderAsc=false&name=`);
      
      // Verificar que fue una solicitud GET
      expect(req.request.method).toBe('GET');
      
      // Verificar parámetros
      expect(req.request.params.get('page')).toBe('0');
      expect(req.request.params.get('size')).toBe('10');
      expect(req.request.params.get('orderAsc')).toBe('false');
      expect(req.request.params.get('name')).toBe('');
      
      // Simular respuesta exitosa
      req.flush(mockLocations);
    });

    it('should get locations with custom parameters', () => {
      // Parámetros personalizados
      const page = 2;
      const size = 5;
      const orderAsc = true;
      const name = 'Test';
      
      // Mock respuesta paginada
      const mockLocations: Page<Location> = {
        content: [
          { id: 6, name: 'Test Location 1', description: 'Description 6', cityId: 6 },
          { id: 7, name: 'Test Location 2', description: 'Description 7', cityId: 7 }
        ],
        totalPages: 2,
        totalElements: 7,
        size: 5,
        number: 2,
        first: false,
        last: true,
        empty: false
      };

      // Llamar al método del servicio con parámetros personalizados
      service.getLocations(page, size, orderAsc, name).subscribe(response => {
        expect(response).toEqual(mockLocations);
      });

      // Interceptar la solicitud HTTP
      const req = httpMock.expectOne(`${locationApiUrl}/page?page=2&size=5&orderAsc=true&name=Test`);
      
      // Verificar que fue una solicitud GET
      expect(req.request.method).toBe('GET');
      
      // Verificar parámetros
      expect(req.request.params.get('page')).toBe('2');
      expect(req.request.params.get('size')).toBe('5');
      expect(req.request.params.get('orderAsc')).toBe('true');
      expect(req.request.params.get('name')).toBe('Test');
      
      // Simular respuesta exitosa
      req.flush(mockLocations);
    });
  });

  describe('getDepartments', () => {
    it('should get departments with default parameters', () => {
      // Mock respuesta paginada
      const mockDepartments: Page<Department> = {
        content: [
          { id: 1, name: 'Department 1' },
          { id: 2, name: 'Department 2' }
        ],
        totalPages: 1,
        totalElements: 2,
        size: 50,
        number: 0,
        first: true,
        last: true,
        empty: false
      };

      // Llamar al método del servicio con parámetros por defecto
      service.getDepartments().subscribe(response => {
        expect(response).toEqual(mockDepartments);
      });

      // Interceptar la solicitud HTTP
      const req = httpMock.expectOne(`${departmentApiUrl}?page=0&size=50&orderAsc=true`);
      
      // Verificar que fue una solicitud GET
      expect(req.request.method).toBe('GET');
      
      // Verificar parámetros
      expect(req.request.params.get('page')).toBe('0');
      expect(req.request.params.get('size')).toBe('50');
      expect(req.request.params.get('orderAsc')).toBe('true');
      
      // Simular respuesta exitosa
      req.flush(mockDepartments);
    });

    it('should get departments with custom parameters', () => {
      // Parámetros personalizados
      const page = 1;
      const size = 20;
      const orderAsc = false;
      
      // Mock respuesta paginada
      const mockDepartments: Page<Department> = {
        content: [
          { id: 3, name: 'Department 3' },
          { id: 4, name: 'Department 4' }
        ],
        totalPages: 2,
        totalElements: 4,
        size: 20,
        number: 1,
        first: false,
        last: true,
        empty: false
      };

      // Llamar al método del servicio con parámetros personalizados
      service.getDepartments(page, size, orderAsc).subscribe(response => {
        expect(response).toEqual(mockDepartments);
      });

      // Interceptar la solicitud HTTP
      const req = httpMock.expectOne(`${departmentApiUrl}?page=1&size=20&orderAsc=false`);
      
      // Verificar que fue una solicitud GET
      expect(req.request.method).toBe('GET');
      
      // Verificar parámetros
      expect(req.request.params.get('page')).toBe('1');
      expect(req.request.params.get('size')).toBe('20');
      expect(req.request.params.get('orderAsc')).toBe('false');
      
      // Simular respuesta exitosa
      req.flush(mockDepartments);
    });
  });

  describe('getCities', () => {
    it('should get cities with default parameters', () => {
      // Mock respuesta paginada
      const mockCities: Page<City> = {
        content: [
          { id: 1, name: 'City 1', department: { id: 1, name: 'Department 1' } },
          { id: 2, name: 'City 2', department: { id: 1, name: 'Department 1' } }
        ],
        totalPages: 1,
        totalElements: 2,
        size: 50,
        number: 0,
        first: true,
        last: true,
        empty: false
      };

      // Llamar al método del servicio con parámetros por defecto
      service.getCities().subscribe(response => {
        expect(response).toEqual(mockCities);
      });

      // Interceptar la solicitud HTTP
      const req = httpMock.expectOne(`${cityApiUrl}?page=0&size=50&orderAsc=true`);
      
      // Verificar que fue una solicitud GET
      expect(req.request.method).toBe('GET');
      
      // Verificar parámetros
      expect(req.request.params.get('page')).toBe('0');
      expect(req.request.params.get('size')).toBe('50');
      expect(req.request.params.get('orderAsc')).toBe('true');
      
      // Simular respuesta exitosa
      req.flush(mockCities);
    });

    it('should get cities with custom parameters', () => {
      // Parámetros personalizados
      const page = 1;
      const size = 20;
      const orderAsc = false;
      
      // Mock respuesta paginada
      const mockCities: Page<City> = {
        content: [
          { id: 3, name: 'City 3', department: { id: 2, name: 'Department 2' } },
          { id: 4, name: 'City 4', department: { id: 2, name: 'Department 2' } }
        ],
        totalPages: 2,
        totalElements: 4,
        size: 20,
        number: 1,
        first: false,
        last: true,
        empty: false
      };

      // Llamar al método del servicio con parámetros personalizados
      service.getCities(page, size, orderAsc).subscribe(response => {
        expect(response).toEqual(mockCities);
      });

      // Interceptar la solicitud HTTP
      const req = httpMock.expectOne(`${cityApiUrl}?page=1&size=20&orderAsc=false`);
      
      // Verificar que fue una solicitud GET
      expect(req.request.method).toBe('GET');
      
      // Verificar parámetros
      expect(req.request.params.get('page')).toBe('1');
      expect(req.request.params.get('size')).toBe('20');
      expect(req.request.params.get('orderAsc')).toBe('false');
      
      // Simular respuesta exitosa
      req.flush(mockCities);
    });
  });

  it('should handle HTTP errors', () => {
    // Spy en console.error para evitar mensajes de error en la consola durante las pruebas
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Llamar al método del servicio
    service.getLocations().subscribe({
      next: () => fail('Expected an error, not locations'),
      error: (error) => {
        expect(error.status).toBe(500);
        expect(error.statusText).toBe('Internal Server Error');
      }
    });

    // Interceptar la solicitud HTTP
    const req = httpMock.expectOne(`${locationApiUrl}/page?page=0&size=10&orderAsc=false&name=`);
    
    // Simular un error de servidor
    req.flush('Error loading locations', {
      status: 500,
      statusText: 'Internal Server Error'
    });
  });
});
