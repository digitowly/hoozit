import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { Component, ViewEncapsulation } from '@angular/core';

import { IconComponent } from './icon.component';
import { registerIcons } from '../../icons';
import { IconRegistryService } from '../../services/icon-registry/icon-registry.service';

@Component({
  template: '',
  styleUrl: '../../../styles.scss',
  encapsulation: ViewEncapsulation.None,
})
class AppStylesComponent {}

describe('IconComponent', () => {
  let fixture: ComponentFixture<IconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconComponent, AppStylesComponent],
    }).compileComponents();

    registerIcons(TestBed.inject(IconRegistryService));
    TestBed.createComponent(AppStylesComponent);
    fixture = TestBed.createComponent(IconComponent, { inferTagName: true });
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

  it.each(['home', 'map', 'search', 'check', 'cross', 'apple'])(
    'explicitly sizes the injected %s SVG even without width and height attributes',
    async (name) => {
      fixture.componentRef.setInput('name', name);
      await fixture.whenStable();

      const svg = fixture.nativeElement.querySelector('svg');
      expect(svg).not.toBeNull();
      expect(svg.hasAttribute('width')).toBe(false);
      expect(svg.hasAttribute('height')).toBe(false);
      const style = getComputedStyle(svg);
      expect(style.display).toBe('block');
      expect(style.width).toBe('100%');
      expect(style.height).toBe('100%');
      expect(style.flexShrink).toBe('0');
    },
  );
});
