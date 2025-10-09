import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FloatingButtonComponent} from './floating-button.component';
import {By} from '@angular/platform-browser';

describe('FloatingButtonComponent', () => {
  let fixture: ComponentFixture<FloatingButtonComponent>;
  let component: FloatingButtonComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FloatingButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FloatingButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit click when button is clicked', (done) => {
    const sub = component.click.subscribe(() => {
      sub.unsubscribe();
      done();
    });

    const buttonElement = fixture.debugElement.query(By.css('.floating-action'))
      .nativeElement as HTMLButtonElement;
    buttonElement.click();
  });
});
