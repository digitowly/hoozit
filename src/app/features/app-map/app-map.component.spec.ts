import {ComponentFixture, TestBed} from '@angular/core/testing';

import {AppMapComponent} from './app-map.component';
import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';

describe('MapComponent', () => {
  let component: AppMapComponent;
  let fixture: ComponentFixture<AppMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppMapComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(AppMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
