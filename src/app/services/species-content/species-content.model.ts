export interface Source {
  name: string;
  url: string;
  timestamp: string;
}

export interface SpeciesContent {
  binomial_name: string;
  language: string;
  paragraphs: string[];
  sources: Source[];
  title: string;
}

export interface SpeciesImage {
  description: string;
  id: number;
  species_id: number;
  url: string;
  origin: string;
  photographer?: string;
  photographer_url?: string;
}

export interface SpeciesIntroduction {
  content: SpeciesContent;
  image?: SpeciesImage;
  species_id: number;
}
