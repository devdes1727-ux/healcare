import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../services/toast.service';
import { ScheduleService } from '../../services/schedule.service';

@Component({
  selector: 'app-schedule-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="root">

      <!-- Page Header -->
      <div class="page-header">
        <div class="header-left">
          <p class="page-eyebrow">Doctor Dashboard</p>
          <h2 class="page-title">Weekly Schedule</h2>
          <p class="page-sub">Manage your availability slots for patient bookings</p>
        </div>
        <button class="add-btn" [class.open]="showAddForm" (click)="toggleAddSlotForm()">
          <span class="add-btn-icon">
            <svg *ngIf="!showAddForm" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <svg *ngIf="showAddForm" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </span>
          {{ showAddForm ? 'Close' : 'Add Slot' }}
        </button>
      </div>

      <!-- Add Slot Form -->
      <div class="form-panel" *ngIf="showAddForm">
        <div class="form-panel-inner">
          <h4 class="form-title">New Availability Slot</h4>
          <div class="form-row">
            <div class="form-field">
              <label class="field-label">Day of Week</label>
              <div class="select-wrap">
                <select [(ngModel)]="newSlot.availableDay" class="field-input">
                  <option *ngFor="let d of dayNames" [value]="d">{{ d }}</option>
                </select>
                <svg class="select-caret" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
            </div>
            <div class="form-field">
              <label class="field-label">Start Time</label>
              <input type="time" [(ngModel)]="newSlot.startTime" class="field-input">
            </div>
            <div class="form-field">
              <label class="field-label">End Time</label>
              <input type="time" [(ngModel)]="newSlot.endTime" class="field-input">
            </div>
            <div class="form-field form-action">
              <button class="save-btn" [disabled]="isSaving" (click)="saveSlot()">
                <span class="spin-ring" *ngIf="isSaving"></span>
                <svg *ngIf="!isSaving" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                {{ isSaving ? 'Saving…' : 'Save Slot' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div class="loading-wrap" *ngIf="loading">
        <div class="loading-ring"></div>
        <p class="loading-txt">Loading your schedule…</p>
      </div>

      <!-- Schedule Grid -->
      <div class="schedule-wrap" *ngIf="!loading">

        <!-- Stats bar -->
        <div class="stats-bar">
          <div class="stat-chip">
            <span class="sc-val">{{ totalSlots }}</span>
            <span class="sc-lbl">Total Slots</span>
          </div>
          <div class="stat-chip">
            <span class="sc-val">{{ activeDays }}</span>
            <span class="sc-lbl">Active Days</span>
          </div>
          <div class="stat-chip">
            <span class="sc-val">{{ totalHours }}h</span>
            <span class="sc-lbl">Weekly Hours</span>
          </div>
        </div>

        <!-- Day columns -->
        <div class="days-grid">
          <div *ngFor="let day of days" class="day-col" [class.has-slots]="day.slots.length > 0">

            <div class="day-head">
              <div class="day-name-wrap">
                <span class="day-abbr">{{ day.name.substring(0,3).toUpperCase() }}</span>
                <span class="day-full">{{ day.name }}</span>
              </div>
              <span class="slot-count" *ngIf="day.slots.length > 0">{{ day.slots.length }}</span>
            </div>

            <div class="day-body">
              <div class="empty-day" *ngIf="day.slots.length === 0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span>No slots</span>
              </div>

              <div class="slots-list">
                <div *ngFor="let slot of day.slots" class="slot-pill">
                  <div class="slot-bar"></div>
                  <div class="slot-info">
                    <span class="slot-time">{{ formatTime(slot.start_time) }}</span>
                    <span class="slot-sep">→</span>
                    <span class="slot-time">{{ formatTime(slot.end_time) }}</span>
                  </div>
                  <button class="del-btn" title="Remove" (click)="confirmRemove(slot)">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>

    <!-- Delete Modal -->
    <div class="modal-overlay" *ngIf="slotToDelete" (click)="slotToDelete = null">
      <div class="modal-box" (click)="$event.stopPropagation()">
        <div class="modal-icon-wrap">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
        </div>
        <h3 class="modal-title">Remove Slot?</h3>
        <p class="modal-sub">You're about to remove the slot</p>
        <div class="modal-slot-preview">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          {{ formatTime(slotToDelete.start_time) }} – {{ formatTime(slotToDelete.end_time) }}
        </div>
        <p class="modal-warn">Patients won't be able to book this time anymore.</p>
        <div class="modal-actions">
          <button class="modal-cancel" (click)="slotToDelete = null">Cancel</button>
          <button class="modal-confirm" (click)="deleteSlot()">Remove Slot</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

    :host {
      --bg: #F0F4FF;
      --surface: #FFFFFF;
      --border: #E2E8F6;
      --primary: #3B5BDB;
      --primary-dark: #2F4AC0;
      --primary-light: #EEF2FF;
      --primary-glow: rgba(59,91,219,0.15);
      --text: #0F1B3D;
      --muted: #64748B;
      --green: #10B981;
      --red: #EF4444;
      --red-light: #FEF2F2;
      --shadow-sm: 0 1px 3px rgba(0,0,0,0.06);
      --shadow-md: 0 4px 16px rgba(0,0,0,0.08);
      font-family: 'DM Sans', sans-serif;
      display: block;
      background: var(--bg);
      min-height: 100vh;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }

    .root { max-width: 1200px; margin: 0 auto; padding: 36px 24px 64px; }

    /* Header */
    .page-header { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 28px; gap: 16px; flex-wrap: wrap; }
    .page-eyebrow { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; color: var(--primary); margin-bottom: 6px; }
    .page-title { font-family: 'Sora', sans-serif; font-size: 1.9rem; font-weight: 800; color: var(--text); letter-spacing: -0.5px; }
    .page-sub { font-size: 0.875rem; color: var(--muted); margin-top: 4px; }

    .add-btn {
      display: flex; align-items: center; gap: 8px;
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      color: white; border: none; border-radius: 14px;
      padding: 13px 22px; font-family: 'Sora', sans-serif;
      font-size: 0.875rem; font-weight: 700; cursor: pointer;
      transition: all 0.2s; box-shadow: 0 6px 20px var(--primary-glow);
      white-space: nowrap;
    }
    .add-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(59,91,219,0.25); }
    .add-btn.open { background: #1E293B; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
    .add-btn-icon { display: flex; }

    /* Form Panel */
    .form-panel {
      background: var(--surface); border-radius: 20px;
      border: 1.5px solid var(--primary); box-shadow: 0 0 0 4px var(--primary-light);
      margin-bottom: 28px; overflow: hidden;
      animation: slideDown 0.25s ease;
    }
    .form-panel-inner { padding: 28px; }
    .form-title { font-family: 'Sora', sans-serif; font-size: 1rem; font-weight: 700; color: var(--text); margin-bottom: 20px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: 16px; align-items: end; }
    .form-field { display: flex; flex-direction: column; gap: 7px; }
    .field-label { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: var(--muted); }
    .select-wrap { position: relative; }
    .select-caret { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--muted); }
    .field-input {
      width: 100%; padding: 12px 14px; background: var(--bg);
      border: 1.5px solid var(--border); border-radius: 12px;
      font-family: 'DM Sans', sans-serif; font-size: 0.875rem; font-weight: 500;
      color: var(--text); transition: all 0.2s; outline: none;
      -webkit-appearance: none; appearance: none;
    }
    .field-input:focus { border-color: var(--primary); background: white; box-shadow: 0 0 0 3px var(--primary-light); }

    .form-action { justify-content: flex-end; }
    .save-btn {
      display: flex; align-items: center; gap: 8px; width: 100%;
      justify-content: center; background: var(--primary); color: white;
      border: none; border-radius: 12px; padding: 13px 20px;
      font-family: 'Sora', sans-serif; font-size: 0.875rem; font-weight: 700;
      cursor: pointer; transition: all 0.2s;
    }
    .save-btn:hover:not(:disabled) { background: var(--primary-dark); transform: translateY(-1px); }
    .save-btn:disabled { opacity: 0.6; cursor: not-allowed; }

    /* Loading */
    .loading-wrap { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 300px; gap: 16px; }
    .loading-ring { width: 44px; height: 44px; border-radius: 50%; border: 3px solid var(--border); border-top-color: var(--primary); animation: spin 0.9s linear infinite; }
    .loading-txt { font-size: 0.875rem; font-weight: 500; color: var(--muted); }

    /* Stats Bar */
    .stats-bar { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
    .stat-chip { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 14px 22px; display: flex; align-items: center; gap: 10px; box-shadow: var(--shadow-sm); }
    .sc-val { font-family: 'Sora', sans-serif; font-size: 1.2rem; font-weight: 800; color: var(--text); }
    .sc-lbl { font-size: 0.75rem; font-weight: 600; color: var(--muted); }

    /* Days Grid */
    .days-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 12px; }

    .day-col {
      background: var(--surface); border: 1.5px solid var(--border);
      border-radius: 20px; overflow: hidden;
      transition: all 0.2s; box-shadow: var(--shadow-sm);
    }
    .day-col.has-slots { border-color: #C7D2F5; box-shadow: 0 4px 16px rgba(59,91,219,0.07); }

    .day-head {
      padding: 14px 14px 12px;
      background: var(--bg); border-bottom: 1px solid var(--border);
      display: flex; align-items: center; justify-content: space-between;
    }
    .day-col.has-slots .day-head { background: var(--primary-light); border-bottom-color: #C7D2F5; }

    .day-name-wrap { display: flex; flex-direction: column; }
    .day-abbr { font-family: 'Sora', sans-serif; font-size: 0.8rem; font-weight: 800; color: var(--text); letter-spacing: 0.5px; }
    .day-full { font-size: 0.62rem; color: var(--muted); font-weight: 500; margin-top: 1px; }
    .day-col.has-slots .day-abbr { color: var(--primary); }

    .slot-count {
      background: var(--primary); color: white;
      font-family: 'Sora', sans-serif; font-size: 0.65rem; font-weight: 800;
      width: 20px; height: 20px; border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
    }

    .day-body { padding: 12px; min-height: 80px; display: flex; flex-direction: column; gap: 8px; }

    .empty-day { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; padding: 20px 8px; color: #CBD5E1; font-size: 0.7rem; font-weight: 600; text-align: center; }

    .slots-list { display: flex; flex-direction: column; gap: 7px; }

    .slot-pill {
      display: flex; align-items: center; gap: 8px;
      background: var(--bg); border: 1px solid var(--border);
      border-radius: 10px; padding: 8px 8px 8px 0;
      transition: all 0.2s;
    }
    .slot-pill:hover { border-color: #97ABEE; background: white; }

    .slot-bar { width: 3px; min-height: 32px; background: var(--primary); border-radius: 0 3px 3px 0; flex-shrink: 0; }

    .slot-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .slot-time { font-family: 'Sora', sans-serif; font-size: 0.72rem; font-weight: 700; color: var(--text); }
    .slot-sep { font-size: 0.6rem; color: var(--muted); }

    .del-btn {
      background: none; border: none; width: 22px; height: 22px;
      border-radius: 6px; cursor: pointer; display: flex;
      align-items: center; justify-content: center;
      color: #CBD5E1; transition: all 0.15s; flex-shrink: 0;
    }
    .del-btn:hover { background: var(--red-light); color: var(--red); }

    /* Modal */
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(15,27,61,0.55);
      backdrop-filter: blur(8px); z-index: 2000;
      display: flex; align-items: center; justify-content: center; padding: 24px;
      animation: fadeIn 0.2s ease;
    }
    .modal-box {
      background: var(--surface); border-radius: 24px;
      padding: 36px; width: 100%; max-width: 400px;
      box-shadow: 0 24px 60px rgba(0,0,0,0.2);
      animation: slideUp 0.25s ease;
      display: flex; flex-direction: column; align-items: center; text-align: center;
    }
    .modal-icon-wrap {
      width: 56px; height: 56px; background: var(--red-light); border-radius: 16px;
      display: flex; align-items: center; justify-content: center;
      color: var(--red); margin-bottom: 20px;
    }
    .modal-title { font-family: 'Sora', sans-serif; font-size: 1.2rem; font-weight: 800; color: var(--text); margin-bottom: 6px; }
    .modal-sub { font-size: 0.875rem; color: var(--muted); margin-bottom: 14px; }
    .modal-slot-preview {
      display: flex; align-items: center; gap: 8px;
      background: var(--primary-light); border: 1px solid #C7D2F5;
      color: var(--primary); border-radius: 10px;
      padding: 10px 16px; font-family: 'Sora', sans-serif;
      font-size: 0.875rem; font-weight: 700; margin-bottom: 14px;
    }
    .modal-warn { font-size: 0.8rem; color: var(--muted); margin-bottom: 28px; }
    .modal-actions { display: flex; gap: 12px; width: 100%; }
    .modal-cancel {
      flex: 1; padding: 13px; background: var(--bg); border: 1.5px solid var(--border);
      border-radius: 12px; font-family: 'Sora', sans-serif; font-size: 0.875rem;
      font-weight: 700; color: var(--text); cursor: pointer; transition: 0.2s;
    }
    .modal-cancel:hover { border-color: #97ABEE; }
    .modal-confirm {
      flex: 1; padding: 13px; background: var(--red); border: none;
      border-radius: 12px; font-family: 'Sora', sans-serif; font-size: 0.875rem;
      font-weight: 700; color: white; cursor: pointer; transition: 0.2s;
      box-shadow: 0 6px 16px rgba(239,68,68,0.25);
    }
    .modal-confirm:hover { background: #DC2626; transform: translateY(-1px); }

    .spin-ring {
      width: 16px; height: 16px; border-radius: 50%;
      border: 2px solid rgba(255,255,255,0.3); border-top-color: white;
      display: inline-block; animation: spin 0.8s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    @keyframes slideDown { from { transform: translateY(-10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

    @media (max-width: 1100px) { .days-grid { grid-template-columns: repeat(4, 1fr); } }
    @media (max-width: 700px) {
      .days-grid { grid-template-columns: repeat(2, 1fr); }
      .form-row { grid-template-columns: 1fr 1fr; }
      .form-action { grid-column: 1 / -1; }
    }
    @media (max-width: 480px) {
      .root { padding: 20px 12px 48px; }
      .days-grid { grid-template-columns: 1fr; }
      .form-row { grid-template-columns: 1fr; }
    }
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

  get totalSlots() { return this.days.reduce((a, d) => a + d.slots.length, 0); }
  get activeDays() { return this.days.filter(d => d.slots.length > 0).length; }
  get totalHours() {
    let mins = 0;
    this.days.forEach(d => d.slots.forEach((s: any) => {
      const [sh, sm] = s.start_time.split(':').map(Number);
      const [eh, em] = s.end_time.split(':').map(Number);
      mins += (eh * 60 + em) - (sh * 60 + sm);
    }));
    return Math.round(mins / 60 * 10) / 10;
  }

  constructor(
    private scheduleService: ScheduleService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) { this.initDays(); }

  ngOnInit() { this.loadSlots(); }

  initDays() { this.days = this.dayNames.map(name => ({ name, slots: [] })); }

  loadSlots() {
    this.loading = true;
    this.scheduleService.getMySlots().subscribe({
      next: (res: any[]) => {
        this.initDays();
        res.forEach(slot => {
          const day = this.days.find(d => d.name === slot.available_day);
          if (day) day.slots.push(slot);
        });
        this.days.forEach(d => d.slots.sort((a: any, b: any) => a.start_time.localeCompare(b.start_time)));
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.toastService.error('Failed to load schedule');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleAddSlotForm() { this.showAddForm = !this.showAddForm; }

  formatTime(time: string) {
    if (!time) return '';
    const [h, m] = time.split(':');
    const hNum = parseInt(h, 10);
    return `${hNum % 12 || 12}:${m} ${hNum >= 12 ? 'PM' : 'AM'}`;
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
        this.cdr.detectChanges();
      },
      error: () => {
        this.toastService.error('Could not save slot');
        this.isSaving = false;
        this.cdr.detectChanges();
      }
    });
  }

  confirmRemove(slot: any) { this.slotToDelete = slot; }

  deleteSlot() {
    if (!this.slotToDelete) return;
    this.scheduleService.deleteSlot(this.slotToDelete.id).subscribe({
      next: () => {
        this.toastService.success('Slot removed');
        this.slotToDelete = null;
        this.loadSlots();
      },
      error: () => this.toastService.error('Failed to delete slot')
    });
  }
}