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

<!-- HEADER -->

<div class="page-header">

<div>
<h2>Weekly Schedule</h2>
<p>Manage your availability slots</p>
</div>

<div>
<button
class="add-btn"
(click)="toggleAddSlotForm()">

{{ showAddForm ? 'Close' : 'Add Slot' }}

</button>
</div>

</div>



<!-- ADD SLOT FORM -->

<div
class="form-panel"
*ngIf="showAddForm">

<h3>Add New Slot</h3>


<label>Select Days</label>

<div class="day-checkbox-group">

<label *ngFor="let d of dayNames" class="day-checkbox">

<input type="checkbox" [value]="d" (change)="toggleDaySelection(d,$event)">
{{ d }}
</label>

</div>

<div class="day-checkbox-group">
  <label>Start Time</label>
  <input type="time" [(ngModel)]="newSlot.startTime">
  <label>End Time</label>
  <input type="time" [(ngModel)]="newSlot.endTime">
  <button class="add-chip-btn" (click)="addSlotToList()">Add Time Slot</button>
</div>




<!-- TIME SLOT CHIPS -->

<div
class="chip-container"
*ngIf="pendingSlots.length">

<div class="slot-chip" *ngFor="let slot of pendingSlots; let i=index">

{{slot.startTime}} → {{slot.endTime}}

<button (click)="removePendingSlot(i)">✕</button>

</div>

</div>



<!-- PREVIEW -->

<div
class="preview-container"
*ngIf="pendingSlots.length && newSlot.availableDays.length">

<h4>Preview</h4>

<div
class="preview-chip"
*ngFor="let day of newSlot.availableDays">

<div
*ngFor="let slot of pendingSlots">

{{day}} → {{slot.startTime}} – {{slot.endTime}}

</div>

</div>

</div>



<button
class="save-btn"
(click)="saveAllSlots()"
[disabled]="isSaving">

{{ isSaving ? 'Saving...' : 'Save Slots' }}

</button>

</div>



<!-- LOADING -->

<div
*ngIf="loading"
class="loading">

Loading schedule...

</div>



<!-- STATS -->

<div
class="stats-bar"
*ngIf="!loading">

<div>Total Slots: {{ totalSlots }}</div>
<div>Active Days: {{ activeDays }}</div>
<div>Weekly Hours: {{ totalHours }}h</div>

</div>



<!-- GRID -->

<div
class="grid"
*ngIf="!loading">

<div
class="day-col"
*ngFor="let day of days">

<h4>{{ day.name }}</h4>

<div
*ngIf="!day.slots.length"
class="empty">

No slots

</div>


<div
*ngFor="let slot of day.slots"
class="slot">

{{ formatTime(slot.start_time) }}
→
{{ formatTime(slot.end_time) }}

<button
class="delete-btn"
(click)="confirmRemove(slot)">

✕

</button>

</div>

</div>

</div>



<!-- DELETE MODAL -->

<div
class="modal"
*ngIf="slotToDelete">

<div class="modal-box">

<h3>Remove Slot?</h3>

<p>

{{ formatTime(slotToDelete.start_time) }}
-
{{ formatTime(slotToDelete.end_time) }}

</p>

<button
class="confirm"
(click)="deleteSlot()">

Remove

</button>

<button
(click)="slotToDelete=null">

Cancel

</button>

</div>

</div>

</div>
`,

  styles: [`

.root{
padding:20px;
font-family:Arial;
background:#f6f8ff;
min-height:100vh;
}

.page-header{
display:flex;
justify-content:space-between;
margin-bottom:20px;
}

.add-btn{
background:#3b5bdb;
color:white;
padding:10px 18px;
border:none;
border-radius:10px;
cursor:pointer;
}

.form-panel{
background:white;
padding:20px;
border-radius:14px;
margin-bottom:20px;
display:flex;
flex-direction:column;
gap:10px;
}

.day-checkbox-group{
display:flex;
flex-wrap:wrap;
gap:8px;
}

.day-checkbox{
background:#eef2ff;
padding:6px 12px;
border-radius:8px;
cursor:pointer;
}

.add-chip-btn{
background:#3b82f6;
color:white;
border:none;
padding:8px;
border-radius:6px;
margin-top:6px;
}

.chip-container{
display:flex;
flex-wrap:wrap;
gap:8px;
margin-top:10px;
}

.slot-chip{
background:#e0e7ff;
padding:6px 12px;
border-radius:20px;
display:flex;
align-items:center;
gap:6px;
font-size:13px;
}

.preview-container{
margin-top:12px;
background:#f1f5ff;
padding:10px;
border-radius:10px;
}

.preview-chip{
font-size:14px;
margin:4px 0;
}

.save-btn{
margin-top:10px;
background:#10b981;
color:white;
border:none;
padding:10px;
border-radius:8px;
}

.stats-bar{
display:flex;
gap:20px;
margin-bottom:15px;
padding:10px 20px;
background-color: white;
border-radius: 12px;
}

.grid{
display:grid;
grid-template-columns:repeat(7,1fr);
gap:10px;
}

.day-col{
background:white;
padding:10px;
border-radius:12px;
}

.slot{
display:flex;
justify-content:space-between;
margin-top:6px;
background:#eef2ff;
padding:6px;
border-radius:6px;
}

.delete-btn{
background:none;
border:none;
color:red;
cursor:pointer;
}

.modal{
position:fixed;
inset:0;
background:rgba(0,0,0,.4);
display:flex;
align-items:center;
justify-content:center;
}

.modal-box{
background:white;
padding:20px;
border-radius:12px;
}

`]

})

export class ScheduleManagerComponent implements OnInit {

  dayNames = [
    'Monday', 'Tuesday', 'Wednesday',
    'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  days: any[] = [];
  loading = true;
  showAddForm = false;
  isSaving = false;
  slotToDelete: any = null;

  newSlot = {
    availableDays: [] as string[],
    startTime: '',
    endTime: ''
  };

  pendingSlots: any[] = [];


  constructor(
    private scheduleService: ScheduleService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {
    this.initDays();
  }

  ngOnInit() {
    this.loadSlots();
  }

  initDays() {
    this.days = this.dayNames.map(name => ({ name, slots: [] }));
  }

  toggleAddSlotForm() {
    this.showAddForm = !this.showAddForm;
  }


  toggleDaySelection(day: string, event: any) {

    if (event.target.checked) {

      this.newSlot.availableDays.push(day);

    } else {

      this.newSlot.availableDays =
        this.newSlot.availableDays.filter(d => d !== day);

    }

  }


  addSlotToList() {

    if (!this.newSlot.startTime || !this.newSlot.endTime) {

      this.toast.error("Select time");
      return;

    }

    if (this.newSlot.startTime >= this.newSlot.endTime) {

      this.toast.error("Invalid time range");
      return;

    }

    this.pendingSlots.push({

      startTime: this.newSlot.startTime,
      endTime: this.newSlot.endTime

    });

    this.newSlot.startTime = '';
    this.newSlot.endTime = '';

  }


  removePendingSlot(index: number) {

    this.pendingSlots.splice(index, 1);

  }


  saveAllSlots() {

    if (!this.newSlot.availableDays.length) {

      this.toast.error("Select days");
      return;

    }

    if (!this.pendingSlots.length) {

      this.toast.error("Add at least one slot");
      return;

    }

    this.isSaving = true;

    const requests = [];

    this.newSlot.availableDays.forEach(day => {

      this.pendingSlots.forEach(slot => {

        requests.push(

          this.scheduleService.createSlot({

            availableDay: day,
            startTime: slot.startTime,
            endTime: slot.endTime

          })

        );

      });

    });

    Promise.all(requests.map(r => r.toPromise()))

      .then(() => {

        this.toast.success("Slots created");

        this.showAddForm = false;

        this.pendingSlots = [];

        this.newSlot = {
          availableDays: [],
          startTime: '',
          endTime: ''
        };

        this.loadSlots();

      })

      .catch(() => {

        this.toast.error("Save failed");

      })

      .finally(() => {

        this.isSaving = false;

        this.cdr.detectChanges();

      });

  }


  loadSlots() {

    this.loading = true;

    this.scheduleService.getMySlots().subscribe({

      next: (res: any[]) => {

        this.initDays();

        res.forEach(slot => {

          slot.start_time = this.formatSQLTime(slot.start_time);
          slot.end_time = this.formatSQLTime(slot.end_time);

          const day = this.days.find(
            d => d.name === slot.available_day
          );

          if (day) day.slots.push(slot);

        });

        this.loading = false;
        this.cdr.detectChanges();

      },

      error: () => {

        this.toast.error("Load failed");
        this.loading = false;

      }

    });

  }


  confirmRemove(slot: any) {

    this.slotToDelete = slot;

  }


  deleteSlot() {

    this.scheduleService
      .deleteSlot(this.slotToDelete.id)
      .subscribe(() => {

        this.toast.success("Removed");

        this.slotToDelete = null;

        this.loadSlots();

      });

  }


  formatSQLTime(time: any) {

    if (!time) return '';

    if (typeof time === 'string'
      && time.length === 5) {

      return time;

    }

    return new Date(time)
      .toISOString()
      .substring(11, 16);

  }


  formatTime(time: string) {

    const [h, m] = time.split(':');
    const hour = parseInt(h, 10);

    return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;

  }


  get totalSlots() {

    return this.days.reduce(
      (a, d) => a + d.slots.length, 0
    );

  }


  get activeDays() {

    return this.days.filter(
      d => d.slots.length > 0
    ).length;

  }


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