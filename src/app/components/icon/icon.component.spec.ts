import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { IconComponent } from './icon.component';
import { registerIcons } from '../../icons';
import { IconRegistryService } from '../../services/icon-registry/icon-registry.service';

describe('IconComponent', () => {
  let fixture: ComponentFixture<IconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconComponent],
    }).compileComponents();

    registerIcons(TestBed.inject(IconRegistryService));
    fixture = TestBed.createComponent(IconComponent);
    fixture.componentRef.setInput('name', 'chevron');
    await fixture.whenStable();
  });

  it.each([
    ['size-xsmall', '14px'],
    ['size-small', '18px'],
    ['size-medium', '20px'],
    ['size-large', '36px'],
  ])('gives %s icons an explicit square layout', async (size, dimension) => {
    fixture.componentRef.setInput('size', size);
    await fixture.whenStable();

    const wrapper = fixture.nativeElement.querySelector('.icon-wrapper');
    const style = getComputedStyle(wrapper);
    expect(style.width).toBe(dimension);
    expect(style.height).toBe(dimension);
    expect(getComputedStyle(fixture.nativeElement).flexShrink).toBe('0');
  });

  it('sizes the chevron SVG to fill its wrapper with a visible stroke', () => {
    const svg = fixture.nativeElement.querySelector('svg');

    expect(svg.getAttribute('width')).toBe('100%');
    expect(svg.getAttribute('height')).toBe('100%');
    expect(svg.querySelector('polyline').getAttribute('stroke')).toBe(
      'currentColor',
    );
    expect(svg.querySelector('polyline').getAttribute('stroke-width')).toBe(
      '1.5',
    );
  });
});
