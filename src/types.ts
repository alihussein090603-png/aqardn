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
