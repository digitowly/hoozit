import {ComponentFixture, TestBed} from '@angular/core/testing';

import {MapViewComponent} from './map-view.component';
import {AppMapComponent} from '../app-map/app-map.component';
import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';

describe('MapViewComponent', () => {
  let component: MapViewComponent;
  let fixture: ComponentFixture<MapViewComponent>;


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapViewComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MapViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
