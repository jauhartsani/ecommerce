export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      banners: {
        Row: {
          id: string;
          section: string;
          image_url: string;
          link_url: string | null;
          alt_text: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          section: string;
          image_url: string;
          link_url?: string | null;
          alt_text?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          section?: string;
          image_url?: string;
          link_url?: string | null;
          alt_text?: string | null;
          sort_order?: number;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          price: number;
          original_price: number | null;
          description: string | null;
          long_description: string | null;
          image_url: string | null;
          gallery_urls: string[] | null;
          category: string | null;
          tiktok_url: string | null;
          is_active: boolean;
          is_featured: boolean;
          is_flash_sale: boolean;
          stock: number;
          sold_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          price: number;
          original_price?: number | null;
          description?: string | null;
          long_description?: string | null;
          image_url?: string | null;
          gallery_urls?: string[] | null;
          category?: string | null;
          tiktok_url?: string | null;
          is_active?: boolean;
          is_featured?: boolean;
          is_flash_sale?: boolean;
          stock?: number;
          sold_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          price?: number;
          original_price?: number | null;
          description?: string | null;
          long_description?: string | null;
          image_url?: string | null;
          gallery_urls?: string[] | null;
          category?: string | null;
          tiktok_url?: string | null;
          is_active?: boolean;
          is_featured?: boolean;
          is_flash_sale?: boolean;
          stock?: number;
          sold_count?: number;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          order_id: string;
          name: string;
          whatsapp: string;
          email: string | null;
          address: string;
          product_id: string;
          product_name: string;
          quantity: number;
          notes: string | null;
          status: "baru" | "diproses" | "selesai" | "dibatalkan";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          name: string;
          whatsapp: string;
          email?: string | null;
          address: string;
          product_id: string;
          product_name: string;
          quantity: number;
          notes?: string | null;
          status?: "baru" | "diproses" | "selesai" | "dibatalkan";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: "baru" | "diproses" | "selesai" | "dibatalkan";
          updated_at?: string;
        };
      };
      settings: {
        Row: { id: string; key: string; value: string; updated_at: string };
        Insert: { id?: string; key: string; value: string; updated_at?: string };
        Update: { value?: string; updated_at?: string };
      };
    };
  };
}

export type Banner = Database["public"]["Tables"]["banners"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type Setting = Database["public"]["Tables"]["settings"]["Row"];
export type OrderStatus = Order["status"];

export interface SiteSettings {
  site_name: string;
  whatsapp_number: string;
  bank_name: string;
  account_number: string;
  account_holder: string;
  seo_title_suffix?: string;
  seo_description?: string;
}
