import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../services/appointment.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-patient-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="root">

      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-head">
          <div>
            <p class="eyebrow">Doctor Portal</p>
            <h1 class="sidebar-title">Requests</h1>
          </div>
        </div>

        <!-- Search -->
        <div class="search-wrap">
          <svg class="search-ico" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input class="search-input" type="text" placeholder="Search patient…" [(ngModel)]="searchQuery" (input)="filterData()">
        </div>

        <!-- Tabs -->
        <div class="tab-row">
          <button class="tab-btn" [class.active]="filter === 'all'" (click)="setFilter('all')">All</button>
           <button class="tab-btn" [class.active]="filter === 'pending'" (click)="setFilter('pending')">
            Pending
            <span class="tab-count" *ngIf="pendingCount > 0">{{ pendingCount }}</span>
          </button>
        </div>

        <!-- List -->
        <div class="list-wrap">
          <div class="loading-col" *ngIf="loading">
            <div class="ring"></div>
            <p>Loading…</p>
          </div>

          <div class="empty-col" *ngIf="!loading && displayedRequests.length === 0">
            <div class="empty-icon">📭</div>
            <p class="empty-title">All clear!</p>
            <p class="empty-sub">No requests match your filter.</p>
          </div>

          <div *ngIf="!loading">
            <div *ngFor="let req of displayedRequests"
              class="req-row"
              [class.active]="selectedRequest?.id === req.id"
              (click)="selectRequest(req)">
              <div class="req-av" [style.backgroundImage]="req.patientImage ? 'url(' + req.patientImage + ')' : ''">
                {{ !req.patientImage ? (req.patientName?.charAt(0) || 'P') : '' }}
              </div>
              <div class="req-info">
                <span class="req-name">{{ req.patientName }}</span>
                <span class="req-meta">{{ req.appointment_date | date:'MMM d' }} · {{ req.start_time }} - {{ req.end_time }}</span>
              </div>
              <span class="req-dot" [ngClass]="req.status"></span>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Panel -->
      <main class="main">

        <!-- Empty State -->
        <div class="no-sel" *ngIf="!selectedRequest">
          <div class="no-sel-inner">
            <div class="no-sel-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <h3 class="no-sel-title">Select a patient</h3>
            <p class="no-sel-sub">Choose an appointment from the list to review details and take action.</p>
          </div>
        </div>

        <!-- Detail View -->
        <div class="detail-view" *ngIf="selectedRequest">

          <!-- Detail Header -->
          <div class="detail-head">
            <div class="detail-av-wrap">
              <div class="detail-av" [style.backgroundImage]="selectedRequest.patientImage ? 'url(' + selectedRequest.patientImage + ')' : ''">
                {{ !selectedRequest.patientImage ? (selectedRequest.patientName?.charAt(0) || 'P') : '' }}
              </div>
            </div>
            <div class="detail-identity">
              <h2 class="detail-name">{{ selectedRequest.patientName }}</h2>
              <p class="detail-email">{{ selectedRequest.patientEmail || 'Email not provided' }}</p>
              <p class="detail-pid">ID #{{ selectedRequest.id }}</p>
            </div>
            <div class="detail-status-wrap">
              <span class="status-badge" [ngClass]="selectedRequest.status">{{ selectedRequest.status | titlecase }}</span>
              <span class="consult-mode" [ngClass]="selectedRequest.consultation_type">
                {{ selectedRequest.consultation_type === 'online' ? '🎥 Online' : '🏢 In-Clinic' }}
              </span>
            </div>
          </div>

          <!-- Appointment Card -->
          <div class="appt-strip">
            <div class="appt-seg">
              <span class="appt-lbl">Date</span>
              <span class="appt-val">{{ selectedRequest.appointment_date | date:'EEE, MMM d, y' }}</span>
            </div>
            <div class="appt-div"></div>
            <div class="appt-seg">
              <span class="appt-lbl">Time</span>
              <span class="appt-val">{{ selectedRequest.start_time + " - " + selectedRequest.end_time }}</span>
            </div>
            <div class="appt-div"></div>
            <div class="appt-seg">
              <span class="appt-lbl">Payment</span>
              <span class="appt-val pay-val" [class.paid]="selectedRequest.payment_status === 'paid'">
                {{ selectedRequest.payment_status === 'paid' ? '✓ Paid' : '⏳ Pending' }}
              </span>
            </div>
            <div class="appt-div"></div>
            <div class="appt-seg">
              <span class="appt-lbl">Mode</span>
              <span class="appt-val">{{ selectedRequest.consultation_type === 'online' ? 'Video Call' : 'Clinic Visit' }}</span>
            </div>
          </div>

          <!-- Patient Profile -->
          <div class="section-block">
            <h4 class="section-label">Patient Profile</h4>
            <div class="profile-grid">
              <div class="pf-item">
                <span class="pf-lbl">Age</span>
                <span class="pf-val">{{ selectedRequest.age ? selectedRequest.age + ' yrs' : '—' }}</span>
              </div>
              <div class="pf-item">
                <span class="pf-lbl">Gender</span>
                <span class="pf-val">{{ selectedRequest.gender || '—' }}</span>
              </div>
              <div class="pf-item">
                <span class="pf-lbl">Phone</span>
                <span class="pf-val link">{{ selectedRequest.phone_number || '—' }}</span>
              </div>
              <div class="pf-item">
                <span class="pf-lbl">Blood Group</span>
                <span class="pf-val blood">{{ selectedRequest.blood_group || '—' }}</span>
              </div>
              <div class="pf-item pf-full">
                <span class="pf-lbl">Address</span>
                <span class="pf-val">{{ selectedRequest.address || 'Not provided' }}</span>
              </div>
            </div>
          </div>

          <!-- Action Footer -->
          <div class="action-footer">

            <!-- Pending -->
            <ng-container *ngIf="selectedRequest.status === 'pending'">
              <div class="action-hint">Review and respond to this appointment request</div>
              <div class="action-row">
                <button class="act-btn decline" (click)="confirmDecline(selectedRequest.id)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  Decline
                </button>
                <button class="act-btn accept" (click)="updateStatus(selectedRequest.id, 'confirmed')">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Accept Appointment
                </button>
              </div>
            </ng-container>

            <!-- Reschedule requested -->
            <ng-container *ngIf="selectedRequest.status === 'reschedule_requested'">
              <div class="action-hint reschedule">Patient has requested a new time</div>
              <div class="action-row">
                <button class="act-btn decline" (click)="confirmDecline(selectedRequest.id)">Decline</button>
                <button class="act-btn accept" (click)="updateStatus(selectedRequest.id, 'confirmed')">Confirm New Time</button>
              </div>
            </ng-container>

            <!-- Confirmed -->
            <ng-container *ngIf="selectedRequest.status === 'confirmed'">
              <div class="action-hint confirmed">Appointment is confirmed</div>
              <div class="action-row">
                <button *ngIf="selectedRequest.consultation_type === 'online'" class="act-btn video" (click)="joinCall(selectedRequest)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                  Start Video Call
                </button>
                <button class="act-btn ghost" (click)="openReschedule(selectedRequest)">Reschedule</button>
                <button class="act-btn complete" (click)="markCompleted(selectedRequest.id)">Mark Complete</button>
              </div>
            </ng-container>

            <!-- Finalized -->
            <div class="finalized-note" *ngIf="['completed','rejected','cancelled_by_doctor','cancelled_by_patient'].includes(selectedRequest.status)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              This appointment has been finalized
            </div>

          </div>
        </div>
      </main>
    </div>

    <!-- Reschedule Modal -->
    <div class="modal-overlay" *ngIf="showRescheduleModal" (click)="closeModals()">
      <div class="modal-box" (click)="$event.stopPropagation()">
        <div class="modal-head">
          <h3 class="modal-title">Reschedule Appointment</h3>
          <button class="modal-close" (click)="closeModals()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="modal-field">
            <label class="modal-lbl">New Date</label>
            <input type="date" class="modal-input" [(ngModel)]="newDate">
          </div>
          <div class="modal-field">
            <label class="modal-lbl">New Time</label>
            <input type="time" class="modal-input" [(ngModel)]="newTime">
          </div>
        </div>
        <div class="modal-foot">
          <button class="mf-cancel" (click)="closeModals()">Cancel</button>
          <button class="mf-confirm primary" (click)="executeReschedule()">Confirm Reschedule</button>
        </div>
      </div>
    </div>

    <!-- Decline Modal -->
    <div class="modal-overlay" *ngIf="showConfirmModal" (click)="closeModals()">
      <div class="modal-box modal-sm" (click)="$event.stopPropagation()">
        <div class="modal-danger-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
        </div>
        <h3 class="modal-title center">Decline Request?</h3>
        <p class="modal-desc">The patient will be notified that their appointment request has been declined.</p>
        <div class="modal-foot">
          <button class="mf-cancel" (click)="closeModals()">Keep It</button>
          <button class="mf-confirm danger" (click)="executeDecline()">Yes, Decline</button>
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
      --green-light: #ECFDF5;
      --amber: #F59E0B;
      --amber-light: #FFFBEB;
      --red: #EF4444;
      --red-light: #FEF2F2;
      --sidebar-w: 320px;
      font-family: 'DM Sans', sans-serif;
      display: block;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }

    /* Root Layout */
    .root {
      display: grid;
      grid-template-columns: var(--sidebar-w) 1fr;
      height: 100vh;
      overflow: hidden;
      background: var(--bg);
    }

    /* ── SIDEBAR ── */
    .sidebar {
      background: var(--surface);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .sidebar-head {
      padding: 28px 22px 20px;
      border-bottom: 1px solid var(--border);
    }
    .eyebrow { font-size: 0.62rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; color: var(--primary); margin-bottom: 4px; }
    .sidebar-title { font-family: 'Sora', sans-serif; font-size: 1.6rem; font-weight: 800; color: var(--text); letter-spacing: -0.4px; }

    .search-wrap { position: relative; margin: 16px 16px 0; }
    .search-ico { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); color: var(--muted); }
    .search-input {
      width: 100%; padding: 11px 14px 11px 38px;
      background: var(--bg); border: 1.5px solid var(--border);
      border-radius: 12px; font-family: 'DM Sans', sans-serif;
      font-size: 0.875rem; font-weight: 500; color: var(--text);
      outline: none; transition: 0.2s;
    }
    .search-input:focus { border-color: var(--primary); background: white; }

    .tab-row { display: flex; gap: 6px; padding: 14px 16px; }
    .tab-btn {
      flex: 1; padding: 9px 12px; border: none; border-radius: 10px;
      font-family: 'Sora', sans-serif; font-size: 0.78rem; font-weight: 700;
      cursor: pointer; transition: 0.2s; background: var(--bg); color: var(--muted);
      display: flex; align-items: center; justify-content: center; gap: 7px;
    }
    .tab-btn.active { background: var(--primary); color: white; box-shadow: 0 4px 12px var(--primary-glow); }
    .tab-count { background: rgba(255,255,255,0.25); border-radius: 6px; padding: 1px 7px; font-size: 0.7rem; }

    .list-wrap { flex: 1; overflow-y: auto; padding: 8px 10px 16px; scrollbar-width: thin; scrollbar-color: var(--border) transparent; }

    .loading-col, .empty-col { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 20px; gap: 10px; }
    .ring { width: 36px; height: 36px; border-radius: 50%; border: 3px solid var(--border); border-top-color: var(--primary); animation: spin 0.9s linear infinite; }
    .loading-col p, .empty-col p { font-size: 0.8rem; color: var(--muted); font-weight: 500; }
    .empty-icon { font-size: 2.2rem; margin-bottom: 4px; }
    .empty-title { font-family: 'Sora', sans-serif; font-weight: 700; color: var(--text); font-size: 0.95rem; }
    .empty-sub { font-size: 0.78rem; color: var(--muted); }

    .req-row {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 12px; border-radius: 14px;
      cursor: pointer; transition: all 0.18s;
      border: 1.5px solid transparent;
      margin-bottom: 4px;
    }
    .req-row:hover { background: var(--bg); }
    .req-row.active { background: var(--primary-light); border-color: #C7D2F5; }

    .req-av {
      width: 42px; height: 42px; border-radius: 12px; flex-shrink: 0;
      background: var(--primary-light); color: var(--primary);
      display: flex; align-items: center; justify-content: center;
      font-family: 'Sora', sans-serif; font-weight: 800; font-size: 1rem;
      background-size: cover; background-position: center;
    }
    .req-info { flex: 1; min-width: 0; }
    .req-name { display: block; font-weight: 700; font-size: 0.875rem; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .req-meta { display: block; font-size: 0.72rem; color: var(--muted); margin-top: 2px; }
    .req-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .req-dot.pending { background: var(--amber); }
    .req-dot.confirmed { background: var(--green); }
    .req-dot.completed { background: #94A3B8; }
    .req-dot.rejected, .req-dot.cancelled_by_doctor, .req-dot.cancelled_by_patient { background: var(--red); }
    .req-dot.reschedule_requested { background: #8B5CF6; }

    /* ── MAIN ── */
    .main { overflow-y: auto; background: var(--bg); }

    .no-sel { height: 100%; display: flex; align-items: center; justify-content: center; }
    .no-sel-inner { text-align: center; }
    .no-sel-icon { width: 72px; height: 72px; background: var(--surface); border: 1.5px solid var(--border); border-radius: 20px; display: flex; align-items: center; justify-content: center; margin: 0 auto 18px; color: var(--muted); }
    .no-sel-title { font-family: 'Sora', sans-serif; font-size: 1.1rem; font-weight: 700; color: var(--text); margin-bottom: 8px; }
    .no-sel-sub { font-size: 0.875rem; color: var(--muted); max-width: 260px; line-height: 1.5; }

    /* Detail view */
    .detail-view { display: flex; flex-direction: column; min-height: 100%; }

    /* Header */
    .detail-head {
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      padding: 28px 32px;
      display: flex;
      align-items: flex-start;
      gap: 20px;
    }
    .detail-av-wrap {}
    .detail-av {
      width: 72px; height: 72px; border-radius: 20px;
      background: var(--primary-light); color: var(--primary);
      display: flex; align-items: center; justify-content: center;
      font-family: 'Sora', sans-serif; font-weight: 800; font-size: 2rem;
      background-size: cover; background-position: center;
      border: 3px solid white;
      box-shadow: 0 4px 16px rgba(59,91,219,0.12);
    }
    .detail-identity { flex: 1; }
    .detail-name { font-family: 'Sora', sans-serif; font-size: 1.5rem; font-weight: 800; color: var(--text); letter-spacing: -0.3px; }
    .detail-email { font-size: 0.875rem; color: var(--primary); font-weight: 500; margin-top: 3px; }
    .detail-pid { font-size: 0.72rem; color: var(--muted); margin-top: 2px; }
    .detail-status-wrap { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }

    .status-badge {
      padding: 5px 14px; border-radius: 20px;
      font-family: 'Sora', sans-serif; font-size: 0.68rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.6px;
    }
    .status-badge.pending { background: var(--amber-light); color: #B45309; border: 1px solid #FDE68A; }
    .status-badge.confirmed { background: var(--green-light); color: #047857; border: 1px solid #A7F3D0; }
    .status-badge.completed { background: #F1F5F9; color: var(--muted); border: 1px solid var(--border); }
    .status-badge.rejected, .status-badge.cancelled_by_doctor, .status-badge.cancelled_by_patient { background: var(--red-light); color: #B91C1C; border: 1px solid #FECACA; }
    .status-badge.reschedule_requested { background: #F5F3FF; color: #6D28D9; border: 1px solid #DDD6FE; }

    .consult-mode {
      padding: 5px 12px; border-radius: 10px;
      font-size: 0.75rem; font-weight: 600;
    }
    .consult-mode.online { background: #EFF6FF; color: #1D4ED8; }
    .consult-mode.offline { background: #FAF5FF; color: #7E22CE; }

    /* Appointment strip */
    .appt-strip {
      display: flex; align-items: stretch;
      background: var(--surface); border-bottom: 1px solid var(--border);
      padding: 0 32px;
    }
    .appt-seg { padding: 18px 24px 18px 0; display: flex; flex-direction: column; gap: 4px; }
    .appt-seg:first-child { padding-left: 0; }
    .appt-div { width: 1px; background: var(--border); margin: 14px 24px 14px 0; }
    .appt-lbl { font-size: 0.62rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: var(--muted); }
    .appt-val { font-family: 'Sora', sans-serif; font-size: 0.9rem; font-weight: 700; color: var(--text); }
    .pay-val { color: var(--muted); }
    .pay-val.paid { color: var(--green); }

    /* Profile section */
    .section-block { padding: 28px 32px; flex: 1; }
    .section-label { font-family: 'Sora', sans-serif; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--muted); margin-bottom: 18px; }
    .profile-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; background: var(--surface); border-radius: 20px; padding: 24px; border: 1px solid var(--border); }
    .pf-full { grid-column: 1 / -1; }
    .pf-item { display: flex; flex-direction: column; gap: 5px; }
    .pf-lbl { font-size: 0.62rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.7px; color: var(--muted); }
    .pf-val { font-family: 'Sora', sans-serif; font-size: 0.9rem; font-weight: 700; color: var(--text); }
    .pf-val.link { color: var(--primary); }
    .pf-val.blood { color: var(--red); }

    /* Action Footer */
    .action-footer {
      background: var(--surface);
      border-top: 1px solid var(--border);
      padding: 22px 32px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .action-hint {
      font-size: 0.78rem; font-weight: 600; color: var(--muted);
      padding: 8px 14px; background: var(--bg); border-radius: 8px;
      border-left: 3px solid var(--border);
    }
    .action-hint.reschedule { border-left-color: #8B5CF6; color: #6D28D9; background: #F5F3FF; }
    .action-hint.confirmed { border-left-color: var(--green); color: #047857; background: var(--green-light); }

    .action-row { display: flex; gap: 10px; }
    .act-btn {
      flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
      padding: 14px 20px; border: none; border-radius: 14px;
      font-family: 'Sora', sans-serif; font-size: 0.875rem; font-weight: 700;
      cursor: pointer; transition: all 0.2s;
    }
    .act-btn:hover { transform: translateY(-2px); }
    .act-btn.decline { background: var(--red-light); color: var(--red); border: 1.5px solid #FECACA; }
    .act-btn.decline:hover { background: var(--red); color: white; box-shadow: 0 6px 16px rgba(239,68,68,0.25); }
    .act-btn.accept { background: var(--green); color: white; box-shadow: 0 4px 14px rgba(16,185,129,0.25); }
    .act-btn.accept:hover { background: #059669; box-shadow: 0 8px 20px rgba(16,185,129,0.3); }
    .act-btn.video { background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: white; box-shadow: 0 4px 14px var(--primary-glow); }
    .act-btn.video:hover { box-shadow: 0 8px 22px rgba(59,91,219,0.3); }
    .act-btn.ghost { background: var(--bg); color: var(--text); border: 1.5px solid var(--border); }
    .act-btn.ghost:hover { border-color: #97ABEE; }
    .act-btn.complete { background: var(--surface); color: var(--text); border: 1.5px solid var(--border); }
    .act-btn.complete:hover { border-color: var(--green); color: var(--green); }

    .finalized-note {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      padding: 14px; background: var(--bg); border-radius: 12px;
      font-size: 0.8rem; font-weight: 600; color: var(--muted);
      border: 1px solid var(--border);
    }

    /* Modal */
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(15,27,61,0.55);
      backdrop-filter: blur(8px); z-index: 2000;
      display: flex; align-items: center; justify-content: center;
      padding: 24px; animation: fadeIn 0.2s ease;
    }
    .modal-box {
      background: var(--surface); border-radius: 24px; width: 100%;
      max-width: 440px; box-shadow: 0 24px 60px rgba(0,0,0,0.2);
      animation: slideUp 0.25s ease; overflow: hidden;
    }
    .modal-sm { max-width: 380px; padding: 36px; text-align: center; }
    .modal-head { display: flex; align-items: center; justify-content: space-between; padding: 24px 24px 20px; border-bottom: 1px solid var(--border); }
    .modal-title { font-family: 'Sora', sans-serif; font-size: 1.1rem; font-weight: 800; color: var(--text); }
    .modal-title.center { text-align: center; margin-bottom: 10px; }
    .modal-close { background: var(--bg); border: none; width: 34px; height: 34px; border-radius: 9px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--muted); transition: 0.2s; }
    .modal-close:hover { background: var(--red-light); color: var(--red); }
    .modal-body { padding: 22px 24px; display: flex; flex-direction: column; gap: 16px; }
    .modal-field { display: flex; flex-direction: column; gap: 7px; }
    .modal-lbl { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: var(--muted); }
    .modal-input { padding: 12px 14px; background: var(--bg); border: 1.5px solid var(--border); border-radius: 12px; font-family: 'DM Sans', sans-serif; font-size: 0.9rem; font-weight: 500; color: var(--text); outline: none; transition: 0.2s; }
    .modal-input:focus { border-color: var(--primary); background: white; }
    .modal-foot { display: flex; gap: 10px; padding: 20px 24px; border-top: 1px solid var(--border); }
    .modal-sm .modal-foot { border-top: none; padding: 0; margin-top: 24px; }
    .mf-cancel { flex: 1; padding: 12px; background: var(--bg); border: 1.5px solid var(--border); border-radius: 12px; font-family: 'Sora', sans-serif; font-size: 0.875rem; font-weight: 700; color: var(--text); cursor: pointer; transition: 0.2s; }
    .mf-cancel:hover { border-color: #97ABEE; }
    .mf-confirm { flex: 1; padding: 12px; border: none; border-radius: 12px; font-family: 'Sora', sans-serif; font-size: 0.875rem; font-weight: 700; cursor: pointer; transition: 0.2s; }
    .mf-confirm.primary { background: var(--primary); color: white; box-shadow: 0 4px 14px var(--primary-glow); }
    .mf-confirm.primary:hover { background: var(--primary-dark); transform: translateY(-1px); }
    .mf-confirm.danger { background: var(--red); color: white; box-shadow: 0 4px 14px rgba(239,68,68,0.2); }
    .mf-confirm.danger:hover { background: #DC2626; transform: translateY(-1px); }

    .modal-danger-icon { width: 56px; height: 56px; background: var(--red-light); border-radius: 16px; display: flex; align-items: center; justify-content: center; color: var(--red); margin: 0 auto 20px; }
    .modal-desc { font-size: 0.875rem; color: var(--muted); line-height: 1.6; margin-bottom: 0; }

    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

    @media (max-width: 900px) {
      .root { grid-template-columns: 1fr; height: auto; }
      .sidebar { height: auto; max-height: 50vh; }
      .list-wrap { max-height: 300px; }
      .profile-grid { grid-template-columns: repeat(2, 1fr); }
    }
  `]
})
export class PatientRequestsComponent implements OnInit {
  requests: any[] = [];
  displayedRequests: any[] = [];
  loading = true;
  filter: 'all' | 'pending' = 'all';
  searchQuery = '';

  showConfirmModal = false;
  showRescheduleModal = false;
  selectedRequest: any = null;
  requestToDecline: number | null = null;

  newDate = '';
  newTime = '';

  get pendingCount() { return this.requests.filter(r => r.status === 'pending').length; }

  constructor(
    private appointmentService: AppointmentService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() { this.fetchRequests(); }

  fetchRequests() {
    this.loading = true;
    this.appointmentService.getDoctorAppointments().subscribe({
      next: (res: any) => {
        this.requests = res;
        this.filterData();
        this.loading = false;
        if (!this.selectedRequest && this.displayedRequests.length > 0) {
          this.selectedRequest = this.displayedRequests[0];
        } else if (this.selectedRequest) {
          this.selectedRequest = this.requests.find(r => r.id === this.selectedRequest.id) || this.displayedRequests[0] || null;
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.toast.error('Failed to load requests');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  setFilter(type: 'pending' | 'all') { this.filter = type; this.filterData(); }

  filterData() {
    let list = this.filter === 'pending' ? this.requests.filter(r => r.status === 'pending') : [...this.requests];
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(r => r.patientName?.toLowerCase().includes(q) || r.patientEmail?.toLowerCase().includes(q));
    }
    this.displayedRequests = list;
  }

  selectRequest(req: any) { this.selectedRequest = req; }

  updateStatus(id: number, status: string) {
    this.appointmentService.updateAppointmentStatus(id, status).subscribe({
      next: () => { this.toast.success(`Status updated: ${status}`); this.fetchRequests(); },
      error: () => this.toast.error('Update failed')
    });
  }

  confirmDecline(id: number) { this.requestToDecline = id; this.showConfirmModal = true; }
  executeDecline() { if (!this.requestToDecline) return; this.updateStatus(this.requestToDecline, 'rejected'); this.showConfirmModal = false; }

  openReschedule(req: any) {
    this.selectedRequest = req;
    this.newDate = req.appointment_date?.split('T')[0];
    this.newTime = req.start_time + " - " + req.end_time;
    this.showRescheduleModal = true;
  }

  executeReschedule() {
    if (!this.newDate || !this.newTime) return;
    this.appointmentService.rescheduleAppointment(this.selectedRequest.id, { date: this.newDate, time: this.newTime }).subscribe({
      next: () => { this.toast.success('Rescheduled successfully'); this.showRescheduleModal = false; this.fetchRequests(); },
      error: () => this.toast.error('Reschedule failed')
    });
  }

  markCompleted(id: number) { this.updateStatus(id, 'completed'); }
  joinCall(req: any) {
    if (req.meeting_link) window.open(req.meeting_link, '_blank');
    else this.toast.warning('Meeting link not available yet');
  }

  closeModals() { this.showConfirmModal = false; this.showRescheduleModal = false; }
}