import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { VisitService } from './visit.service';
import { Schedule } from 'src/app/shared/models/Schedule';

describe('VisitService', () => {
  let service: VisitService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:8080/api/v1/schedule';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [VisitService]
    });
    
    service = TestBed.inject(VisitService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create a schedule via POST', () => {
    const mockScheduleData: Schedule = {
      initialDate: '2025-06-10T14:00:00',
      finalDate: '2025-06-10T15:00:00',
      realStateId: 1,
      userId: 2
    };
    
    const mockResponse = {
      id: 1,
      initialDate: '2025-06-10T14:00:00',
      finalDate: '2025-06-10T15:00:00',
      realStateId: 1,
      userId: 2,
      status: 'PENDING'
    };

    service.createSchedule(mockScheduleData).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockScheduleData);
    
    req.flush(mockResponse);
  });

  it('should handle error when creating schedule fails', () => {
    const mockScheduleData: Schedule = {
      initialDate: '2025-06-10T14:00:00',
      finalDate: '2025-06-10T15:00:00',
      realStateId: 1,
      userId: 2
    };
    
    const mockError = { 
      status: 400, 
      statusText: 'Bad Request',
      error: { message: 'Invalid schedule data' } 
    };

    service.createSchedule(mockScheduleData).subscribe({
      next: () => fail('Expected an error, not a successful response'),
      error: error => {
        expect(error.status).toBe(400);
        expect(error.error.message).toBe('Invalid schedule data');
      }
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    
    req.flush(mockError.error, mockError);
  });

  it('should handle server error when creating schedule', () => {
    const mockScheduleData: Schedule = {
      initialDate: '2025-06-10T14:00:00',
      finalDate: '2025-06-10T15:00:00',
      realStateId: 1,
      userId: 2
    };

    service.createSchedule(mockScheduleData).subscribe({
      next: () => fail('Expected an error, not a successful response'),
      error: error => {
        expect(error.status).toBe(500);
        expect(error.statusText).toBe('Internal Server Error');
      }
    });

    const req = httpMock.expectOne(apiUrl);
    
    req.flush('Server error', { 
      status: 500, 
      statusText: 'Internal Server Error' 
    });
  });
});