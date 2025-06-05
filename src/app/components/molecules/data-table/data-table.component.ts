import { Component, Input,Output, EventEmitter } from '@angular/core';
import { TableColumn } from 'src/app/shared/models/TableColumn';
import { faTrash, faEdit } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() loading: boolean = false;
  @Input() emptyMessage: string = 'No hay datos disponibles';
  
  @Output() rowClick = new EventEmitter<any>();
  @Output() deleteClick = new EventEmitter<any>();
  @Output() editClick = new EventEmitter<any>();

  faTrash = faTrash; 
  faEdit = faEdit;
  
  onRowClick(item: any): void {
    this.rowClick.emit(item);
  }
  
  // Para obtener un valor de una propiedad anidada (ej: "user.name")
  getPropertyValue(obj: any, key: string): any {
    if (key === 'actions') {
      return null; // No se muestra valor para la columna de acciones
    }

    const properties = key.split('.');
    let value = obj;
    
    for (const prop of properties) {
      if (value === null || value === undefined) {
        return '';
      }
      value = value[prop];
    }
    
    return value;
  }

  //new functions to crud
  onDeleteClick(item: any, event: Event): void {
    event.stopPropagation(); 
    this.deleteClick.emit(item);
  }

  isActionsColumn(columnKey: string): boolean {
    return columnKey === 'actions';
  }

  onEditClick(item: any, event: Event): void {
    event.stopPropagation(); 
    this.editClick.emit(item);
  }

}

