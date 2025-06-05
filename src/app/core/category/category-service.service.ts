import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from 'src/app/shared/models/Category';
import { Page } from 'src/app/shared/models/Page';
import { HttpParams } from '@angular/common/http';



@Injectable({
  providedIn: 'root'
})
export class CategoryServiceService {
  // URL base para las APIs de categorías
  private apiUrl = 'http://localhost:8080/api/v1/category';

  constructor(private http: HttpClient) { }

  // Método para crear una nueva categoría (POST)
  createCategory(category: Category): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, category);
  }
  
  // Si quieres agregar también el GET para listar categorías
  getCategories(page: number = 0, size: number = 10, orderAsc: boolean = false): Observable<Page<Category>> {
    // URL corregida con "/page" agregado para la paginación
    const paginationUrl = `${this.apiUrl}/page`;
    
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('orderAsc', orderAsc.toString());
      
    console.log('Consultando categorías con URL:', paginationUrl);
    return this.http.get<Page<Category>>(paginationUrl, { params });
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

