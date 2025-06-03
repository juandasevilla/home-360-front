import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SearchCriteria } from 'src/app/shared/models/SearchCriteria';

@Component({
  selector: 'app-search-bar-home',
  templateUrl: './search-bar-home.component.html',
  styleUrls: ['./search-bar-home.component.scss']
})
export class SearchBarHomeComponent {
  @Input() categories: any[] = [];
  @Input() isLoading: boolean = false;

  @Output() search = new EventEmitter<SearchCriteria>();

  selectedCategoryName?: string = '';
  locationName?: string = '';

  onSearch(): void {
    const criteria: SearchCriteria = {
      categoryName: this.selectedCategoryName,
      locationName: this.locationName
    };
    this.search.emit(criteria);
  }

  onCategoryChange(event: any): void {
    const value = event.target.value;
    this.selectedCategoryName = value ? value : undefined;
  }

  onLocationInputChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.locationName = inputElement.value;
    console.log('Location changed:', this.locationName);
  }

}
