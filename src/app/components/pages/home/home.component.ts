import { Component } from '@angular/core';
import { RealState } from 'src/app/shared/models/RealState';
import { RealStateService } from 'src/app/core/RealState/real-state.service';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup } from '@angular/forms';
import { RealStateFilter } from 'src/app/shared/models/RealStateFilter';
import { CategoryServiceService } from 'src/app/core/category/category-service.service';
import { Category } from 'src/app/shared/models/Category';
import { SearchCriteria } from 'src/app/shared/models/SearchCriteria';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  realStates: RealState[] = [];
  categories: Category[] = [];
  isLoading: boolean = false;

  constructor(
    private realStateService: RealStateService, 
    private fb: FormBuilder,
    private categoryService: CategoryServiceService
  ) {}

  ngOnInit(): void {
    this.loadRealStates();
    this.loadCategories();
  }

  loadRealStates(): void {
    this.realStateService.getRealStates(0,50).subscribe({
      next: (response) => {
        this.realStates = response.content;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error loading real states:', error);
      }
    })
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (response) => {
        this.categories = response.content;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  onSearch(criteria: SearchCriteria ): void {
    this.realStateService.getRealStates(0,50, false, criteria).subscribe({
      next: (response) => {
        this.realStates = response.content;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error searching real states:', error);
      }
    });
  }
}
