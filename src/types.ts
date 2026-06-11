/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Broker {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  whatsapp: string;
  agencyName: string;
  rating: number;
  isVerified: boolean;
  activeListingsCount: number;
}

export interface Community {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone: string;
  location: string;
  createdAt: string;
  activeListingsCount?: number;
}

export interface InvestmentCommunity {
  id: string;
  name: string;
  logo: string;
  coverImage: string;
  district: string;
  neighborhood: string;
  progress: number; // percentage (e.g., 75 for 75%)
  phone: string;
  whatsapp: string;
  description: string;
  blocks: string[]; // list of blocks e.g. ["البلوك A", "البلوك B", "البلوك C"]
}

export interface AdminUserRecord {
  uid: string; // Globally unique immutable auth ID
  name: string; // "مدير النظام العام"
  email: string; // Target administrative secret secure email
  phone: string; // Secret authentication operational phone string
  role: 'admin'; // Static high privilege role flag
  createdAt: string | Date;
}

export type PropertyCategory = 'house' | 'apartment' | 'commercial' | 'land';
export type TransactionType = 'all' | 'sale' | 'rent';

export interface Property {
  id: string;
  title: string;
  description: string;
  priceIQD: number; // in millions of IQD, e.g. 180 (for 180,000,000 IQD)
  priceUSD: number; // in USD
  category: PropertyCategory;
  transactionType: 'sale' | 'rent';
  district: string; // القضاء
  neighborhood: string; // الحي
  addressDetails: string;
  area: number; // in square meters
  rooms?: number;
  bathrooms?: number;
  floors?: number;
  images: string[];
  isPremium: boolean;
  broker: Broker;
  features: string[];
  createdAt: string;
  views: number;
  status?: 'active' | 'pending' | 'sold' | 'rejected';
  propertyStatus?: string;
  deedType?: string;
  constructionStatus?: string;
  latitude?: number;
  longitude?: number;
  locationCoordinates?: { latitude: number; longitude: number };
  
  // Community fields
  belongsToCommunity?: boolean;
  communityId?: string;
  blockIdentifier?: string;
  unitNumber?: string | number;
  availabilityStatus?: 'available' | 'reserved' | 'sold';
}

export interface LeadRequest {
  id: string;
  clientName: string;
  clientPhone: string;
  clientWhatsApp?: string;
  requiredCategory: PropertyCategory | 'all';
  transactionType: 'sale' | 'rent' | 'all';
  preferredDistrict: string;
  preferredNeighborhood: string; // 'كل المناطق' or specific
  budgetMin: number | null;
  budgetMax: number | null;
  minArea: number | null;
  notes?: string;
  createdAt: string;
  status: 'active' | 'matched' | 'closed';
  brokerId: string;
}

export interface FilterState {
  district: string;
  neighborhood: string;
  transactionType: TransactionType;
  category: PropertyCategory | 'all';
  minPriceIQD: string;
  maxPriceIQD: string;
  rooms: string;
  searchQuery: string;
}

export const DISTRICTS = [
  'كل الأقضية',
  'السماوة',
  'الرميثة',
  'الخضر',
  'الوركاء',
  'السلمان',
  'الهلال'
];

export const NEIGHBORHOODS: Record<string, string[]> = {
  'كل الأقضية': [],
  'السماوة': [
    'حي الحكيم',
    'حي الشرطة',
    'الصوب الكبير',
    'الصوب الصغير',
    'حي الغربي',
    'حي القشلة',
    'مجمع تبارك السكني',
    'حي المعلمين',
    'حي صدر القناة',
    'حي الجربوعية'
  ],
  'الرميثة': [
    'حي الشهداء',
    'حي العسكري',
    'الحي الصناعي',
    'منطقة السراي',
    'حي بابل'
  ],
  'الخضر': [
    'حي الخضر الكبير',
    'منطقة الكورنيش',
    'الحي العسكري بالخضر'
  ],
  'الوركاء': [
    'مركز الوركاء',
    'حي السدرة',
    'حي السومريين'
  ],
  'السلمان': [
    'مركز السلمان',
    'حي القلعة'
  ],
  'الهلال': [
    'مركز قضاء الهلال',
    'حي الفرات'
  ]
};

export interface PropertyInquiry {
  id: string;
  propertyId: string;
  propertyTitle: string;
  clientName: string;
  clientPhone: string;
  messageText: string;
  createdAt: string;
  ownerId: string; // The broker/owner ID of the office who owns this property listing
}
