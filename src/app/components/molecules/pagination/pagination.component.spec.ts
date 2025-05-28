import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { By } from '@angular/platform-browser';
import { PaginationComponent } from './pagination.component';

// Mock del componente Button para evitar dependencias
@Component({
  selector: 'app-button',
  template: '<button [disabled]="disabled" (click)="buttonClick.emit()">{{ text }}</button>'
})
class MockButtonComponent {
  @Input() text: string = '';
  @Input() buttonStyle: string = '';
  @Input() disabled: boolean = false;
  @Output() buttonClick = new EventEmitter<void>();
}

describe('PaginationComponent', () => {
  let component: PaginationComponent;
  let fixture: ComponentFixture<PaginationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PaginationComponent, MockButtonComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PaginationComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default values', () => {
    expect(component.currentPage).toBe(0);
    expect(component.totalPages).toBe(0);
    expect(component.totalElements).toBe(0);
    expect(component.pageSize).toBe(20);
    expect(component.loading).toBe(false);
    expect(component.currentGroup).toBe(0);
    expect(component.visiblePageButtons).toEqual([]);
  });

  it('should calculate visible buttons correctly', () => {
    // Configurar 10 páginas totales
    component.totalPages = 10;
    component.currentPage = 0;
    component.updateVisibleButtons();
    
    // Debería mostrar las primeras 4 páginas (0-3)
    expect(component.visiblePageButtons).toEqual([0, 1, 2, 3]);
    
    // Cambiar a la página 5 (segundo grupo)
    component.currentPage = 5;
    component.currentGroup = 1;
    component.updateVisibleButtons();
    
    // Debería mostrar las páginas 4-7
    expect(component.visiblePageButtons).toEqual([4, 5, 6, 7]);
    
    // Último grupo incompleto
    component.currentPage = 8;
    component.currentGroup = 2;
    component.updateVisibleButtons();
    
    // Debería mostrar las páginas 8-9 (solo 2 páginas disponibles)
    expect(component.visiblePageButtons).toEqual([8, 9]);
  });

  it('should update currentGroup in ngOnChanges', () => {
    component.totalPages = 10;
    
    // Cambiar a la página 6 (debería estar en el grupo 1)
    component.currentPage = 6;
    component.ngOnChanges({
      currentPage: { 
        previousValue: 0, 
        currentValue: 6, 
        firstChange: false,
        isFirstChange: () => false
      }
    });
    
    expect(component.currentGroup).toBe(1);
    expect(component.visiblePageButtons).toEqual([4, 5, 6, 7]);
  });

  it('should navigate to previous group', () => {
    // Configurar grupo actual como 2
    component.totalPages = 12;
    component.currentPage = 8;
    component.currentGroup = 2;
    component.updateVisibleButtons();
    
    // Spy en pageChange y changePage
    const pageChangeSpy = jest.spyOn(component.pageChange, 'emit');
    const changePageSpy = jest.spyOn(component, 'changePage');
    
    // Navegar al grupo anterior
    component.previousGroup();
    
    // Verificar que cambió al grupo 1
    expect(component.currentGroup).toBe(1);
    expect(component.visiblePageButtons).toEqual([4, 5, 6, 7]);
    
    // Verificar que se llamó a changePage con la página 4
    expect(changePageSpy).toHaveBeenCalledWith(4);
  });

  it('should not navigate to previous group when in first group', () => {
    // Configurar primer grupo
    component.totalPages = 10;
    component.currentPage = 1;
    component.currentGroup = 0;
    component.updateVisibleButtons();
    
    // Spy en changePage
    const changePageSpy = jest.spyOn(component, 'changePage');
    
    // Intentar navegar al grupo anterior
    component.previousGroup();
    
    // Verificar que no cambió de grupo
    expect(component.currentGroup).toBe(0);
    
    // Verificar que no se llamó a changePage
    expect(changePageSpy).not.toHaveBeenCalled();
  });

  it('should navigate to next group', () => {
    // Configurar grupo actual como 0
    component.totalPages = 10;
    component.currentPage = 1;
    component.currentGroup = 0;
    component.updateVisibleButtons();
    
    // Spy en changePage
    const changePageSpy = jest.spyOn(component, 'changePage');
    
    // Navegar al grupo siguiente
    component.nextGroup();
    
    // Verificar que cambió al grupo 1
    expect(component.currentGroup).toBe(1);
    expect(component.visiblePageButtons).toEqual([4, 5, 6, 7]);
    
    // Verificar que se llamó a changePage con la página 4
    expect(changePageSpy).toHaveBeenCalledWith(4);
  });

  it('should not navigate to next group when in last group', () => {
    // Configurar último grupo
    component.totalPages = 10;
    component.currentPage = 9;
    component.currentGroup = 2;
    component.updateVisibleButtons();
    
    // Spy en changePage
    const changePageSpy = jest.spyOn(component, 'changePage');
    
    // Intentar navegar al grupo siguiente
    component.nextGroup();
    
    // Verificar que no cambió de grupo
    expect(component.currentGroup).toBe(2);
    
    // Verificar que no se llamó a changePage
    expect(changePageSpy).not.toHaveBeenCalled();
  });

  it('should emit pageChange event when changing page', () => {
    // Configurar componente
    component.totalPages = 10;
    component.currentPage = 0;
    
    // Spy en pageChange
    const pageChangeSpy = jest.spyOn(component.pageChange, 'emit');
    
    // Cambiar a la página 3
    component.changePage(3);
    
    // Verificar que se emitió el evento con la página 3
    expect(pageChangeSpy).toHaveBeenCalledWith(3);
  });

  it('should not emit pageChange when clicking on current page', () => {
    // Configurar componente
    component.totalPages = 10;
    component.currentPage = 2;
    
    // Spy en pageChange
    const pageChangeSpy = jest.spyOn(component.pageChange, 'emit');
    
    // Intentar cambiar a la misma página
    component.changePage(2);
    
    // Verificar que no se emitió el evento
    expect(pageChangeSpy).not.toHaveBeenCalled();
  });

  it('should not emit pageChange when loading', () => {
    // Configurar componente
    component.totalPages = 10;
    component.currentPage = 2;
    component.loading = true;
    
    // Spy en pageChange
    const pageChangeSpy = jest.spyOn(component.pageChange, 'emit');
    
    // Intentar cambiar de página
    component.changePage(3);
    
    // Verificar que no se emitió el evento
    expect(pageChangeSpy).not.toHaveBeenCalled();
  });

  it('should not emit pageChange for invalid page numbers', () => {
    // Configurar componente
    component.totalPages = 10;
    component.currentPage = 2;
    
    // Spy en pageChange
    const pageChangeSpy = jest.spyOn(component.pageChange, 'emit');
    
    // Intentar cambiar a página negativa
    component.changePage(-1);
    
    // Verificar que no se emitió el evento
    expect(pageChangeSpy).not.toHaveBeenCalled();
    
    // Intentar cambiar a página fuera de rango
    component.changePage(10);
    
    // Verificar que no se emitió el evento
    expect(pageChangeSpy).not.toHaveBeenCalled();
  });

  it('should render pagination controls correctly', () => {
    // Configurar componente
    component.totalPages = 10;
    component.currentPage = 4;
    component.updateVisibleButtons();
    fixture.detectChanges();
    
    // Verificar que se renderizan los botones correctos
    const buttons = fixture.debugElement.queryAll(By.css('app-button'));
    
    // Debería haber 6 botones: 1 para anterior, 4 para páginas y 1 para siguiente
    expect(buttons.length).toBe(6);
    
    // El primer botón es "Anterior"
    expect(buttons[0].componentInstance.text).toBe('<');
    
    // Los siguientes 4 botones son las páginas 4-7
    expect(buttons[1].componentInstance.text).toBe('5'); // Página 4 + 1
    expect(buttons[2].componentInstance.text).toBe('6'); // Página 5 + 1
    expect(buttons[3].componentInstance.text).toBe('7'); // Página 6 + 1
    expect(buttons[4].componentInstance.text).toBe('8'); // Página 7 + 1
    
    // El último botón es "Siguiente"
    expect(buttons[5].componentInstance.text).toBe('>');
  });

  it('should not render pagination when totalPages <= 1', () => {
    // Configurar componente con solo 1 página
    component.totalPages = 1;
    fixture.detectChanges();
    
    // Verificar que no se renderiza nada
    const paginationElement = fixture.debugElement.query(By.css('.pagination'));
    expect(paginationElement).toBeFalsy();
  });
});
