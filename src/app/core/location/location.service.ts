import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Location } from 'src/app/shared/models/Location';
import { City } from 'src/app/shared/models/City';
import { Department } from 'src/app/shared/models/Department';
import { Page } from 'src/app/shared/models/Page';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private locationApiUrl = 'http://localhost:8080/api/v1/location';
  private cityApiUrl = 'http://localhost:8080/api/v1/city';
  private departmentApiUrl = 'http://localhost:8080/api/v1/department';

  constructor(private http: HttpClient) { }

  // Método para crear una nueva ubicación (POST)
  createLocation(location: Location): Observable<Location> {
    return this.http.post<Location>(this.locationApiUrl, location);
  }
  
  // Método para obtener ubicaciones paginadas
  getLocations(page: number = 0, size: number = 10, orderAsc: boolean = false): Observable<Page<Location>> {
    const paginationUrl = `${this.locationApiUrl}/page`;
    
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('orderAsc', orderAsc.toString());
      
    return this.http.get<Page<Location>>(paginationUrl, { params });
  }

  // Método para obtener departamentos paginados
  getDepartments(page: number = 0, size: number = 50, orderAsc: boolean = true): Observable<Page<Department>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('orderAsc', orderAsc.toString());
      
    return this.http.get<Page<Department>>(this.departmentApiUrl, { params });
  }

  // Método para obtener ciudades paginadas
  getCities(page: number = 0, size: number = 50, orderAsc: boolean = true): Observable<Page<City>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('orderAsc', orderAsc.toString());
      
    return this.http.get<Page<City>>(this.cityApiUrl, { params });
  }
}

