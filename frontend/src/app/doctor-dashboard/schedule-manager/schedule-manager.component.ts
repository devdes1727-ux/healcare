import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../services/toast.service';
import { ScheduleService } from '../../services/schedule.service';

@Component({
  selector: 'app-schedule-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card p-8 shadow-md border-0">
      <div class="flex justify-between items-center mb-8 border-b pb-6">
        <div>
          <h3 class="m-0 text-xl font-bold">Weekly Consultation Schedule</h3>
          <p class="text-sm text-muted mt-2 m-0">Define your availability slots for patient bookings.</p>
        </div>
        <button class="btn btn-primary flex items-center gap-2 px-6" (click)="toggleAddSlotForm()">
          {{ showAddForm ? '✕ Close Form' : '＋ Add New Slot' }}
        </button>
      </div>

      <!-- Add Slot Form -->
      <div *ngIf="showAddForm" class="add-slot-form border rounded-2xl p-6 mb-8 bg-secondary-alpha animate-fade-in">
        <h4 class="m-0 mb-6 font-bold text-main">New Availability Slot</h4>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          <div class="form-group">
            <label>Select Work Day</label>
            <select [(ngModel)]="newSlot.availableDay" class="form-control">
              <option *ngFor="let d of dayNames" [value]="d">{{ d }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Start Time</label>
            <input type="time" [(ngModel)]="newSlot.startTime" class="form-control">
          </div>
          <div class="form-group">
            <label>End Time</label>
            <input type="time" [(ngModel)]="newSlot.endTime" class="form-control">
          </div>
          <div class="form-group">
            <button class="btn btn-primary w-full py-3" [disabled]="isSaving" (click)="saveSlot()">
              {{ isSaving ? 'Saving...' : 'Add Slot' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Schedule Display -->
      <div class="loading-state text-center py-12" *ngIf="loading">
        <div class="spinner mx-auto"></div>
        <p class="text-muted mt-4">Loading your schedule...</p>
      </div>

      <div class="schedule-grid" *ngIf="!loading">
        <div *ngFor="let day of days" class="day-group mb-6">
          <div class="day-header flex items-center justify-between mb-3 px-2">
            <h4 class="m-0 font-bold text-main flex items-center gap-2">
              {{ day.name }}
              <span class="count-badge" *ngIf="day.slots.length > 0">{{ day.slots.length }}</span>
            </h4>
          </div>
          
          <div class="slots-area p-5 border rounded-2xl bg-card hover-shadow transition-all min-h-24">
            <div *ngIf="day.slots.length === 0" class="text-center py-4 text-muted italic">
              No slots configured for {{ day.name }}.
            </div>
            
            <div class="flex gap-3 flex-wrap">
              <div *ngFor="let slot of day.slots" class="slot-item">
                <div class="slot-content">
                  <span class="time-range">{{ formatTime(slot.start_time) }} - {{ formatTime(slot.end_time) }}</span>
                  <button class="remove-btn" title="Remove slot" (click)="confirmRemove(slot)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <div class="modal-backdrop" *ngIf="slotToDelete" (click)="slotToDelete = null">
      <div class="modal-card" (click)="$event.stopPropagation()">
        <h3 class="m-0 mb-4 text-xl font-bold">Delete Slot?</h3>
        <p class="text-muted mb-8 italic">"{{formatTime(slotToDelete.start_time)}} - {{formatTime(slotToDelete.end_time)}}"</p>
        <p class="mb-8">Are you sure you want to remove this availability slot? Patients won't be able to book this time anymore.</p>
        <div class="flex gap-4">
          <button class="btn btn-outline flex-1" (click)="slotToDelete = null">Cancel</button>
          <button class="btn btn-danger flex-1" (click)="deleteSlot()">Confirm Delete</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .count-badge {
      background: var(--primary-color);
      color: white;
      font-size: 0.75rem;
      padding: 2px 8px;
      border-radius: 999px;
      font-weight: 800;
    }
    
    .slot-item {
      background: var(--bg-main);
      border: 1px solid var(--border-light);
      border-radius: 12px;
      padding: 0.5rem 0.5rem 0.5rem 1rem;
      transition: all 0.2s;
    }
    .slot-item:hover {
      border-color: var(--primary-color);
      transform: translateY(-2px);
      box-shadow: 0 4px 6px -1px var(--primary-alpha);
    }
    
    .slot-content {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    .time-range {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--text-main);
    }
    
    .remove-btn {
      background: rgba(239, 68, 68, 0.05);
      color: #ef4444;
      border: none;
      width: 24px;
      height: 24px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }
    .remove-btn:hover {
      background: #ef4444;
      color: white;
    }

    .form-control {
      background: var(--bg-card);
      border: 1px solid var(--border-light);
      padding: 0.75rem 1rem;
      border-radius: 10px;
      width: 100%;
      color: var(--text-main);
      font-family: inherit;
    }
    .form-group label {
      display: block;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--text-muted);
      margin-bottom: 0.5rem;
    }

    .modal-backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
      display: flex; align-items: center; justify-content: center; z-index: 2000;
    }
    .modal-card {
      background: var(--bg-card); padding: 2.5rem; border-radius: 24px; max-width: 400px; width: 90%;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
    }

    .animate-fade-in { animation: fadeIn 0.3s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class ScheduleManagerComponent implements OnInit {
  dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  days: any[] = [];
  loading = true;
  isSaving = false;
  showAddForm = false;
  newSlot = { availableDay: 'Monday', startTime: '', endTime: '' };
  slotToDelete: any = null;

  constructor(private scheduleService: ScheduleService, private toastService: ToastService) {
    this.initDays();
  }

  ngOnInit() {
    this.loadSlots();
  }

  initDays() {
    this.days = this.dayNames.map(name => ({ name, slots: [] }));
  }

  loadSlots() {
    this.loading = true;
    this.scheduleService.getMySlots().subscribe({
      next: (res: any[]) => {
        this.initDays();
        res.forEach(slot => {
          const day = this.days.find(d => d.name === slot.available_day);
          if (day) day.slots.push(slot);
        });
        // Sort slots by time
        this.days.forEach(d => {
          d.slots.sort((a: any, b: any) => a.start_time.localeCompare(b.start_time));
        });
        this.loading = false;
      },
      error: () => {
        this.toastService.error('Failed to load schedule');
        this.loading = false;
      }
    });
  }

  toggleAddSlotForm() {
    this.showAddForm = !this.showAddForm;
  }

  formatTime(time: string) {
    if (!time) return '';
    let [h, m] = time.split(':');
    let hNum = parseInt(h, 10);
    const ampm = hNum >= 12 ? 'PM' : 'AM';
    hNum = hNum % 12 || 12;
    return `${hNum || 12}:${m} ${ampm}`;
  }

  saveSlot() {
    if (!this.newSlot.startTime || !this.newSlot.endTime) {
      this.toastService.error('Please specify both start and end times');
      return;
    }

    if (this.newSlot.startTime >= this.newSlot.endTime) {
      this.toastService.error('Start time must be earlier than end time');
      return;
    }

    this.isSaving = true;
    this.scheduleService.createSlot(this.newSlot).subscribe({
      next: () => {
        this.toastService.success('Slot added successfully');
        this.isSaving = false;
        this.showAddForm = false;
        this.newSlot = { availableDay: 'Monday', startTime: '', endTime: '' };
        this.loadSlots();
      },
      error: () => {
        this.toastService.error('Could not save slot');
        this.isSaving = false;
      }
    });
  }

  confirmRemove(slot: any) {
    this.slotToDelete = slot;
  }

  deleteSlot() {
    if (!this.slotToDelete) return;

    this.scheduleService.deleteSlot(this.slotToDelete.id).subscribe({
      next: () => {
        this.toastService.success('Slot successfully removed');
        this.slotToDelete = null;
        this.loadSlots();
      },
      error: () => this.toastService.error('Failed to delete slot')
    });
  }
}
