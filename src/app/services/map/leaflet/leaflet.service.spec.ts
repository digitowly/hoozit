import { describe, expect, it } from 'vitest';
import * as L from 'leaflet';
import { LeafletService } from './leaflet.service';

describe('LeafletService', () => {
  it('uses a CSS fallback marker when no icon URL is available', () => {
    const icon = createMarkerIcon('');

    expect(icon).toBeInstanceOf(L.DivIcon);
    expect(icon.options.className).toBe('default-marker-icon');
    expect(icon.options.iconSize).toEqual([26, 26]);
    expect(icon.options.iconAnchor).toEqual([13, 26]);
  });

  it('uses the species image marker when an icon URL is available', () => {
    const icon = createMarkerIcon('species-thumbnail.jpg');

    expect(icon).toBeInstanceOf(L.Icon);
    expect(icon.options.className).toBe('marker-icon');
    expect(icon.options.iconUrl).toBe('species-thumbnail.jpg');
  });
});

function createMarkerIcon(iconUrl: string): L.Icon | L.DivIcon {
  return (
    new LeafletService() as unknown as {
      createMarkerIcon(iconUrl: string): L.Icon | L.DivIcon;
    }
  ).createMarkerIcon(iconUrl);
}
