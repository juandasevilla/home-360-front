import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DataTableComponent } from './data-table.component';
import { TableColumn } from 'src/app/shared/models/TableColumn';

describe('DataTableComponent', () => {
  let component: DataTableComponent;
  let fixture: ComponentFixture<DataTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DataTableComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DataTableComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default values', () => {
    expect(component.columns).toEqual([]);
    expect(component.data).toEqual([]);
    expect(component.loading).toBe(false);
    expect(component.emptyMessage).toBe('No hay datos disponibles');
  });

  describe('getPropertyValue method', () => {
    it('should return value for simple property', () => {
      const obj = { name: 'Test Name' };
      expect(component.getPropertyValue(obj, 'name')).toBe('Test Name');
    });

    it('should return value for nested property', () => {
      const obj = { user: { name: 'John', address: { city: 'New York' } } };
      expect(component.getPropertyValue(obj, 'user.name')).toBe('John');
      expect(component.getPropertyValue(obj, 'user.address.city')).toBe('New York');
    });

    it('should return empty string when property not found', () => {
      const obj = { name: 'Test' };
      expect(component.getPropertyValue(obj, 'age')).toBe('');
    });

    it('should return empty string when accessing nested property on null', () => {
      const obj = { user: null };
      expect(component.getPropertyValue(obj, 'user.name')).toBe('');
    });

    it('should return empty string when accessing nested property on undefined', () => {
      const obj = {};
      expect(component.getPropertyValue(obj, 'user.name')).toBe('');
    });
  });

  describe('rowClick event', () => {
    it('should emit clicked row data', () => {
      const rowData = { id: 1, name: 'Test Row' };
      const spy = jest.spyOn(component.rowClick, 'emit');
      
      component.onRowClick(rowData);
      
      expect(spy).toHaveBeenCalledWith(rowData);
    });
  });

  describe('render table', () => {
    it('should render table headers correctly', () => {
      // Configure test data
      component.columns = [
        { key: 'id', header: 'ID', width: '80px' },
        { key: 'name', header: 'Name' }
      ];
      fixture.detectChanges();

      // Verify headers
      const headers = fixture.debugElement.queryAll(By.css('th'));
      expect(headers.length).toBe(2);
      expect(headers[0].nativeElement.textContent.trim()).toBe('ID');
      expect(headers[1].nativeElement.textContent.trim()).toBe('Name');
      expect(headers[0].nativeElement.style.width).toBe('80px');
      expect(headers[1].nativeElement.style.width).toBe('auto');
    });

    it('should render table rows with correct data', () => {
      // Configure test data
      component.columns = [
        { key: 'id', header: 'ID' },
        { key: 'name', header: 'Name' }
      ];
      component.data = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' }
      ];
      fixture.detectChanges();

      // Verify rows
      const rows = fixture.debugElement.queryAll(By.css('tbody tr'));
      expect(rows.length).toBe(2);
      
      // Check first row
      const firstRowCells = rows[0].queryAll(By.css('td'));
      expect(firstRowCells[0].nativeElement.textContent.trim()).toBe('1');
      expect(firstRowCells[1].nativeElement.textContent.trim()).toBe('Item 1');
      
      // Check second row
      const secondRowCells = rows[1].queryAll(By.css('td'));
      expect(secondRowCells[0].nativeElement.textContent.trim()).toBe('2');
      expect(secondRowCells[1].nativeElement.textContent.trim()).toBe('Item 2');
    });

    it('should render nested property values correctly', () => {
      // Configure test data
      component.columns = [
        { key: 'id', header: 'ID' },
        { key: 'user.name', header: 'User Name' }
      ];
      component.data = [
        { id: 1, user: { name: 'John Doe' } }
      ];
      fixture.detectChanges();

      // Verify nested property
      const cells = fixture.debugElement.query(By.css('tbody tr')).queryAll(By.css('td'));
      expect(cells[1].nativeElement.textContent.trim()).toBe('John Doe');
    });

    it('should show loading spinner when loading is true', () => {
      component.columns = [{ key: 'id', header: 'ID' }];
      component.loading = true;
      fixture.detectChanges();

      const loadingElement = fixture.debugElement.query(By.css('.data-table__loading'));
      expect(loadingElement).toBeTruthy();
      expect(loadingElement.nativeElement.textContent).toContain('Cargando');
    });

    it('should trigger rowClick when a row is clicked', () => {
      // Set up data
      component.columns = [{ key: 'id', header: 'ID' }];
      component.data = [{ id: 1 }];
      fixture.detectChanges();
      
      // Spy on the event
      const spy = jest.spyOn(component.rowClick, 'emit');
      
      // Click the row
      const row = fixture.debugElement.query(By.css('tbody tr'));
      row.triggerEventHandler('click', null);
      
      // Verify the event was emitted with the correct data
      expect(spy).toHaveBeenCalledWith({ id: 1 });
    });
  });
});