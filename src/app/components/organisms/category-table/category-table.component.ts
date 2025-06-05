import { Component, OnInit } from '@angular/core';
import { Category } from 'src/app/shared/models/Category';
import { TableColumn } from 'src/app/shared/models/TableColumn';
import { CategoryServiceService } from 'src/app/core/category/category-service.service';
import { Page } from 'src/app/shared/models/Page';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-category-table',
  templateUrl: './category-table.component.html',
  styleUrls: ['./category-table.component.scss']
})
export class CategoryTableComponent {
  columns: TableColumn[] = [
    { key: 'id', header: 'ID', width: '80px' },
    { key: 'name', header: 'Nombre', width: '25%' },
    { key: 'description', header: 'Descripción' },
    { key: 'actions', header: 'Acciones'}, 
  ];
  
  categories: Category[] = [];
  loading: boolean = false;
  currentPage: number = 0;
  totalPages: number = 0;
  totalElements: number = 0;
  pageSize: number = 10;
  
  constructor(private categoryService: CategoryServiceService,
              private toastr: ToastrService
  ) {}
  
  ngOnInit(): void {
    this.loadCategories();
  }
  
  loadCategories(): void {
    this.loading = true;
    
    this.categoryService.getCategories(this.currentPage, this.pageSize).subscribe({
      next: (response: Page<Category>) => {
        this.categories = response.content;
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
        this.loading = false;
      },
      error: (error) => {
        
        this.loading = false;
      }
    });
  }
  
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadCategories();
  }
  
  onCategorySelect(category: Category): void {
    // Aquí podrías implementar la edición o vista detalle
  }

  onDeleteCategory(category: Category): void {
    if (confirm(`¿Estás seguro de que deseas eliminar la categoría "${category.name}"?`)) {
      this.categoryService.deleteCategory(category.id!).subscribe({
        next: () => {
          this.toastr.success('Categoría eliminada correctamente');
          this.loadCategories();
        },
        error: (error) => {
          this.toastr.error('Error al eliminar la categoría');
        }
      });
    }
  }
  onEditCategory(category: Category): void {
    console.log('Edit category:', category);
  }
}

