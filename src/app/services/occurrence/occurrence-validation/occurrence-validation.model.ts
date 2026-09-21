import { SubmissionStatus } from '../occurrence.model';

export interface OccurrenceValidationResponse {
  id: string;
  status: SubmissionStatus;
  validation: {
    has_specific_name: boolean | null;
    has_valid_continent: boolean | null;
    has_valid_country: boolean | null;
    has_valid_region: boolean | null;
    has_valid_locality: boolean | null;
  };
}
