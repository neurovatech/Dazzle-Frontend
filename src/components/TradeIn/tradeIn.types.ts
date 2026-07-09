// ─── Shared Types ─────────────────────────────────────────────────────────────

export type TradeInStep = 0 | 1 | 2 | 3 | 4;

export interface TradeInCategory {
  uuid: string;
  category_name: string;
  category_slug: string;
  thumbnail_img: string;
  is_active: boolean;
  is_trade_in: boolean;
}

export interface TradeInBrand {
  uuid: string;
  brand_name: string;
  brand_slug: string;
  thumbnail_img: string;
  is_active: boolean;
  is_trade_in: boolean;
}

// ─── /tradein API types ───────────────────────────────────────────────────────

export interface TradeInVariantSummary {
  tradeVariantUuid: string;
  variantName: string;
  thumbnailUrl: string;
}

export interface TradeInDevice {
  tradeInUuid: string;
  deviceName: string;
  tradeVariants: TradeInVariantSummary[];
}

export interface TradeInListResponse {
  statusCode: number;
  status: string;
  found: boolean;
  count: number;
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  data: TradeInDevice[];
}

// ─── /tradein-variant API types ───────────────────────────────────────────────

export interface TradeInConditionItem {
  ticId: number;
  title: string;
  condition: string;
  devicePrice: number;
}

export interface TradeInAttrItem {
  tradeInAttrId: number;
  attrId: number;
  attrUuid: string;
  attbrVariation: string;
  attributes: string;
}

export interface TradeInAttribute {
  attbrName: string;
  items: TradeInAttrItem[];
}

export interface TradeInVariantDetail {
  tradeVariantId: number;
  tradeVariantUuid: string;
  variantName: string;
  thumbnailUrl: string;
  tradeInConditions: TradeInConditionItem[];
  tradeInAttributes: TradeInAttribute[];
}

export interface TradeInVariantResponse {
  statusCode: number;
  status: string;
  found: boolean;
  data: TradeInVariantDetail[];
}

// ─── Selection state ──────────────────────────────────────────────────────────

export interface TradeInSelection {
  category:  TradeInCategory | null;
  brand:     TradeInBrand | null;
  device:    TradeInDevice | null;
  variant:   TradeInVariantSummary | null;
  condition: TradeInConditionItem | null;
}

// ─── Collection form ──────────────────────────────────────────────────────────

export interface CollectionFormData {
  city: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  area: string;
  pickupDate: string;
  building: string;
  floor: string;
  agreeTerms: boolean;
}
