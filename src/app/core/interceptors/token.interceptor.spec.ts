import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { TokenInterceptor } from './token.interceptor';
import { AuthService } from '../auth/auth.service';

describe('TokenInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let mockAuthService: jest.Mocked<AuthService>;

  beforeEach(() => {
    mockAuthService = {
      getToken: jest.fn()
    } as unknown as jest.Mocked<AuthService>;

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: TokenInterceptor,
          multi: true
        },
        {
          provide: AuthService,
          useValue: mockAuthService
        }
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should add an Authorization header with Bearer token when token exists', () => {
    const testToken = 'test-token-123';
    mockAuthService.getToken.mockReturnValue(testToken);

    httpClient.get('/api/test').subscribe();

    const httpRequest = httpMock.expectOne('/api/test');
    expect(httpRequest.request.headers.has('Authorization')).toBeTruthy();
    expect(httpRequest.request.headers.get('Authorization')).toBe(`Bearer ${testToken}`);
  });

  it('should not add an Authorization header when token does not exist', () => {
    mockAuthService.getToken.mockReturnValue(null);

    httpClient.get('/api/test').subscribe();

    const httpRequest = httpMock.expectOne('/api/test');
    expect(httpRequest.request.headers.has('Authorization')).toBeFalsy();
  });

  it('should pass the request to the next handler', () => {
    const testToken = 'test-token-123';
    mockAuthService.getToken.mockReturnValue(testToken);

    const testData = { message: 'Test response' };
    
    httpClient.get('/api/test').subscribe(response => {
      expect(response).toEqual(testData);
    });

    const httpRequest = httpMock.expectOne('/api/test');
    httpRequest.flush(testData);
  });

  it('should handle requests with existing headers', () => {
    const testToken = 'test-token-123';
    mockAuthService.getToken.mockReturnValue(testToken);

    httpClient.get('/api/test', {
      headers: {
        'Content-Type': 'application/json',
        'X-Custom-Header': 'custom-value'
      }
    }).subscribe();

    const httpRequest = httpMock.expectOne('/api/test');
    
    // Verificar que se agregó el token de autorización
    expect(httpRequest.request.headers.has('Authorization')).toBeTruthy();
    expect(httpRequest.request.headers.get('Authorization')).toBe(`Bearer ${testToken}`);
    
    // Verificar que se mantuvieron los headers existentes
    expect(httpRequest.request.headers.has('Content-Type')).toBeTruthy();
    expect(httpRequest.request.headers.get('Content-Type')).toBe('application/json');
    expect(httpRequest.request.headers.has('X-Custom-Header')).toBeTruthy();
    expect(httpRequest.request.headers.get('X-Custom-Header')).toBe('custom-value');
  });

  it('should work with different HTTP methods', () => {
    const testToken = 'test-token-123';
    mockAuthService.getToken.mockReturnValue(testToken);
    const testData = { id: 1, name: 'Test' };

    // Test POST
    httpClient.post('/api/test', testData).subscribe();
    
    let httpRequest = httpMock.expectOne('/api/test');
    expect(httpRequest.request.method).toBe('POST');
    expect(httpRequest.request.headers.has('Authorization')).toBeTruthy();
    expect(httpRequest.request.body).toEqual(testData);
    httpRequest.flush({});

    // Test PUT
    httpClient.put('/api/test/1', testData).subscribe();
    
    httpRequest = httpMock.expectOne('/api/test/1');
    expect(httpRequest.request.method).toBe('PUT');
    expect(httpRequest.request.headers.has('Authorization')).toBeTruthy();
    expect(httpRequest.request.body).toEqual(testData);
    httpRequest.flush({});

    // Test DELETE
    httpClient.delete('/api/test/1').subscribe();
    
    httpRequest = httpMock.expectOne('/api/test/1');
    expect(httpRequest.request.method).toBe('DELETE');
    expect(httpRequest.request.headers.has('Authorization')).toBeTruthy();
    httpRequest.flush({});
  });
});
