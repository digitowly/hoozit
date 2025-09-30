export interface GbifSpecies {
  usage: GbifSpeciesUsage;
  diagnostics: GbifSpeciesDiagnostics;
}

interface GbifSpeciesUsage {
  key: string;
  name: string;
  canonicalName: string;
}

interface GbifSpeciesDiagnostics {
  matchType: string;
  confidence: number;
}
