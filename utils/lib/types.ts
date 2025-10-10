export interface Vendor {
  _id: string
  creatorId: string
  title: string
  slug: string
  image: string
  available: boolean
  views: number
  loc: {
    type: string
    coordinates: number[]
  }
  address: {
    longitude: number
    latitude: number
    city: string
  }
  archive: boolean
  createdAt?: string
  updatedAt?: string
}

export interface Category {
  _id: string
  title: string
  image: string
  slug: string
  vendorId: string
  archive: boolean
  createdAt?: string
  updatedAt?: string
}

export interface Product {
  _id: string
  title: string
  slug: string
  original_price: number
  discounted_price?: number
  description: string
  images: string[]
  vendorId: string
  categoryId: string
  size?: Array<{
    title: string
    is_stock: number
  }>
  is_stock?: number
  rating?: number
  reviews?: number
  trending?: boolean
  warranty?: string
  views?: number
  archive?: boolean
  priceUpdatedAt?: Date
  createdAt?: string
  updatedAt?: string
  videoUrl?: string
}

export interface WhatsAppMessage {
  id: string
  from: string
  timestamp: string
  type: "text" | "image" | "audio" | "video" | "document"
  text?: {
    body: string
  }
  image?: {
    id: string
    mime_type: string
    sha256: string
    caption?: string
  }
}

export interface WhatsAppWebhookBody {
  object: string
  entry: Array<{
    id: string
    changes: Array<{
      value: {
        messaging_product: string
        metadata: {
          display_phone_number: string
          phone_number_id: string
        }
        messages?: WhatsAppMessage[]
      }
      field: string
    }>
  }>
}
