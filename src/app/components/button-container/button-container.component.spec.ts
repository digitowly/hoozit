import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { ButtonContainerComponent } from './button-container.component';

@Component({
  imports: [ButtonContainerComponent],
  template: `
    <app-button-container class="custom-gap" direction="vertical" [gap]="6">
      <button>One</button>
      <button>Two</button>
    </app-button-container>
    <app-button-container class="minimum-gap" [gap]="0">
      <button>One</button>
      <button>Two</button>
    </app-button-container>
  `,
})
class ButtonContainerHostComponent {}

describe('ButtonContainerComponent', () => {
  it('projects buttons into a styled container', () => {
    const fixture: ComponentFixture<ButtonContainerHostComponent> =
      TestBed.createComponent(ButtonContainerHostComponent);
    fixture.detectChanges();

    const container: HTMLElement = fixture.nativeElement.querySelector(
      '.custom-gap .button-container',
    );
    const buttons = container.querySelectorAll('button');

    expect(container).toBeTruthy();
    expect(container.classList).toContain('vertical');
    expect(container.style.gap).toBe('6px');
    expect(buttons).toHaveLength(2);
  });

  it('keeps a minimum gap between projected buttons', () => {
    const fixture: ComponentFixture<ButtonContainerHostComponent> =
      TestBed.createComponent(ButtonContainerHostComponent);
    fixture.detectChanges();

    const container: HTMLElement = fixture.nativeElement.querySelector(
      '.minimum-gap .button-container',
    );

    expect(container.style.gap).toBe('5px');
  });
});
