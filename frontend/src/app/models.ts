export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface Listing {
  id: number;
  owner: string;
  category: number;
  category_name: string;
  title: string;
  description: string;
  price: string;
  campus_location: string;
  status: string;
  created_at: string;
}

export interface ListingPayload {
  category: number | null;
  title: string;
  description: string;
  price: number | null;
  campus_location: string;
}

export interface LoginResponse {
  token: string;
  username: string;
}
