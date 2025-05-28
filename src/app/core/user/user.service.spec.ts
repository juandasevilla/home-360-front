import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService } from './user.service';
import { User } from 'src/app/shared/models/User';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:8080/api/v1/user';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService]
    });
    
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verificar que no haya solicitudes pendientes
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createUser', () => {
    it('should create a new user via POST', () => {
      // Mock datos de usuario
      const newUser: User = {
        name: 'John',
        lastName: 'Doe',
        identification: 123456789,
        phone: '3001234567',
        birthDate: '1990-01-01',
        email: 'john.doe@example.com',
        password: 'password123',
        roleId: 2
      };
      
      // Mock respuesta del servidor
      const mockResponse = {
        id: 1,
        name: 'John',
        lastName: 'Doe',
        identification: 123456789,
        phone: '3001234567',
        birthDate: '1990-01-01',
        email: 'john.doe@example.com',
        roleId: 2
        // Nota: La respuesta no incluye password por seguridad
      };

      // Llamar al método del servicio
      service.createUser(newUser).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      // Interceptar la solicitud HTTP
      const req = httpMock.expectOne(apiUrl);
      
      // Verificar que fue una solicitud POST
      expect(req.request.method).toBe('POST');
      
      // Verificar el cuerpo de la solicitud
      expect(req.request.body).toEqual(newUser);
      
      // Simular respuesta exitosa
      req.flush(mockResponse);
    });

    it('should handle error when creating user fails', () => {
      // Mock datos de usuario
      const newUser: User = {
        name: 'John',
        lastName: 'Doe',
        identification: 123456789,
        phone: '3001234567',
        birthDate: '1990-01-01',
        email: 'john.doe@example.com',
        password: 'password123',
        roleId: 2
      };
      
      // Spy en console.error para evitar logs durante los tests
      jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Llamar al método del servicio
      service.createUser(newUser).subscribe({
        next: () => fail('Expected an error, not a successful response'),
        error: (error) => {
          expect(error.status).toBe(400);
          expect(error.statusText).toBe('Bad Request');
        }
      });

      // Interceptar la solicitud HTTP
      const req = httpMock.expectOne(apiUrl);
      
      // Verificar que fue una solicitud POST
      expect(req.request.method).toBe('POST');
      
      // Simular respuesta de error (por ejemplo, email duplicado)
      req.flush(
        { message: 'El correo electrónico ya está registrado' },
        { status: 400, statusText: 'Bad Request' }
      );
    });

    it('should handle server error when creating user', () => {
      // Mock datos de usuario
      const newUser: User = {
        name: 'John',
        lastName: 'Doe',
        identification: 123456789,
        phone: '3001234567',
        birthDate: '1990-01-01',
        email: 'john.doe@example.com',
        password: 'password123',
        roleId: 2
      };
      
      // Spy en console.error para evitar logs durante los tests
      jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Llamar al método del servicio
      service.createUser(newUser).subscribe({
        next: () => fail('Expected an error, not a successful response'),
        error: (error) => {
          expect(error.status).toBe(500);
          expect(error.statusText).toBe('Internal Server Error');
        }
      });

      // Interceptar la solicitud HTTP
      const req = httpMock.expectOne(apiUrl);
      
      // Simular error de servidor
      req.flush(
        'Server error',
        { status: 500, statusText: 'Internal Server Error' }
      );
    });
  });
});