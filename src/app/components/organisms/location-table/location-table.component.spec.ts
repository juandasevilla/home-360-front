import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { LocationTableComponent } from './location-table.component';

// Mock del servicio en lugar de importarlo
const mockLocationService = {
  getLocations: jest.fn().mockReturnValue(of({
    content: [],
    totalElements: 0,
    totalPages: 0
  }))
};

// Importar LocationService falsamente para satisfacer el componente
jest.mock('src/app/core/location/location.service', () => ({
  LocationService: function() {
    return mockLocationService;
  }
}));

describe('LocationTableComponent', () => {
  let component: LocationTableComponent;
  let fixture: ComponentFixture<LocationTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LocationTableComponent],
      providers: [
        { provide: mockLocationService, useValue: mockLocationService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LocationTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});