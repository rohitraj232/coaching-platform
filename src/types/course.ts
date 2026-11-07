
export interface Course {
  id: string;
  title: string;
  slug: string;
  class_level: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}
