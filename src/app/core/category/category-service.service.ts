import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from 'src/app/shared/models/Category';



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
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl);
  }
}
