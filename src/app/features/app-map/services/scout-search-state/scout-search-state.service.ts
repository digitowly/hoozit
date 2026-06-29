import { computed, inject, Injectable, signal } from '@angular/core';
import { Coordinate } from '../../../../model/coordinate';
import { UserLocationService } from '../../../../services/user/user-location/user-location.service';
import { MapCamera, MapService } from '../../../../services/map/map-service';
import { ScoutLensService } from '../scout-lens/scout-lens.service';
import { OccurrenceMarkerService } from '../occurrence-marker/occurrence-marker.service';
import {
  OCCURRENCE_SEARCH_DEFAULT_RADIUS_LEVEL,
  occurrenceSearchRadiusLevelForZoom,
  occurrenceSearchRadiusMetersForLevel,
  OccurrenceSearchRadiusLevel,
  isOccurrenceSearchRadiusLevelLarger,
} from '../../../../services/occurrence/occurrence-search/occurrence-search.model';
import { GeoHelper } from '../../../../utils/geo/geo-helper';

const LENS_RADIUS_MIN_PX = 16;
const LENS_RADIUS_MAX_PX = 4000;

export type PendingSearchSurface = 'active' | 'ghost';

export interface ScoutLensPoint {
  x: number;
  y: number;
}

export interface ScoutLensCircle extends ScoutLensPoint {
  radius: number;
  loading: boolean;
  failed?: boolean;
}

@Injectable()
export class ScoutSearchStateService {
  private readonly userLocation = inject(UserLocationService);
  private readonly mapService = inject(MapService);
  private readonly scoutLens = inject(ScoutLensService);
  private readonly markerService = inject(OccurrenceMarkerService);

  readonly phase = this.scoutLens.phase;
  readonly isLoading = signal(false);
  readonly committedCoordinate = signal<Coordinate | null>(null);
  private readonly committedRadiusLevel = signal<OccurrenceSearchRadiusLevel>(
    OCCURRENCE_SEARCH_DEFAULT_RADIUS_LEVEL,
  );

  private readonly pendingCoordinate = signal<Coordinate | null>(null);
  private readonly pendingSurface = signal<PendingSearchSurface | null>(null);

  readonly requestedRadiusLevel = computed(() => {
    const camera = this.mapService.camera();
    return camera
      ? occurrenceSearchRadiusLevelForZoom(camera.zoom)
      : OCCURRENCE_SEARCH_DEFAULT_RADIUS_LEVEL;
  });

  readonly activeLensRadiusLevel = computed(() =>
    this.committedCoordinate()
      ? this.committedRadiusLevel()
      : this.requestedRadiusLevel(),
  );

  readonly activeLens = computed<ScoutLensCircle>(() => {
    const camera = this.mapService.camera();
    if (!camera) return this.emptyLens();

    return {
      ...this.project(
        this.committedCoordinate() ?? this.initialSearchTargetCoordinate(),
        camera,
      ),
      radius: this.radiusPixels(this.activeLensRadiusLevel()),
      loading: this.isLoading() && !this.isGhostLoading(),
      failed: this.markerService.lastLoadFailed(),
    };
  });

  readonly ghostLens = computed<ScoutLensCircle | null>(() => {
    if (!this.showSearchHere() && !this.isGhostLoading()) return null;

    const camera = this.mapService.camera();
    if (!camera) return null;

    return {
      ...this.project(
        this.pendingGhostCoordinate() ?? this.searchHereCoordinate(),
        camera,
      ),
      radius: this.radiusPixels(this.requestedRadiusLevel()),
      loading: this.isGhostLoading(),
    };
  });

  readonly userIndicator = computed<ScoutLensPoint | null>(() => {
    const camera = this.mapService.camera();
    if (!camera || !this.userLocation.isValid()) return null;
    return this.project(this.userLocation.coordinate(), camera);
  });

  readonly isGhostLoading = computed(
    () => this.isLoading() && this.pendingGhostCoordinate() !== null,
  );

  readonly isZooming = computed(
    () => this.mapService.camera()?.isZooming ?? false,
  );

  updateLensPhase() {
    const camera = this.mapService.camera();
    if (!camera) return;
    this.scoutLens.update({
      zoom: camera.zoom,
      userOffset: this.userOffset(camera),
    });
  }

  isZoomedOut() {
    return this.phase() === 'zoomedOut';
  }

  isAnchored() {
    return this.phase() === 'anchored';
  }

  needsInitialSearch() {
    return !this.committedCoordinate();
  }

  canStartInitialSearch() {
    return (
      !this.isZoomedOut() &&
      this.needsInitialSearch() &&
      !this.isLoading() &&
      this.userLocation.hasResolved()
    );
  }

  retryCoordinate() {
    return this.committedCoordinate() ?? this.searchHereCoordinate();
  }

  searchHereCoordinate() {
    if (!this.committedCoordinate())
      return this.initialSearchTargetCoordinate();
    return (
      this.mapService.camera()?.center ??
      this.committedCoordinate() ??
      this.userLocation.coordinate()
    );
  }

  beginSearch(coordinate: Coordinate, surface: PendingSearchSurface) {
    this.pendingCoordinate.set(coordinate);
    this.pendingSurface.set(surface);
    this.isLoading.set(true);
  }

  completeSearch(coordinate: Coordinate) {
    this.committedRadiusLevel.set(this.markerService.activeRadiusLevel());
    this.committedCoordinate.set(coordinate);
    this.clearPendingSearch();
  }

  clearPendingSearch() {
    this.pendingCoordinate.set(null);
    this.pendingSurface.set(null);
    this.isLoading.set(false);
  }

  private showSearchHere() {
    if (this.isZoomedOut()) return false;
    const committedCoordinate = this.committedCoordinate();
    if (!committedCoordinate) return false;

    const committedRadiusKm =
      occurrenceSearchRadiusMetersForLevel(
        this.markerService.activeRadiusLevel(),
      ) / 1_000;
    const movedOutsideCommittedLens =
      GeoHelper.getDistance(this.searchHereCoordinate(), committedCoordinate) >
      committedRadiusKm;
    const requestedLargerRadius = isOccurrenceSearchRadiusLevelLarger(
      this.requestedRadiusLevel(),
      this.markerService.activeRadiusLevel(),
    );

    return movedOutsideCommittedLens || requestedLargerRadius;
  }

  private initialSearchTargetCoordinate() {
    if (this.userLocation.isValid()) return this.userLocation.coordinate();
    return this.mapService.camera()?.center ?? this.userLocation.coordinate();
  }

  private pendingGhostCoordinate() {
    const coordinate = this.pendingCoordinate();
    if (!coordinate || this.pendingSurface() !== 'ghost') return null;
    return coordinate;
  }

  private radiusPixels(level: OccurrenceSearchRadiusLevel) {
    const radius = this.mapService.metersToPixels(
      occurrenceSearchRadiusMetersForLevel(level),
    );
    return Math.min(Math.max(radius, LENS_RADIUS_MIN_PX), LENS_RADIUS_MAX_PX);
  }

  private project(coordinate: Coordinate, camera: MapCamera): ScoutLensPoint {
    const point = this.mapService.projectToContainer(coordinate);
    return point ?? { x: camera.width / 2, y: camera.height / 2 };
  }

  private emptyLens(): ScoutLensCircle {
    return { x: 0, y: 0, radius: 0, loading: false, failed: false };
  }

  private userOffset(camera: MapCamera) {
    if (!this.userLocation.isValid()) return null;
    if (camera.width === 0 || camera.height === 0) return null;
    const point = this.mapService.projectToContainer(
      this.userLocation.coordinate(),
    );
    if (!point) return null;
    return {
      nx: Math.abs(point.x - camera.width / 2) / camera.width,
      ny: Math.abs(point.y - camera.height / 2) / camera.height,
    };
  }
}
