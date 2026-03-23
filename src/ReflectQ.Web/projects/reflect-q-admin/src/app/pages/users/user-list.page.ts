import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { UsersService } from 'api';
import { User, UserRole } from 'domain';

@Component({
  selector: 'app-user-list-page',
  imports: [FormsModule, DatePipe],
  template: `
    <div class="user-list" data-testid="user-list-page">
      <header class="page-header">
        <h1 class="page-title">Users</h1>
        <button
          class="btn btn-primary"
          (click)="showInviteForm.set(!showInviteForm())"
          data-testid="invite-user-button"
        >
          Invite User
        </button>
      </header>

      @if (showInviteForm()) {
        <div class="invite-form" data-testid="invite-form">
          <input
            type="email"
            class="form-input"
            placeholder="Email address"
            [(ngModel)]="inviteEmail"
            data-testid="invite-email-input"
          />
          <select
            class="form-select"
            [(ngModel)]="inviteRole"
            data-testid="invite-role-select"
            aria-label="Select role"
          >
            <option value="Viewer">Viewer</option>
            <option value="Admin">Admin</option>
          </select>
          <button class="btn btn-primary" (click)="onInvite()" data-testid="send-invite-button">
            Send Invite
          </button>
          <button class="btn btn-secondary" (click)="showInviteForm.set(false)">Cancel</button>
        </div>
      }

      <div class="table-container">
        <table class="data-table" data-testid="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (user of users(); track user.id) {
              <tr data-testid="user-row">
                <td>
                  @if (editingUserId() === user.id) {
                    <input
                      type="text"
                      class="inline-input"
                      [(ngModel)]="editName"
                      data-testid="edit-name-input"
                    />
                  } @else {
                    {{ user.name }}
                  }
                </td>
                <td>{{ user.email }}</td>
                <td>
                  @if (editingUserId() === user.id) {
                    <select
                      class="inline-select"
                      [(ngModel)]="editRole"
                      data-testid="edit-role-select"
                      aria-label="Edit role"
                    >
                      <option value="Viewer">Viewer</option>
                      <option value="Admin">Admin</option>
                      <option value="SuperAdmin">Super Admin</option>
                    </select>
                  } @else {
                    <span class="badge" [class]="'badge-' + user.role.toLowerCase()">
                      {{ user.role }}
                    </span>
                  }
                </td>
                <td>
                  <span class="badge" [class]="'badge-' + user.status.toLowerCase()">
                    {{ user.status }}
                  </span>
                </td>
                <td>{{ user.lastLoginAt ? (user.lastLoginAt | date:'mediumDate') : 'Never' }}</td>
                <td>
                  <div class="actions">
                    @if (editingUserId() === user.id) {
                      <button class="icon-btn" title="Save" (click)="onSaveEdit(user)" data-testid="save-edit-button" aria-label="Save changes">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12" /></svg>
                      </button>
                      <button class="icon-btn" title="Cancel" (click)="editingUserId.set(null)" aria-label="Cancel edit">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                      </button>
                    } @else {
                      <button class="icon-btn" title="Edit" (click)="onStartEdit(user)" data-testid="edit-user-button" aria-label="Edit user">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      @if (user.status === 'Active') {
                        <button class="icon-btn" title="Deactivate" (click)="onDeactivate(user)" data-testid="deactivate-button" aria-label="Deactivate user">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>
                        </button>
                      }
                    }
                  </div>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6" class="empty-cell">No users found.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
    }

    .page-title {
      font-family: 'Inconsolata', monospace;
      font-size: 24px;
      font-weight: 600;
      margin: 0;
    }

    .btn {
      height: 40px;
      padding: 0 20px;
      border-radius: 8px;
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      border: none;
    }

    .btn-primary {
      background: #16160C;
      color: #ffffff;
    }

    .btn-primary:hover {
      opacity: 0.9;
    }

    .btn-secondary {
      background: #ffffff;
      color: #16160C;
      border: 1px solid #16160C1A;
    }

    .invite-form {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
      padding: 16px;
      background: #ffffff;
      border-radius: 12px;
      border: 1px solid #16160C1A;
    }

    .form-input,
    .form-select {
      height: 40px;
      padding: 0 14px;
      border: 1px solid #16160C1A;
      border-radius: 8px;
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      color: #16160C;
      background: #ffffff;
    }

    .form-input {
      flex: 1;
    }

    .form-input:focus,
    .form-select:focus {
      outline: none;
      border-color: #16160C;
    }

    .table-container {
      background: #ffffff;
      border-radius: 12px;
      border: 1px solid #16160C1A;
      overflow: hidden;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
    }

    .data-table th {
      text-align: left;
      padding: 12px 16px;
      font-family: 'DM Sans', sans-serif;
      font-size: 12px;
      font-weight: 600;
      color: #7A7A7A;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid #16160C1A;
    }

    .data-table td {
      padding: 12px 16px;
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      color: #16160C;
      border-bottom: 1px solid #16160C0D;
    }

    .data-table tbody tr:last-child td {
      border-bottom: none;
    }

    .badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }

    .badge-viewer { background: #F5F0F0; color: #7A7A7A; }
    .badge-admin { background: #C4956A33; color: #9A6F41; }
    .badge-superadmin { background: #16160C; color: #ffffff; }
    .badge-active { background: #4A7C59; color: #ffffff; }
    .badge-deactivated { background: #16160C1A; color: #7A7A7A; }

    .inline-input,
    .inline-select {
      height: 32px;
      padding: 0 8px;
      border: 1px solid #16160C1A;
      border-radius: 6px;
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
    }

    .actions {
      display: flex;
      gap: 8px;
    }

    .icon-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background: none;
      border: 1px solid #16160C1A;
      border-radius: 6px;
      cursor: pointer;
      color: #16160C;
    }

    .icon-btn:hover {
      background: #F5F0F0;
    }

    .empty-cell {
      text-align: center;
      color: #7A7A7A;
      padding: 32px 16px !important;
    }
  `,
})
export class UserListPage implements OnInit {
  private readonly usersService = inject(UsersService);

  readonly users = signal<User[]>([]);
  readonly showInviteForm = signal(false);
  readonly editingUserId = signal<string | null>(null);

  inviteEmail = '';
  inviteRole = 'Viewer';
  editName = '';
  editRole = '';

  ngOnInit(): void {
    this.loadUsers();
  }

  onInvite(): void {
    if (!this.inviteEmail) return;
    this.usersService
      .invite({ email: this.inviteEmail, role: this.inviteRole as UserRole })
      .subscribe(() => {
        this.inviteEmail = '';
        this.inviteRole = 'Viewer';
        this.showInviteForm.set(false);
        this.loadUsers();
      });
  }

  onStartEdit(user: User): void {
    this.editingUserId.set(user.id);
    this.editName = user.name;
    this.editRole = user.role;
  }

  onSaveEdit(user: User): void {
    this.usersService
      .update(user.id, {
        name: this.editName || undefined,
        role: (this.editRole as UserRole) || undefined,
      })
      .subscribe(() => {
        this.editingUserId.set(null);
        this.loadUsers();
      });
  }

  onDeactivate(user: User): void {
    if (confirm(`Are you sure you want to deactivate ${user.name}?`)) {
      this.usersService.deactivate(user.id).subscribe(() => this.loadUsers());
    }
  }

  private loadUsers(): void {
    this.usersService.list().subscribe((result) => {
      this.users.set(result.items);
    });
  }
}
