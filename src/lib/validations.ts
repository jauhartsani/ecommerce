import { z } from "zod";

export const orderSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  whatsapp: z
    .string()
    .min(10, "Nomor WhatsApp tidak valid")
    .regex(/^(\+62|62|0)8[1-9][0-9]{7,10}$/, "Format nomor WA tidak valid (contoh: 08123456789)"),
  email: z.string().email("Email tidak valid").or(z.literal("")).optional(),
  address: z.string().min(10, "Alamat minimal 10 karakter"),
  product_id: z.string().min(1, "Pilih produk terlebih dahulu"),
  quantity: z.number().min(1).max(100).default(1),
  notes: z.string().optional(),
});

export type OrderFormData = z.infer<typeof orderSchema>;

export const settingsSchema = z.object({
  site_name: z.string().min(2, "Nama website minimal 2 karakter"),
  whatsapp_number: z
    .string()
    .regex(/^(\+62|62|0)8[1-9][0-9]{7,10}$/, "Format nomor WA tidak valid"),
  bank_name: z.string().min(2, "Nama bank minimal 2 karakter"),
  account_number: z.string().min(5, "Nomor rekening tidak valid"),
  account_holder: z.string().min(3, "Nama pemilik rekening minimal 3 karakter"),
  seo_title_suffix: z.string().optional(),
  seo_description: z.string().optional(),
});

export type SettingsFormData = z.infer<typeof settingsSchema>;
