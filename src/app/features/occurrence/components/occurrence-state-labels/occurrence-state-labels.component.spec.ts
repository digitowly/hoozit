import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ModalService } from '../../../../services/modal/modal.service';
import { OccurrencePublicationService } from '../../../../services/occurrence/occurrence-publication/occurrence-publication.service';
import { OccurrenceValidationService } from '../../../../services/occurrence/occurrence-validation/occurrence-validation.service';
import {
  Occurrence,
  SubmissionStatus,
} from '../../../../services/occurrence/occurrence.model';
import { OccurrenceStateLabelsComponent } from './occurrence-state-labels.component';
import { ProfileResponse } from '../../../../services/user/user-data/user-data.model';
import { UserProfileService } from '../../../../services/user/user-data/user-profile.service';

describe('OccurrenceStateLabelsComponent', () => {
  let fixture: ComponentFixture<OccurrenceStateLabelsComponent>;
  let modalService: ModalService;
  const publish = vi.fn();
  const unpublish = vi.fn();
  const validate = vi.fn();
  const loading = signal(false);
  const validationLoading = signal(false);
  const validationError = signal(false);
  const publishError = signal(false);
  const unpublishError = signal(false);
  const profileValue = signal<ProfileResponse | null>(null);
  const profileStatus = signal<
    'idle' | 'loading' | 'reloading' | 'resolved' | 'local' | 'error'
  >('resolved');

  beforeEach(async () => {
    publish.mockReset();
    publish.mockResolvedValue(true);
    unpublish.mockReset();
    unpublish.mockResolvedValue(true);
    validate.mockReset();
    validate.mockReturnValue(true);
    loading.set(false);
    validationLoading.set(false);
    validationError.set(false);
    publishError.set(false);
    unpublishError.set(false);
    profileValue.set(profile());
    profileStatus.set('resolved');

    await TestBed.configureTestingModule({
      imports: [OccurrenceStateLabelsComponent],
      providers: [
        provideRouter([]),
        {
          provide: UserProfileService,
          useValue: {
            profileResource: {
              status: profileStatus,
              value: () => {
                if (profileStatus() === 'error') {
                  throw new Error('Profile unavailable');
                }
                return profileValue();
              },
            },
          },
        },
        {
          provide: OccurrencePublicationService,
          useValue: {
            isLoading: loading,
            publish,
            unpublish,
            canPublish: (value: Occurrence) =>
              !value.is_visible &&
              value.status === SubmissionStatus.GEO_REGION_VERIFIED,
            isPublishing: () => false,
            isUnpublishing: () => false,
            hasPublishError: () => publishError(),
            hasUnpublishError: () => unpublishError(),
          },
        },
        {
          provide: OccurrenceValidationService,
          useValue: {
            resource: { isLoading: validationLoading },
            validate,
            isValidating: () => false,
            hasError: () => validationError(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OccurrenceStateLabelsComponent);
    fixture.componentRef.setInput('occurrence', occurrence());
    fixture.detectChanges();
    await fixture.whenStable();

    modalService = TestBed.inject(ModalService);
  });

  afterEach(() => {
    modalService.closeAll();
    fixture.destroy();
  });

  it('renders matching status and visibility capsules', () => {
    expect(
      fixture.nativeElement.querySelector('.status-chip').textContent,
    ).toContain('Region verified');
    expect(
      fixture.nativeElement.querySelector('.visibility-chip').textContent,
    ).toContain('Public');
  });

  it('opens validation progress from the status control', () => {
    fixture.nativeElement.querySelector('.status-chip').click();
    expect(modalService.isOpen('occurrence-validation-occurrence-id')).toBe(
      true,
    );
  });

  it('opens visibility settings from the visibility control', () => {
    fixture.nativeElement.querySelector('.visibility-chip').click();
    expect(modalService.isOpen('occurrence-visibility-occurrence-id')).toBe(
      true,
    );
  });

  it('replaces validation progress with visibility settings and back', async () => {
    fixture.nativeElement.querySelector('.status-chip').click();
    await fixture.whenStable();
    expect(document.querySelectorAll('.modal')).toHaveLength(1);
    expect(document.querySelector('.modal')?.textContent).toContain(
      'Verification progress',
    );

    fixture.nativeElement.querySelector('.visibility-chip').click();
    await fixture.whenStable();
    expect(modalService.isOpen('occurrence-validation-occurrence-id')).toBe(
      false,
    );
    expect(document.querySelectorAll('.modal')).toHaveLength(1);
    expect(document.querySelector('.modal')?.textContent).toContain(
      'Who can see this observation?',
    );

    fixture.nativeElement.querySelector('.status-chip').click();
    await fixture.whenStable();
    expect(modalService.isOpen('occurrence-visibility-occurrence-id')).toBe(
      false,
    );
    expect(document.querySelectorAll('.modal')).toHaveLength(1);
    expect(document.querySelector('.modal')?.textContent).toContain(
      'Verification progress',
    );
  });

  it('unpublishes a public occurrence and emits a visibility change', async () => {
    const changed = vi.fn();
    fixture.componentInstance.visibilityChanged.subscribe(changed);
    modalService.open('occurrence-visibility-occurrence-id', 'compact');

    await (fixture.componentInstance as any).updateVisibility();

    expect(unpublish).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'occurrence-id', is_visible: true }),
    );
    expect(changed).toHaveBeenCalledOnce();
    expect(modalService.isOpen('occurrence-visibility-occurrence-id')).toBe(
      false,
    );
  });

  it('publishes an eligible private occurrence', async () => {
    fixture.componentRef.setInput('occurrence', {
      ...occurrence(),
      is_visible: false,
    });
    fixture.detectChanges();

    await (fixture.componentInstance as any).updateVisibility();

    expect(publish).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'occurrence-id', is_visible: false }),
    );
  });

  it('validates an unpublished draft occurrence', () => {
    fixture.componentRef.setInput('occurrence', {
      ...occurrence(),
      status: SubmissionStatus.DRAFT,
      is_visible: false,
    });
    fixture.detectChanges();

    (fixture.componentInstance as any).validateOccurrence();

    expect(validate).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'occurrence-id' }),
    );
  });

  it('lets the owner start verification of a draft from its verification control', async () => {
    fixture.componentRef.setInput('occurrence', {
      ...occurrence(),
      status: SubmissionStatus.DRAFT,
      is_visible: false,
    });
    await fixture.whenStable();
    const control = fixture.nativeElement.querySelector('.status-chip');
    expect(control.querySelector('.control-action').textContent).toContain(
      'Verify',
    );
    control.click();
    await fixture.whenStable();
    const action = document.querySelector<HTMLButtonElement>(
      '.validation-modal-content .validate-button',
    );
    expect(action?.textContent).toContain('Verify observation');
    expect(action?.disabled).toBe(false);
    action!.click();
    expect(validate).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'occurrence-id',
        status: SubmissionStatus.DRAFT,
      }),
    );
    expect(publish).not.toHaveBeenCalled();
    expect(fixture.componentInstance.occurrence().is_visible).toBe(false);

    fixture.componentRef.setInput('occurrence', {
      ...occurrence(),
      is_visible: false,
    });
    await fixture.whenStable();
    expect(
      document.querySelector('.validation-modal-content .validate-button'),
    ).toBeNull();
    expect(control.querySelector('.control-action').textContent).toContain(
      'Details',
    );
  });

  it('keeps verification information read-only for another observer’s draft', async () => {
    profileValue.set(null);
    fixture.componentRef.setInput('occurrence', {
      ...occurrence(),
      status: SubmissionStatus.DRAFT,
      is_visible: false,
    });
    await fixture.whenStable();
    const control = fixture.nativeElement.querySelector('.status-chip');
    expect(control.querySelector('.control-action').textContent).toContain(
      'Details',
    );
    control.click();
    await fixture.whenStable();
    expect(
      document.querySelector('.validation-modal-content .validate-button'),
    ).toBeNull();
    (fixture.componentInstance as any).validateOccurrence();
    expect(validate).not.toHaveBeenCalled();
  });

  it('disables draft verification while a verification request is pending', async () => {
    fixture.componentRef.setInput('occurrence', {
      ...occurrence(),
      status: SubmissionStatus.DRAFT,
      is_visible: false,
    });
    await fixture.whenStable();
    fixture.nativeElement.querySelector('.status-chip').click();
    validationLoading.set(true);
    await fixture.whenStable();
    const action = document.querySelector<HTMLButtonElement>(
      '.validation-modal-content .validate-button',
    );
    expect(action?.disabled).toBe(true);
    action!.click();
    (fixture.componentInstance as any).validateOccurrence();
    expect(validate).not.toHaveBeenCalled();
  });

  it('shows verification errors and allows retrying directly in the verification dialog', async () => {
    fixture.componentRef.setInput('occurrence', {
      ...occurrence(),
      status: SubmissionStatus.DRAFT,
      is_visible: false,
    });
    await fixture.whenStable();
    fixture.nativeElement.querySelector('.status-chip').click();
    await fixture.whenStable();
    validate.mockImplementationOnce(() => {
      validationError.set(true);
      return true;
    });
    document
      .querySelector<HTMLButtonElement>(
        '.validation-modal-content .validate-button',
      )!
      .click();
    await fixture.whenStable();
    expect(
      document.querySelector('.validation-modal-content [role="alert"]')
        ?.textContent,
    ).toContain('Verification failed');
    const retry = document.querySelector<HTMLButtonElement>(
      '.validation-modal-content .validate-button',
    )!;
    expect(retry.disabled).toBe(false);
    retry.click();
    expect(validate).toHaveBeenCalledTimes(2);
    expect(publish).not.toHaveBeenCalled();
  });

  it.each([true, false])(
    'shows the owner publication action when public is %s',
    async (isVisible) => {
      fixture.componentRef.setInput('occurrence', {
        ...occurrence(),
        is_visible: isVisible,
      });
      const modal = await openVisibilityModal();

      expect(
        modal.querySelector(
          isVisible ? '.unpublish-button' : '.publish-button',
        ),
      ).toBeTruthy();
    },
  );

  it.each([true, false])(
    'hides publication actions and blocks handler calls for another author when public is %s',
    async (isVisible) => {
      profileValue.set({
        ...profile(),
        user: { ...profile().user, id: 'another-user-id' },
      });
      fixture.componentRef.setInput('occurrence', {
        ...occurrence(),
        is_visible: isVisible,
      });
      const modal = await openVisibilityModal();

      expect(modal.querySelector('.visibility-action')).toBeNull();
      expect(modal.textContent).toContain(
        isVisible ? 'Anyone can see' : 'not shared publicly',
      );
      await (fixture.componentInstance as any).updateVisibility();

      expect(publish).not.toHaveBeenCalled();
      expect(unpublish).not.toHaveBeenCalled();
    },
  );

  it.each(['idle', 'loading', 'reloading', 'error'] as const)(
    'hides publication actions when the profile is %s',
    async (status) => {
      profileStatus.set(status);
      const modal = await openVisibilityModal();

      expect(modal.querySelector('.visibility-action')).toBeNull();
      await (fixture.componentInstance as any).updateVisibility();
      expect(unpublish).not.toHaveBeenCalled();
    },
  );

  it.each(['user', 'author'] as const)(
    'hides publication actions when the %s ID is missing',
    async (missingId) => {
      if (missingId === 'user') {
        const { id, ...user } = profile().user;
        profileValue.set({ ...profile(), user } as ProfileResponse);
      } else {
        const { id, ...author } = occurrence().author;
        fixture.componentRef.setInput('occurrence', {
          ...occurrence(),
          author,
        });
      }
      const modal = await openVisibilityModal();

      expect(modal.querySelector('.visibility-action')).toBeNull();
    },
  );

  it('does not match empty user and author IDs', async () => {
    profileValue.set({
      ...profile(),
      user: { ...profile().user, id: '' },
    });
    fixture.componentRef.setInput('occurrence', {
      ...occurrence(),
      author: { ...occurrence().author, id: '' },
    });

    const modal = await openVisibilityModal();

    expect(modal.querySelector('.visibility-action')).toBeNull();
  });

  it('updates an open modal after logout and account changes', async () => {
    const modal = await openVisibilityModal();
    expect(modal.querySelector('.unpublish-button')).toBeTruthy();

    profileValue.set(null);
    await fixture.whenStable();
    expect(modal.querySelector('.unpublish-button')).toBeNull();

    profileValue.set(profile());
    await fixture.whenStable();
    expect(modal.querySelector('.unpublish-button')).toBeTruthy();

    profileValue.set({
      ...profile(),
      user: { ...profile().user, id: 'another-user-id' },
    });
    await fixture.whenStable();
    expect(modal.querySelector('.unpublish-button')).toBeNull();
  });

  it('keeps publish hidden before geographic verification for the owner', async () => {
    fixture.componentRef.setInput('occurrence', {
      ...occurrence(),
      status: SubmissionStatus.NAME_VERIFIED,
      is_visible: false,
    });
    const modal = await openVisibilityModal();

    expect(modal.querySelector('.publish-button')).toBeNull();
  });

  it.each([true, false])(
    'explains the audience and offers Change for an owner when public is %s',
    (isVisible) => {
      fixture.componentRef.setInput('occurrence', {
        ...occurrence(),
        is_visible: isVisible,
      });
      fixture.detectChanges();
      const control = fixture.nativeElement.querySelector('.visibility-chip');
      expect(control.textContent).toContain(
        isVisible ? 'Visible to everyone' : 'Only visible to you',
      );
      expect(control.textContent).toContain('Change');
      expect(control.getAttribute('aria-controls')).toBe(
        'occurrence-visibility-occurrence-id',
      );
    },
  );

  it('offers information without implying a non-owner can change visibility', async () => {
    profileValue.set(null);
    fixture.componentRef.setInput('occurrence', {
      ...occurrence(),
      is_visible: false,
      status: SubmissionStatus.DRAFT,
    });
    fixture.detectChanges();
    const control = fixture.nativeElement.querySelector('.visibility-chip');
    expect(control.textContent).toContain('Not publicly shared');
    expect(control.textContent).toContain('Details');
    expect(control.textContent).not.toContain('Only visible to you');
    const modal = await openVisibilityModal();
    expect(modal.textContent).toContain('Only the observer can change');
    expect(modal.querySelector('.validate-button')).toBeNull();
    (fixture.componentInstance as any).validateOccurrence();
    expect(validate).not.toHaveBeenCalled();
  });

  it.each([true, false])(
    'names the target audience in the action when public is %s',
    async (isVisible) => {
      fixture.componentRef.setInput('occurrence', {
        ...occurrence(),
        is_visible: isVisible,
      });
      const modal = await openVisibilityModal();
      expect(modal.querySelector('.visibility-action')?.textContent).toContain(
        isVisible ? 'Make private' : 'Make public',
      );
      expect(modal.textContent).toContain('location');
    },
  );

  it('explains that verification does not automatically publish a private draft', async () => {
    fixture.componentRef.setInput('occurrence', {
      ...occurrence(),
      is_visible: false,
      status: SubmissionStatus.DRAFT,
    });
    const modal = await openVisibilityModal();
    expect(modal.textContent).toContain(
      'It stays private until you choose to share it',
    );
    expect(modal.querySelector('.validate-button')?.textContent).toContain(
      'Verify observation',
    );
    modal.querySelector<HTMLButtonElement>('.dialog-link')!.click();
    await fixture.whenStable();
    expect(
      document.querySelector('.validation-modal-content')?.textContent,
    ).toContain('It does not make the observation public');
    document
      .querySelector<HTMLButtonElement>(
        '.validation-modal-content .dialog-link',
      )!
      .click();
    await fixture.whenStable();
    expect(modalService.isOpen('occurrence-visibility-occurrence-id')).toBe(
      true,
    );
  });

  it.each([
    [SubmissionStatus.REJECTED, 'could not be verified'],
    [SubmissionStatus.DELETED, 'has been deleted'],
    [SubmissionStatus.UNKNOWN, 'status is unavailable'],
    [SubmissionStatus.IN_REVIEW, 'verification is in progress'],
  ])('explains why %s cannot be made public', async (status, explanation) => {
    fixture.componentRef.setInput('occurrence', {
      ...occurrence(),
      is_visible: false,
      status,
    });
    const modal = await openVisibilityModal();
    expect(modal.textContent).toContain(explanation);
    expect(modal.querySelector('.publish-button')).toBeNull();
  });

  it.each([true, false])(
    'keeps the current visibility and dialog when saving fails (public=%s)',
    async (isVisible) => {
      fixture.componentRef.setInput('occurrence', {
        ...occurrence(),
        is_visible: isVisible,
      });
      const changed = vi.fn();
      fixture.componentInstance.visibilityChanged.subscribe(changed);
      (isVisible ? unpublish : publish).mockImplementation(async () => {
        (isVisible ? unpublishError : publishError).set(true);
        return false;
      });
      await openVisibilityModal();
      await (fixture.componentInstance as any).updateVisibility();
      expect(modalService.isOpen('occurrence-visibility-occurrence-id')).toBe(
        true,
      );
      expect(changed).not.toHaveBeenCalled();
      expect(fixture.componentInstance.occurrence().is_visible).toBe(isVisible);
      await fixture.whenStable();
      expect(document.querySelector('[role="alert"]')?.textContent).toContain(
        isVisible ? 'It is still public' : 'It is still private',
      );
    },
  );

  it('blocks repeated visibility updates while a request is pending', async () => {
    loading.set(true);
    const modal = await openVisibilityModal();
    expect(
      modal.querySelector<HTMLButtonElement>('.visibility-action')!.disabled,
    ).toBe(true);
    await (fixture.componentInstance as any).updateVisibility();
    expect(unpublish).not.toHaveBeenCalled();
  });

  async function openVisibilityModal(): Promise<HTMLElement> {
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.visibility-chip').click();
    await fixture.whenStable();
    const modal = document.querySelector<HTMLElement>(
      '.visibility-modal-content',
    );
    expect(modal).toBeTruthy();
    return modal!;
  }
});

function occurrence(): Occurrence {
  return {
    id: 'occurrence-id',
    author: { id: 'scout-id', nickname: 'Scout', image: '', role: 'user' },
    submitted_name: 'Red fox',
    description: 'Seen near the forest edge',
    confidence: 90,
    observed_at: '2026-08-19T08:00:00Z',
    status: SubmissionStatus.GEO_REGION_VERIFIED,
    is_visible: true,
    kingdom: 'Animalia',
    detection_method: 'visual',
    evidence_type: 'photo',
    coordinates: { latitude: 52.52, longitude: 13.405 },
  };
}

function profile(): ProfileResponse {
  return {
    user: {
      id: 'scout-id',
      nickname: 'Scout',
      email: 'scout@example.com',
      image: '',
      role: 'user',
      account_tier: 'free',
    },
    occurrences_count: 1,
  };
}
