import { ComponentFixture, TestBed } from "@angular/core/testing";
import { describe, beforeEach, it, expect } from "vitest";
import { ContentContainerComponent } from "./content-container.component";

describe("ContentContainerComponent", () => {
  let component: ContentContainerComponent;
  let fixture: ComponentFixture<ContentContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentContainerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ContentContainerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
