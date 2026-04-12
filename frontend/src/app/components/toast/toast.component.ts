import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../services/toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div *ngFor="let toast of toasts" 
           class="toast toast-animate" [ngClass]="toast.type">
        <div class="toast-icon">
          <i *ngIf="toast.type === 'success'" class="icon-check">✓</i>
          <i *ngIf="toast.type === 'error'" class="icon-error">✕</i>
          <i *ngIf="toast.type === 'info'" class="icon-info">i</i>
          <i *ngIf="toast.type === 'warning'" class="icon-warning">!</i>
        </div>
        <div class="toast-message">{{ toast.message }}</div>
        <button class="toast-close" (click)="remove(toast.id)">&times;</button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .toast {
      display: flex;
      align-items: center;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      min-width: 300px;
      background: white;
      color: #333;
      gap: 12px;
    }

    .toast-animate {
      animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }
    
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(-20px) scale(0.9); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    [data-theme="dark"] .toast {
      background: #1e1e1e;
      color: #fff;
    }

    .toast-icon {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      color: white;
    }

    .success .toast-icon { background: #28a745; }
    .error .toast-icon { background: #dc3545; }
    .info .toast-icon { background: #17a2b8; }
    .warning .toast-icon { background: #ffc107; }

    .toast-message {
      flex: 1;
      font-size: 14px;
      font-weight: 500;
    }

    .toast-close {
      background: none;
      border: none;
      color: inherit;
      opacity: 0.6;
      cursor: pointer;
      font-size: 20px;
      line-height: 1;
      padding: 0;
    }
    
    .toast-close:hover {
      opacity: 1;
    }
  `]
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private sub!: Subscription;

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.sub = this.toastService.toastSubject.subscribe(toasts => {
      this.toasts = toasts;
    });
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }

  remove(id: number) {
    this.toastService.remove(id);
  }
}
