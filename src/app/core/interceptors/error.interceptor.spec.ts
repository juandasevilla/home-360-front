import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ErrorInterceptor } from './error.interceptor';
import { AuthService } from '../auth/auth.service';

describe('ErrorInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let mockAuthService: jest.Mocked<AuthService>;
  let mockRouter: jest.Mocked<Router>;

  beforeEach(() => {
    mockAuthService = {
      logout: jest.fn()
    } as unknown as jest.Mocked<AuthService>;

    mockRouter = {
      navigate: jest.fn()
    } as unknown as jest.Mocked<Router>;

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: ErrorInterceptor,
          multi: true
        },
        {
          provide: AuthService,
          useValue: mockAuthService
        },
        {
          provide: Router,
          useValue: mockRouter
        }
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should pass through non-error responses', () => {
    const testData = { message: 'Test response' };
    
    httpClient.get('/api/test').subscribe(response => {
      expect(response).toEqual(testData);
    });

    const httpRequest = httpMock.expectOne('/api/test');
    httpRequest.flush(testData);
  });

  it('should handle 401 Unauthorized error', () => {
    httpClient.get('/api/test').subscribe({
      next: () => fail('Expected an error, not a successful response'),
      error: error => {
        expect(error.status).toBe(401);
      }
    });

    const httpRequest = httpMock.expectOne('/api/test');
    httpRequest.flush('Unauthorized', { 
      status: 401, 
      statusText: 'Unauthorized' 
    });

    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should handle 403 Forbidden error', () => {
    httpClient.get('/api/test').subscribe({
      next: () => fail('Expected an error, not a successful response'),
      error: error => {
        expect(error.status).toBe(403);
      }
    });

    const httpRequest = httpMock.expectOne('/api/test');
    httpRequest.flush('Forbidden', { 
      status: 403, 
      statusText: 'Forbidden' 
    });

    expect(mockAuthService.logout).not.toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/forbidden']);
  });

  it('should pass through other errors', () => {
    httpClient.get('/api/test').subscribe({
      next: () => fail('Expected an error, not a successful response'),
      error: error => {
        expect(error.status).toBe(500);
      }
    });

    const httpRequest = httpMock.expectOne('/api/test');
    httpRequest.flush('Internal Server Error', { 
      status: 500, 
      statusText: 'Internal Server Error' 
    });

    expect(mockAuthService.logout).not.toHaveBeenCalled();
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should work with different HTTP methods', () => {
    // POST request
    httpClient.post('/api/test', {}).subscribe({
      next: () => fail('Expected an error, not a successful response'),
      error: error => {
        expect(error.status).toBe(401);
      }
    });

    let httpRequest = httpMock.expectOne('/api/test');
    expect(httpRequest.request.method).toBe('POST');
    httpRequest.flush('Unauthorized', { 
      status: 401, 
      statusText: 'Unauthorized' 
    });

    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);

    // Resetear los mocks para el siguiente test
    jest.clearAllMocks();

    // PUT request
    httpClient.put('/api/test/1', {}).subscribe({
      next: () => fail('Expected an error, not a successful response'),
      error: error => {
        expect(error.status).toBe(403);
      }
    });

    httpRequest = httpMock.expectOne('/api/test/1');
    expect(httpRequest.request.method).toBe('PUT');
    httpRequest.flush('Forbidden', { 
      status: 403, 
      statusText: 'Forbidden' 
    });

    expect(mockAuthService.logout).not.toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/forbidden']);
  });
});