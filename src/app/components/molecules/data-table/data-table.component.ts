import { Component, Input,Output, EventEmitter } from '@angular/core';
import { TableColumn } from 'src/app/shared/models/TableColumn';

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
  
  onRowClick(item: any): void {
    this.rowClick.emit(item);
  }
  
  // Para obtener un valor de una propiedad anidada (ej: "user.name")
  getPropertyValue(obj: any, key: string): any {
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
}

