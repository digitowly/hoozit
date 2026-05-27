export interface UserResponse {
  email: string;
  nickname: string;
  image: string;
  role: string;
  account_tier: string;
}

export interface ProfileResponse {
  user: UserResponse;
  occurrences_count: number;
}
