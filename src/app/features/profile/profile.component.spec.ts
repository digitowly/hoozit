import { describe, beforeEach, it, expect, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileComponent } from './profile.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { ModalService } from '../../services/modal/modal.service';
import { UserProfileService } from '../../services/user/user-data/user-profile.service';

describe('UserComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideZonelessChangeDetection(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('only accepts the confirmation word', () => {
    expect(component.isDeleteWordTyped()).toBe(false);

    component.typedDeleteWord.set('DELET');
    expect(component.isDeleteWordTyped()).toBe(false);

    component.typedDeleteWord.set(' delete ');
    expect(component.isDeleteWordTyped()).toBe(true);
  });

  it('forgets the typed word and the error when cancelling', () => {
    component.openDeleteConfirmation();
    component.typedDeleteWord.set('DELETE');
    component.hasDeleteFailed.set(true);

    component.cancelDelete();

    expect(TestBed.inject(ModalService).isOpen('delete-account')).toBe(false);
    expect(component.typedDeleteWord()).toBe('');
    expect(component.hasDeleteFailed()).toBe(false);
  });

  it('keeps the typed word when cancelling during a delete', () => {
    component.typedDeleteWord.set('DELETE');
    component.isDeleting.set(true);

    component.cancelDelete();

    expect(component.typedDeleteWord()).toBe('DELETE');
  });

  it('ignores a second delete while one is running', async () => {
    const service = TestBed.inject(UserProfileService);
    const deleteAccount = vi
      .spyOn(service, 'deleteAccount')
      .mockResolvedValue();

    await Promise.all([component.deleteAccount(), component.deleteAccount()]);

    expect(deleteAccount).toHaveBeenCalledOnce();
  });

  it('closes the confirmation after deleting the account', async () => {
    const service = TestBed.inject(UserProfileService);
    vi.spyOn(service, 'deleteAccount').mockResolvedValue();
    component.openDeleteConfirmation();

    await component.deleteAccount();

    expect(TestBed.inject(ModalService).isOpen('delete-account')).toBe(false);
    expect(component.hasDeleteFailed()).toBe(false);
    expect(component.isDeleting()).toBe(false);
  });

  it('keeps the confirmation open when deleting fails', async () => {
    const service = TestBed.inject(UserProfileService);
    vi.spyOn(service, 'deleteAccount').mockRejectedValue(new Error('failed'));
    component.openDeleteConfirmation();

    await component.deleteAccount();

    expect(TestBed.inject(ModalService).isOpen('delete-account')).toBe(true);
    expect(component.hasDeleteFailed()).toBe(true);
    expect(component.isDeleting()).toBe(false);
  });
});
