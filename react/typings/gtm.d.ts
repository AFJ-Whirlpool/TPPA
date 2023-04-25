export interface AnalyticsEcommerceProduct {
  id: string
  name: string
  category: string
  brand: string
  variant: string
  price: number
  quantity: number
  dimension1: string
  dimension2: string
  dimension3: string
}

export interface GTAGData {
  items: Partial<GTAGDataItem>[]
  currency?: string
  value?: number
  item_list_id?: string
  item_list_name?: string
  transaction_id?: string
  affiliation?: string
  value?: number
  tax?: number
  shipping?: number
  currency?: string
  coupon?: string
  payment_type?: string
  shipping_tier?: string
}

export interface GTAGDataItem {
  item_id: string
  item_ref: string
  item_ean: string
  item_name: string
  item_list_id: string
  item_list_name: string
  currency: string
  discount: number
  index: number | string
  item_brand: string
  item_category: string
  item_category2: string
  item_category3: string
  item_category4: string
  item_category5: string
  item_category6: string
  item_variant_name: string
  item_variant_ref: string
  item_variant: string
  item_variant_id: string
  item_variant_ean: string
  item_variant_ref: string
  price: number
  quantity: number | string
  affiliation: string
  creative_slot: string
  creative_name: string
  item_availability: string
}
