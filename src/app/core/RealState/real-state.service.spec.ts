import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RealStateService } from './real-state.service';
import { RealState } from 'src/app/shared/models/RealState';
import { Page } from 'src/app/shared/models/Page';
import { RealStateFilter } from 'src/app/shared/models/RealStateFilter';

describe('RealStateService', () => {
  let service: RealStateService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:8080/api/v1/real-state';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RealStateService]
    });
    
    service = TestBed.inject(RealStateService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createRealState', () => {
    it('should create a new real state via POST', () => {
      const mockRealState: RealState = {
        name: 'Test Property',
        description: 'A test property description',
        rooms: 3,
        bathrooms: 2,
        price: 150000,
        locationId: 1,
        categoryId: 2,
        publishDate: '2025-05-30'
      };
      
      const mockResponse = {
        id: 1,
        name: 'Test Property',
        description: 'A test property description',
        rooms: 3,
        bathrooms: 2,
        price: 150000,
        locationId: 1,
        categoryId: 2,
        publishDate: '2025-05-30',
        status: 'available'
      };

      service.createRealState(mockRealState).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockRealState);
      
      req.flush(mockResponse);
    });

    it('should handle error when creating real state fails', () => {
      const mockRealState: RealState = {
        name: 'Test Property',
        description: 'A test property description',
        rooms: 3,
        bathrooms: 2,
        price: 150000,
        locationId: 1,
        categoryId: 2,
        publishDate: '2025-05-30'
      };

      service.createRealState(mockRealState).subscribe({
        next: () => fail('Expected an error, not a successful response'),
        error: error => {
          expect(error.status).toBe(400);
          expect(error.error.message).toBe('Invalid real state data');
        }
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      
      req.flush(
        { message: 'Invalid real state data' },
        { status: 400, statusText: 'Bad Request' }
      );
    });
  });

  describe('getRealStates', () => {
    it('should get real states with default parameters', () => {
      const mockPageResponse: Page<RealState> = {
        content: [
          {
            id: 1,
            name: 'Property 1',
            description: 'Description 1',
            rooms: 3,
            bathrooms: 2,
            price: 150000,
            locationId: 1,
            categoryId: 1,
            publishDate: '2025-05-30',
            status: 'available'
          },
          {
            id: 2,
            name: 'Property 2',
            description: 'Description 2',
            rooms: 2,
            bathrooms: 1,
            price: 120000,
            locationId: 2,
            categoryId: 2,
            publishDate: '2025-05-31',
            status: 'available'
          }
        ],
        totalPages: 1,
        totalElements: 2,
        size: 10,
        number: 0,
        first: true,
        last: true,
        empty: false
      };

      service.getRealStates().subscribe(response => {
        expect(response).toEqual(mockPageResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}?page=0&size=10&orderAsc=false`);
      expect(req.request.method).toBe('GET');
      
      req.flush(mockPageResponse);
    });

    it('should get real states with custom parameters', () => {
      const page = 2;
      const size = 5;
      const orderAsc = true;
      
      const mockPageResponse: Page<RealState> = {
        content: [
          {
            id: 11,
            name: 'Property 11',
            description: 'Description 11',
            rooms: 4,
            bathrooms: 3,
            price: 200000,
            locationId: 3,
            categoryId: 1,
            publishDate: '2025-06-01',
            status: 'available'
          },
          {
            id: 12,
            name: 'Property 12',
            description: 'Description 12',
            rooms: 3,
            bathrooms: 2,
            price: 180000,
            locationId: 1,
            categoryId: 2,
            publishDate: '2025-06-02',
            status: 'available'
          }
        ],
        totalPages: 3,
        totalElements: 12,
        size: 5,
        number: 2,
        first: false,
        last: false,
        empty: false
      };

      service.getRealStates(page, size, orderAsc).subscribe(response => {
        expect(response).toEqual(mockPageResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}?page=2&size=5&orderAsc=true`);
      expect(req.request.method).toBe('GET');
      
      req.flush(mockPageResponse);
    });

    it('should get real states with filters', () => {
      const filters: RealStateFilter = {
        categoryName: 'House',
        bathrooms: 2,
        rooms: 3,
        locationName: 'Downtown',
        minPrice: 100000,
        maxPrice: 200000
      };
      
      const mockPageResponse: Page<RealState> = {
        content: [
          {
            id: 5,
            name: 'Filtered Property',
            description: 'Filtered Description',
            rooms: 3,
            bathrooms: 2,
            price: 150000,
            locationId: 1,
            categoryId: 1,
            publishDate: '2025-06-05',
            status: 'available'
          }
        ],
        totalPages: 1,
        totalElements: 1,
        size: 10,
        number: 0,
        first: true,
        last: true,
        empty: false
      };

      service.getRealStates(0, 10, false, filters).subscribe(response => {
        expect(response).toEqual(mockPageResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}?page=0&size=10&orderAsc=false&categoryName=House&bathrooms=2&rooms=3&locationName=Downtown&minPrice=100000&maxPrice=200000`);
      expect(req.request.method).toBe('GET');
      
      req.flush(mockPageResponse);
    });

    it('should handle partial filters', () => {
      const filters: RealStateFilter = {
        rooms: 3,
        minPrice: 100000
      };
      
      const mockPageResponse: Page<RealState> = {
        content: [
          {
            id: 7,
            name: 'Partially Filtered Property',
            description: 'Partially Filtered Description',
            rooms: 3,
            bathrooms: 2,
            price: 150000,
            locationId: 1,
            categoryId: 1,
            publishDate: '2025-06-07',
            status: 'available'
          }
        ],
        totalPages: 1,
        totalElements: 1,
        size: 10,
        number: 0,
        first: true,
        last: true,
        empty: false
      };

      service.getRealStates(0, 10, false, filters).subscribe(response => {
        expect(response).toEqual(mockPageResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}?page=0&size=10&orderAsc=false&rooms=3&minPrice=100000`);
      expect(req.request.method).toBe('GET');
      
      req.flush(mockPageResponse);
    });

    it('should handle error when getting real states fails', () => {
      service.getRealStates().subscribe({
        next: () => fail('Expected an error, not a successful response'),
        error: error => {
          expect(error.status).toBe(500);
          expect(error.statusText).toBe('Internal Server Error');
        }
      });

      const req = httpMock.expectOne(`${apiUrl}?page=0&size=10&orderAsc=false`);
      expect(req.request.method).toBe('GET');
      
      req.flush('Server error', { 
        status: 500, 
        statusText: 'Internal Server Error' 
      });
    });
  });
});
