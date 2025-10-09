import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ModalComponent } from './modal.component';

describe('ModalComponent', () => {
  let fixture: ComponentFixture<ModalComponent>;
  let component: ModalComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render title and toggle visibility based on isOpen', () => {
    // Initially closed
    fixture.componentRef.setInput('title', 'My Modal');
    fixture.detectChanges();

    const modalEl = fixture.debugElement.query(By.css('.modal'))
      .nativeElement as HTMLElement;

    expect(modalEl.classList).toContain('closed');
    // Backdrop should not exist when closed
    expect(fixture.debugElement.query(By.css('.backdrop'))).toBeNull();

    // Open it
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    expect(modalEl.classList).not.toContain('closed');
    const backdrop = fixture.debugElement.query(By.css('.backdrop'));
    expect(backdrop).not.toBeNull();

    const title = fixture.debugElement.query(By.css('h2'))
      .nativeElement as HTMLElement;
    expect(title.textContent?.trim()).toBe('My Modal');
  });

  it('should emit handleClose when close button is clicked', (done) => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    const sub = component.handleClose.subscribe(() => {
      sub.unsubscribe();
      done();
    });

    const closeBtn = fixture.debugElement.query(By.css('.close-button'))
      .nativeElement as HTMLButtonElement;
    closeBtn.click();
  });

  it('should emit handleClose when backdrop is clicked', (done) => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    const sub = component.handleClose.subscribe(() => {
      sub.unsubscribe();
      done();
    });

    const backdrop = fixture.debugElement.query(By.css('.backdrop'))
      .nativeElement as HTMLElement;
    backdrop.click();
  });

  it('should emit handleClose when Escape key is pressed while open', (done) => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    const sub = component.handleClose.subscribe(() => {
      sub.unsubscribe();
      done();
    });

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  });

  it('should not emit handleClose when Escape key is pressed while closed', (done) => {
    // Ensure closed
    fixture.componentRef.setInput('isOpen', false);
    fixture.detectChanges();

    let emitted = false;
    const sub = component.handleClose.subscribe(() => {
      emitted = true;
    });

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    setTimeout(() => {
      sub.unsubscribe();
      expect(emitted).toBeFalse();
      done();
    }, 0);
  });
});
