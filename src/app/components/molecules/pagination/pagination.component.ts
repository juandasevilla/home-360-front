import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent implements OnChanges {
  @Input() currentPage: number = 0;
  @Input() totalPages: number = 0;
  @Input() totalElements: number = 0;
  @Input() pageSize: number = 20;
  @Input() loading: boolean = false;
  
  @Output() pageChange = new EventEmitter<number>();
  
  currentGroup: number = 0; // Grupo actual (0 = páginas 1-4, 1 = páginas 5-8, etc.)
  visiblePageButtons: number[] = [];
  Math = Math;
  
  ngOnInit(): void {
    this.updateVisibleButtons();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['totalPages'] || changes['currentPage']) {
      // Actualizar el grupo actual basado en la página actual
      this.currentGroup = Math.floor(this.currentPage / 4);
      this.updateVisibleButtons();
    }
  }
  
  updateVisibleButtons(): void {
    // Calcular las páginas visibles basadas en el grupo actual
    const startPage = this.currentGroup * 4;
    
    // Generar los botones de página para el grupo actual
    this.visiblePageButtons = [];
    for (let i = 0; i < 4 && startPage + i < this.totalPages; i++) {
      this.visiblePageButtons.push(startPage + i);
    }
  }
  
  // Navegar al grupo anterior
  previousGroup(): void {
    if (this.currentGroup > 0) {
      this.currentGroup--;
      this.updateVisibleButtons();
      // Navegar a la primera página del grupo
      this.changePage(this.visiblePageButtons[0]);
    }
  }
  
  // Navegar al grupo siguiente
  nextGroup(): void {
    if ((this.currentGroup + 1) * 4 < this.totalPages) {
      this.currentGroup++;
      this.updateVisibleButtons();
      // Navegar a la primera página del grupo
      this.changePage(this.visiblePageButtons[0]);
    }
  }
  
  changePage(page: number): void {
    if (page !== this.currentPage && !this.loading && page >= 0 && page < this.totalPages) {
      this.pageChange.emit(page);
    }
  }
}