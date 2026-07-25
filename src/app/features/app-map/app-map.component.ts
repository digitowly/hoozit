import {
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime } from 'rxjs';
import { UserLocationService } from '../../services/user/user-location/user-location.service';
import { MapService, MapMarker } from '../../services/map/map-service';
import { LeafletService } from '../../services/map/leaflet/leaflet.service';
import { IconComponent } from '../../components/icon/icon.component';
import { OccurrenceMarkerService } from './services/occurrence-marker/occurrence-marker.service';
import { ScoutLensComponent } from './components/scout-lens/scout-lens.component';
import { SearchResultSelectionService } from '../search/services/search-result-selection/search-result-selection.service';
import { ModalService } from '../../services/modal/modal.service';
import { OccurrencePreviewModalComponent } from '../modals/occurrence-preview-modal/occurrence-preview-modal.component';
import { LogOccurrenceModalComponent } from '../modals/log-occurrence-modal/log-occurrence-modal.component';
import {
  PendingSearchSurface,
  ScoutSearchStateService,
} from './services/scout-search-state/scout-search-state.service';

const MODAL_ID = 'map-marker';
const LOG_OCCURRENCE_MODAL_ID = 'log-occurrence';

const INITIAL_ZOOM = 13;
const SETTLE_DEBOUNCE_MS = 600;

@Component({
  selector: 'app-map',
  imports: [
    IconComponent,
    ScoutLensComponent,
    OccurrencePreviewModalComponent,
    LogOccurrenceModalComponent,
  ],
  providers: [
    {
      provide: MapService,
      useClass: LeafletService,
    },
    ScoutSearchStateService,
  ],
  templateUrl: './app-map.component.html',
  styleUrl: './app-map.component.scss',
})
export class AppMapComponent {
  readonly modalId = MODAL_ID;
  readonly logOccurrenceModalId = LOG_OCCURRENCE_MODAL_ID;
  readonly selectedMarker = signal<MapMarker | null>(null);

  private readonly modalService = inject(ModalService);
  private readonly selectionsService = inject(SearchResultSelectionService);
  private readonly mapService = inject(MapService);
  private readonly userLocation = inject(UserLocationService);
  private readonly markerService = inject(OccurrenceMarkerService);
  readonly scoutSearch = inject(ScoutSearchStateService);

  readonly isModalOpen = computed(() => this.modalService.isOpen(this.modalId));
  readonly isLogOccurrenceModalOpen = computed(() =>
    this.modalService.isOpen(this.logOccurrenceModalId),
  );
  readonly isAnyModalOpen = computed(
    () => this.isModalOpen() || this.isLogOccurrenceModalOpen(),
  );

  private hasInitialCenter = signal(false);
  private readonly settle$ = new Subject<void>();
  private activeSearchId = 0;

  constructor() {
    this.userLocation.getLocation();

    this.loadAfterCameraSettles();
    this.setupMap();
    this.syncLensPhaseWithCamera();
    this.loadInitialSearchWhenMapIsReady();
    this.loadInitialSearchWhenAnchoredUserMoves();
    this.reloadWhenSelectionsChange();
    this.centerOnFirstLocationFix();
    this.repaintUserMarkerOnMove();
  }

  centerToUserLocation() {
    this.mapService.setCenter(this.userLocation.coordinate());
  }

  openLogOccurrenceModal() {
    this.modalService.open(this.logOccurrenceModalId);
  }

  retryLoadOccurrences() {
    this.loadOccurrences(true, this.scoutSearch.retryCoordinate());
  }

  searchHere() {
    this.loadOccurrences(
      true,
      this.scoutSearch.searchHereCoordinate(),
      'ghost',
    );
  }

  refreshOccurrencesAfterLog() {
    this.loadOccurrences(true, this.scoutSearch.retryCoordinate());
  }

  private loadAfterCameraSettles() {
    this.settle$
      .pipe(debounceTime(SETTLE_DEBOUNCE_MS), takeUntilDestroyed())
      .subscribe(() => {
        if (this.scoutSearch.canStartInitialSearch()) this.loadOccurrences();
      });
  }

  private setupMap() {
    const initialLocation = this.userLocation.coordinate();
    effect(() => {
      this.mapService.init(initialLocation, INITIAL_ZOOM);
      this.mapService.registerLongPress(() => this.openLogOccurrenceModal());
      this.mapService.onCameraSettle(() => this.settle$.next());
    });
  }

  private syncLensPhaseWithCamera() {
    effect(() => {
      this.scoutSearch.updateLensPhase();
    });
  }

  private loadInitialSearchWhenMapIsReady() {
    effect(() => {
      this.mapService.camera();
      if (!this.scoutSearch.canStartInitialSearch()) return;
      untracked(() => this.loadOccurrences());
    });
  }

  private loadInitialSearchWhenAnchoredUserMoves() {
    effect(() => {
      if (!this.userLocation.isValid()) return;
      this.userLocation.coordinate();
      untracked(() => {
        if (!this.scoutSearch.isAnchored()) return;
        if (this.scoutSearch.canStartInitialSearch()) this.loadOccurrences();
      });
    });
  }

  private reloadWhenSelectionsChange() {
    effect(() => {
      this.selectionsService.selections();
      untracked(() => {
        if (!this.mapService.camera()) return;
        if (
          this.scoutSearch.needsInitialSearch() &&
          !this.scoutSearch.canStartInitialSearch()
        ) {
          return;
        }
        this.loadOccurrences(true, this.scoutSearch.retryCoordinate());
      });
    });
  }

  private centerOnFirstLocationFix() {
    effect(() => {
      if (this.userLocation.isValid() && !this.hasInitialCenter()) {
        this.mapService.setCenter(this.userLocation.coordinate());
        this.hasInitialCenter.set(true);
      }
    });
  }

  private repaintUserMarkerOnMove() {
    effect(() => {
      if (!this.userLocation.isValid()) return;
      this.mapService.repaintUserMarker(this.userLocation.coordinate());
    });
  }

  private loadOccurrences(
    force = false,
    coordinate = this.scoutSearch.searchHereCoordinate(),
    surface: PendingSearchSurface = 'active',
  ) {
    this.cancelActiveSearch();

    if (this.scoutSearch.isZoomedOut()) {
      this.scoutSearch.clearPendingSearch();
      return;
    }

    const searchId = ++this.activeSearchId;
    this.scoutSearch.beginSearch(coordinate, surface);
    this.markerService.createMarkers(
      this.mapService,
      coordinate,
      (marker) => {
        if (this.isActiveSearch(searchId)) this.showMarker(marker);
      },
      {
        force,
        radiusLevel: this.scoutSearch.requestedRadiusLevel(),
        onComplete: () => {
          if (this.isActiveSearch(searchId)) {
            this.scoutSearch.completeSearch(coordinate);
          }
        },
      },
    );
  }

  private cancelActiveSearch() {
    this.markerService.cancelActiveFetch();
    this.activeSearchId++;
  }

  private isActiveSearch(searchId: number) {
    return this.activeSearchId === searchId;
  }

  private showMarker(marker: MapMarker) {
    this.mapService.createMarker(marker, (tapped) => {
      this.modalService.open(this.modalId, 'compact');
      this.selectedMarker.set(tapped);
    });
  }
}
