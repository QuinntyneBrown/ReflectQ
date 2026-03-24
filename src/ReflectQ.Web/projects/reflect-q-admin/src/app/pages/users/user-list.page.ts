import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { UsersService } from 'api';
import { User, UserRole } from 'domain';

@Component({
  selector: 'app-user-list-page',
  imports: [FormsModule, DatePipe],
  templateUrl: './user-list.page.html',
  styleUrl: './user-list.page.scss',
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
