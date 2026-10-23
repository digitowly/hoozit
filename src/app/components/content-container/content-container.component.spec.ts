import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, it, expect } from 'vitest';
import { ContentContainerComponent } from './content-container.component';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { registerIcons } from '../../icons';
import { IconRegistryService } from '../../services/icon-registry/icon-registry.service';

describe('ContentContainerComponent', () => {
  let component: ContentContainerComponent;
  let fixture: ComponentFixture<ContentContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentContainerComponent],
      providers: [
        provideRouter([
          { path: 'first', component: ContentContainerComponent },
          { path: 'second', component: ContentContainerComponent },
        ]),
      ],
    }).compileComponents();

    registerIcons(TestBed.inject(IconRegistryService));
    fixture = TestBed.createComponent(ContentContainerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('hides the back button when opened directly without an earlier app route', async () => {
    const harness = await RouterTestingHarness.create('/first');

    expect(harness.routeNativeElement?.querySelector('.back-link')).toBeNull();
  });

  it('shows the back chevron on the first navigation within the app', async () => {
    const harness = await RouterTestingHarness.create('/first');

    const destination = await harness.navigateByUrl(
      '/second',
      ContentContainerComponent,
    );

    expect(destination.hasPreviousRoute).toBe(true);
    expect(
      harness.routeNativeElement?.querySelector('.back-link .back-chevron svg'),
    ).toBeTruthy();
  });
});
