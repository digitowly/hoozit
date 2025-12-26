import { beforeEach, describe, expect, it } from 'vitest';

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SourceLinkComponent } from './source-link.component';

describe('SourceLinkComponent', () => {
  let component: SourceLinkComponent;
  let fixture: ComponentFixture<SourceLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SourceLinkComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SourceLinkComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
