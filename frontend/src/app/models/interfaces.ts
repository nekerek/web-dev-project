export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar?: string;
  role?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  price: number;
  total_seats: number;
  available_seats: number;
  image: string;
  category: Category;
  organizer: User;
  organization?: string;
  is_active: boolean;
  created_at: string;
}

export interface Order {
  id: number;
  user: User;
  event: Event;
  quantity: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
}

export interface AuthResponse {
  refresh: string;
  access: string;
  user: User;
}

export interface ProfileSettings {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: string;
  email_notifications: boolean;
  event_reminders: boolean;
  marketing_updates: boolean;
  preferred_category_id: number | null;
  preferred_category_name?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  kind: 'order' | 'event' | 'system';
  created_at: string;
  is_read: boolean;
  action_label?: string;
  action_route?: string;
}
