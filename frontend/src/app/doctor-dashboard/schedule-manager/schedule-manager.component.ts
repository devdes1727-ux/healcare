import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../services/toast.service';
import { ScheduleService } from '../../services/schedule.service';
import { DoctorService } from '../../services/doctor.service';

@Component({
  selector: 'app-schedule-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],

  template: `
<div class="root">
  <div class="page-header">
    <div>
      <h2>Schedule & Leave Manager</h2>
      <p>Manage your availability and planned leaves</p>
    </div>
    <div class="header-btns">
      <button class="leave-btn" (click)="showLeaveForm = !showLeaveForm">Manage Leave</button>
      <button class="add-btn" (click)="toggleAddSlotForm()">{{ showAddForm ? 'Close' : 'Add Slot' }}</button>
    </div>
  </div>

  <!-- LEAVE MANAGEMENT PANEL -->
  <div class="form-panel leave-panel" *ngIf="showLeaveForm">
    <h3>Plan a Leave</h3>
    <div class="leave-form">
       <div class="input-group">
          <label>Leave Date</label>
          <input type="date" [(ngModel)]="leaveData.date" [min]="minDate" />
       </div>
       <div class="input-group">
          <label>Reason</label>
          <select [(ngModel)]="leaveData.reason">
             <option value="Emergency leave">Emergency leave</option>
             <option value="Surgery day">Surgery day</option>
             <option value="Holiday">Holiday</option>
             <option value="Travel day">Travel day</option>
          </select>
       </div>
       <button class="save-leave-btn" (click)="addLeave()">Add Leave Day</button>
    </div>

    <div class="leave-list" *ngIf="myLeaves.length">
      <h4>Your Planned Leaves</h4>
      <div class="scroll-x">
        <div class="leave-chip" *ngFor="let l of myLeaves">
          <span>{{ l.leave_date | date:'dd MMM yyyy' }} • <b>{{ l.reason }}</b></span>
          <button (click)="deleteLeave(l.id)">✕</button>
        </div>
      </div>
    </div>
  </div>

  <!-- ADD SLOT FORM -->
  <div class="form-panel" *ngIf="showAddForm">
    <h3>Add New Slot</h3>
    <label>Select Days</label>
    <div class="day-checkbox-group">
      <label *ngFor="let d of dayNames" class="day-checkbox">
        <input type="checkbox" [value]="d" (change)="toggleDaySelection(d,$event)">{{ d }}
      </label>
    </div>
    <div class="day-checkbox-group">
      <label>Start Time</label>
      <input type="time" [(ngModel)]="newSlot.startTime">
      <label>End Time</label>
      <input type="time" [(ngModel)]="newSlot.endTime">
      <button class="add-chip-btn" (click)="addSlotToList()">Add Time Slot</button>
    </div>

    <div class="chip-container" *ngIf="pendingSlots.length">
      <div class="slot-chip" *ngFor="let slot of pendingSlots; let i=index">
        {{slot.startTime}} → {{slot.endTime}} <button (click)="removePendingSlot(i)">✕</button>
      </div>
    </div>

    <button class="save-btn" (click)="saveAllSlots()" [disabled]="isSaving">
      {{ isSaving ? 'Saving...' : 'Save Slots' }}
    </button>
  </div>

  <!-- STATS -->
  <div class="stats-bar" *ngIf="!loading">
    <div>Total Slots: {{ totalSlots }}</div>
    <div>Active Days: {{ activeDays }}</div>
    <div>Weekly Hours: {{ totalHours }}h</div>
    <div class="ml-auto">Leave Days: {{ myLeaves.length }}</div>
  </div>

  <!-- GRID -->
  <div class="grid" *ngIf="!loading">
    <div class="day-col" *ngFor="let day of days">
      <h4>{{ day.name }}</h4>
      <div *ngIf="!day.slots.length" class="empty">No slots</div>
      <div *ngFor="let slot of day.slots" class="slot">
        {{ formatTime(slot.start_time) }} → {{ formatTime(slot.end_time) }}
        <button class="delete-btn" (click)="confirmRemove(slot)">✕</button>
      </div>
    </div>
  </div>

  <!-- DELETE MODAL -->
  <div class="modal" *ngIf="slotToDelete">
    <div class="modal-box">
      <h3>Remove Slot?</h3>
      <p>{{ formatTime(slotToDelete.start_time) }} - {{ formatTime(slotToDelete.end_time) }}</p>
      <button class="confirm" (click)="deleteSlot()">Remove</button>
      <button (click)="slotToDelete=null">Cancel</button>
    </div>
  </div>
</div>
`,
  styles: [`
.root{ padding:25px; background:#f6f8ff; min-height:100vh; font-family: 'Outfit', sans-serif; }
.page-header{ display:flex; justify-content:space-between; align-items: center; margin-bottom:25px; }
.header-btns { display: flex; gap: 12px; }
.add-btn{ background:#2563eb; color:white; padding:12px 20px; border:none; border-radius:12px; cursor:pointer; font-weight: 600; }
.leave-btn{ background:white; color:#1e293b; padding:12px 20px; border:1px solid #e2e8f0; border-radius:12px; cursor:pointer; font-weight: 600; }

.form-panel{ background:white; padding:25px; border-radius:24px; margin-bottom:25px; box-shadow:0 10px 30px rgba(0,0,0,0.02); display:flex; flex-direction:column; gap:15px; border: 1px solid #f1f5f9; }
.leave-panel { border-left: 5px solid #ef4444; }

.leave-form { display: grid; grid-template-columns: 1fr 1fr auto; gap: 15px; align-items: flex-end; }
.input-group { display: flex; flex-direction: column; gap: 5px; }
.input-group label { font-size: 13px; font-weight: 600; color: #64748b; }
.input-group input, .input-group select { padding: 12px; border: 1px solid #e2e8f0; border-radius: 10px; outline: none; }
.save-leave-btn { background: #ef4444; color: white; border: none; padding: 12px 20px; border-radius: 10px; font-weight: 600; cursor: pointer; }

.leave-list { margin-top: 20px; padding-top: 20px; border-top: 1px dashed #e2e8f0; }
.leave-chip { background: #fee2e2; color: #b91c1c; padding: 8px 15px; border-radius: 50px; display: inline-flex; align-items: center; gap: 10px; font-size: 13px; margin-right: 10px; margin-bottom: 10px; }
.leave-chip button { background: none; border: none; color: #b91c1c; cursor: pointer; font-weight: 800; }

.day-checkbox-group{ display:flex; flex-wrap:wrap; gap:10px; }
.day-checkbox{ background:#f1f5f9; padding:8px 15px; border-radius:10px; cursor:pointer; font-size: 14px; display: flex; align-items: center; gap: 8px; }
.add-chip-btn{ background:#2563eb; color:white; border:none; padding:10px; border-radius:8px; align-self: flex-end; }
.chip-container{ display:flex; flex-wrap:wrap; gap:8px; margin-top:10px; }
.slot-chip{ background:#e0e7ff; padding:8px 15px; border-radius:50px; display:flex; align-items:center; gap:8px; font-size:13px; }
.save-btn{ background:#10b981; color:white; border:none; padding:12px; border-radius:12px; font-weight: 600; cursor: pointer; }

.stats-bar{ display:flex; gap:25px; margin-bottom:20px; padding:15px 25px; background: white; border-radius: 18px; font-size: 14px; font-weight: 600; color: #64748b; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
.ml-auto { margin-left: auto; color: #ef4444; }

.grid{ display:grid; grid-template-columns:repeat(7,1fr); gap:12px; }
.day-col{ background:white; padding:15px; border-radius:20px; border: 1px solid #f1f5f9; }
.day-col h4 { margin-top: 0; color: #1e293b; font-size: 15px; }
.slot{ display:flex; justify-content:space-between; margin-top:8px; background:#f8fafc; padding:10px; border-radius:10px; font-size: 12px; align-items: center; }
.delete-btn{ background:none; border:none; color:#ef4444; cursor:pointer; font-weight: 800; }

.modal{ position:fixed; inset:0; background:rgba(0,0,0,.5); display:flex; align-items:center; justify-content:center; z-index: 1000; }
.modal-box{ background:white; padding:30px; border-radius:24px; width: 350px; text-align: center; }
.confirm { background: #ef4444; color: white; border: none; padding: 10px 20px; border-radius: 10px; margin-right: 10px; cursor: pointer; font-weight: 600; }

@media(max-width: 1200px) { .grid { grid-template-columns: repeat(4, 1fr); } }
@media(max-width: 800px) { .grid { grid-template-columns: repeat(2, 1fr); } }
@media(max-width: 500px) { .grid { grid-template-columns: 1fr; } .leave-form { grid-template-columns: 1fr; } }
`]
})
export class ScheduleManagerComponent implements OnInit {
  dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  days: any[] = [];
  loading = true;
  showAddForm = false;
  showLeaveForm = false;
  isSaving = false;
  slotToDelete: any = null;
  minDate = new Date().toISOString().split('T')[0];

  newSlot = { availableDays: [] as string[], startTime: '', endTime: '' };
  pendingSlots: any[] = [];
  leaveData = { date: '', reason: 'Holiday' };
  myLeaves: any[] = [];

  constructor(
    private scheduleService: ScheduleService,
    private doctorService: DoctorService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) { this.initDays(); }

  ngOnInit() {
    this.loadSlots();
    this.loadLeaves();
  }

  initDays() { this.days = this.dayNames.map(name => ({ name, slots: [] })); }

  loadLeaves() {
    (this.doctorService as any).getLeaveDays().subscribe((res: any) => {
      this.myLeaves = res;
      this.cdr.detectChanges();
    });
  }

  addLeave() {
    if (!this.leaveData.date) return;
    (this.doctorService as any).addLeave(this.leaveData).subscribe({
      next: () => {
        this.toast.success("Leave day added");
        this.leaveData.date = '';
        this.loadLeaves();
      },
      error: (err: any) => {
        this.toast.error(err.error?.message || "Failed to add leave");
      }
    });
  }

  deleteLeave(id: number) {
    (this.doctorService as any).deleteLeave(id).subscribe(() => {
      this.toast.success("Leave deleted");
      this.loadLeaves();
    });
  }

  toggleAddSlotForm() { this.showAddForm = !this.showAddForm; }

  toggleDaySelection(day: string, event: any) {
    if (event.target.checked) this.newSlot.availableDays.push(day);
    else this.newSlot.availableDays = this.newSlot.availableDays.filter(d => d !== day);
  }

  addSlotToList() {
    if (!this.newSlot.startTime || !this.newSlot.endTime) return this.toast.error("Select time");
    if (this.newSlot.startTime >= this.newSlot.endTime) return this.toast.error("Invalid range");
    this.pendingSlots.push({ startTime: this.newSlot.startTime, endTime: this.newSlot.endTime });
    this.newSlot.startTime = ''; this.newSlot.endTime = '';
  }

  removePendingSlot(index: number) { this.pendingSlots.splice(index, 1); }

  saveAllSlots() {
    if (!this.newSlot.availableDays.length) return this.toast.error("Select days");
    if (!this.pendingSlots.length) return this.toast.error("Add slots");
    this.isSaving = true;
    const requests = [];
    this.newSlot.availableDays.forEach(day => {
      this.pendingSlots.forEach(slot => {
        requests.push(this.scheduleService.createSlot({ availableDay: day, startTime: slot.startTime, endTime: slot.endTime }));
      });
    });
    Promise.all(requests.map(r => r.toPromise())).then(() => {
      this.toast.success("Slots created");
      this.showAddForm = false; this.pendingSlots = [];
      this.newSlot = { availableDays: [], startTime: '', endTime: '' };
      this.loadSlots();
    }).finally(() => { this.isSaving = false; this.cdr.detectChanges(); });
  }

  loadSlots() {
    this.loading = true;
    this.scheduleService.getMySlots().subscribe({
      next: (res: any[]) => {
        this.initDays();
        res.forEach(slot => {
          slot.start_time = this.formatSQLTime(slot.start_time);
          slot.end_time = this.formatSQLTime(slot.end_time);
          const day = this.days.find(d => d.name === slot.available_day);
          if (day) day.slots.push(slot);
        });
        this.loading = false; this.cdr.detectChanges();
      },
      error: () => { this.toast.error("Load failed"); this.loading = false; }
    });
  }

  confirmRemove(slot: any) { this.slotToDelete = slot; }
  deleteSlot() {
    this.scheduleService.deleteSlot(this.slotToDelete.id).subscribe(() => {
      this.toast.success("Removed");
      this.slotToDelete = null; this.loadSlots();
    });
  }

  formatSQLTime(time: any) {
    if (!time) return '';
    if (typeof time === 'string' && time.length === 5) return time;
    return new Date(time).toISOString().substring(11, 16);
  }

  formatTime(time: string) {
    const [h, m] = time.split(':');
    const hour = parseInt(h, 10);
    return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
  }

  get totalSlots() { return this.days.reduce((a, d) => a + d.slots.length, 0); }
  get activeDays() { return this.days.filter(d => d.slots.length > 0).length; }
  get totalHours() {
    let mins = 0;
    this.days.forEach(day => {
      day.slots.forEach((s: any) => {
        const [sh, sm] = s.start_time.split(':').map(Number);
        const [eh, em] = s.end_time.split(':').map(Number);
        mins += (eh * 60 + em) - (sh * 60 + sm);
      });
    });
    return Math.round(mins / 60 * 10) / 10;
  }
}