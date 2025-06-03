import { Component, Input } from '@angular/core';
import { EventEmitter, Output } from '@angular/core';
import { Schedule } from 'src/app/shared/models/Schedule';

@Component({
  selector: 'app-visit-card',
  templateUrl: './visit-card.component.html',
  styleUrls: ['./visit-card.component.scss']
})
export class VisitCardComponent {
  @Input() visit!: Schedule;
  @Input() isSelected: boolean = false;
  @Input() disabled: boolean = false;
  
  @Output() visitSelected = new EventEmitter<Schedule>();

  onSelectVisit(): void {
    if (!this.disabled) {
      this.visitSelected.emit(this.visit);
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getDuration(): string {
    const start = new Date(this.visit.initialDate);
    const end = new Date(this.visit.finalDate);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0 && diffMinutes > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    } else if (diffHours > 0) {
      return `${diffHours}h`;
    } else {
      return `${diffMinutes}m`;
    }
  }

  getDateStatus(): 'today' | 'tomorrow' | 'future' | 'past' {
    const visitDate = new Date(this.visit.initialDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Normalizar fechas para comparar solo días
    const visitDateOnly = new Date(visitDate.getFullYear(), visitDate.getMonth(), visitDate.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const tomorrowOnly = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());

    if (visitDateOnly < todayOnly) return 'past';
    if (visitDateOnly.getTime() === todayOnly.getTime()) return 'today';
    if (visitDateOnly.getTime() === tomorrowOnly.getTime()) return 'tomorrow';
    return 'future';
  }
}
