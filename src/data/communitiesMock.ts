/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { InvestmentCommunity, Property } from '../types';
import { mockBrokers } from '../mockData';

export const mockCommunities: InvestmentCommunity[] = [
  {
    id: 'comm-sudeer',
    name: 'مجمع السدير السكني الاستثماري',
    logo: '🏡',
    coverImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    district: 'السماوة',
    neighborhood: 'حي صدر القناة',
    progress: 88,
    phone: '07802003001',
    whatsapp: '9647802003001',
    description: 'يعد مجمع السدير السكني أحد أرقى وأحدث المشاريع الاستثمارية في قلب مدينة السماوة. يوفر فلل سكنية فخمة وشقق بمواصفات عالمية، مع تغذية كهربائية مستقرة (خط ذهبي)، وشبكة ماء مستقلة، وحراسة أمنية على مدار الساعة، ومدارس وأسواق نموذجية داخل أسوار المجمع.',
    blocks: ['البلوك A', 'البلوك B', 'البلوك C']
  },
  {
    id: 'comm-narjis',
    name: 'مجمع النرجس السكني المتكامل',
    logo: '🌸',
    coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    district: 'الرميثة',
    neighborhood: 'حي بابل',
    progress: 94,
    phone: '07705006002',
    whatsapp: '9647705006002',
    description: 'يقدم مجمع النرجس السكني في الرميثة تجربة معيشية استثنائية للعوائل. يتميز بالتكامل الإنشائي المرتفع، وتصميم فلل بطراز كلاسيكي حديث، ومساحات خضراء شاسعة مخصصة لألعاب الأطفال والأنشطة الاجتماعية والرياضية.',
    blocks: ['البلوك A', 'البلوك B']
  },
  {
    id: 'comm-tabarak',
    name: 'مجمع تبارك السكني الذكي',
    logo: '⭐',
    coverImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    district: 'السماوة',
    neighborhood: 'مجمع تبارك السكني',
    progress: 75,
    phone: '07817008003',
    whatsapp: '9647817008003',
    description: 'مجمع تبارك السكني الذكي في مدينة السماوة يجسد المعيشة العصرية الموفرة للطاقة. يضم شقق سكنية ذكية مزودة بأنظمة تحكم عن بعد، وعزل حراري كامل للجدران وتكييف مركزي متميز، مع توفر جميع الخدمات الصحية والتعليمية والترفيهية.',
    blocks: ['البلوك A', 'البلوك B', 'البلوك C', 'البلوك D']
  }
];

export const getDynamicCommunities = (): InvestmentCommunity[] => {
  const base = [...mockCommunities];
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem('aqarat_cached_communities');
    if (cached) {
      try {
        const list = JSON.parse(cached);
        list.forEach((c: any) => {
          const idx = base.findIndex(x => x.id === c.id);
          const mapped: InvestmentCommunity = {
            id: c.id,
            name: c.name || 'مجمع سكني غير مسمى',
            logo: c.logo || '🏢',
            coverImage: c.coverImage || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
            district: c.location?.split(' - ')?.[0] || c.district || 'السماوة',
            neighborhood: c.location?.split(' - ')?.[1] || c.neighborhood || 'وسط المدينة',
            progress: c.progress !== undefined ? Number(c.progress) : 90,
            phone: c.phone || '07801234567',
            whatsapp: c.phone || '9647801234567',
            description: c.description || 'مجمع سكني استثماري مجهز بالكامل من الفئة المتطورة لتقديم نمط حياة راقٍ.',
            blocks: c.blocks || ['البلوك A', 'البلوك B']
          };
          if (idx > -1) {
            base[idx] = { ...base[idx], ...mapped };
          } else {
            base.push(mapped);
          }
        });
      } catch (e) {
        console.error("Error reading cached communities in helper:", e);
      }
    }
  }
  return base;
};

// Helper to generate units database representation
interface CommunityUnitDef {
  unitNumber: number;
  blockIdentifier: string;
  status: 'available' | 'reserved' | 'sold';
  propertyId?: string; // Links to global Property if available
}

// Generate the standard unit map for mock communities block-by-block
export const getCommunityBlockUnits = (communityId: string, block: string): CommunityUnitDef[] => {
  // We want to generate e.g. 24 units for each block
  // Let's seed them with stable statuses based on formula so they persist correctly
  const units: CommunityUnitDef[] = [];
  const numUnits = 24;

  for (let u = 1; u <= numUnits; u++) {
    // Determine status deterministically based on unit number
    let status: 'available' | 'reserved' | 'sold' = 'sold';
    if (u % 4 === 1) {
      status = 'available';
    } else if (u % 5 === 0) {
      status = 'reserved';
    } else {
      status = 'sold';
    }

    // Link a stable property ID for the available ones
    let propertyId: string | undefined = undefined;
    if (status === 'available') {
      propertyId = `prop-${communityId}-${block.replace(/\s+/g, '')}-${u}`;
    }

    units.push({
      unitNumber: u,
      blockIdentifier: block,
      status,
      propertyId
    });
  }

  return units;
};

// Explicit properties that correspond to the "available" units inside the communities
export const mockCommunityProperties: Property[] = [];

// Seed the mock properties for the available units
mockCommunities.forEach((comm) => {
  comm.blocks.forEach((blk) => {
    const units = getCommunityBlockUnits(comm.id, blk);
    units.forEach((unit) => {
      if (unit.status === 'available' && unit.propertyId) {
        // Create a custom property details representable in search & details views
        const isHouse = comm.id !== 'comm-tabarak'; // Tabarak is apartments, others are houses
        const priceIQD = isHouse ? 210 + (unit.unitNumber * 1.5) : 120 + (unit.unitNumber * 0.8);
        const priceUSD = Math.round(priceIQD * 1000000 / 1500); // approx exchange rate

        const prop: Property = {
          id: unit.propertyId,
          title: `${isHouse ? 'فيلا راقية' : 'شقة سكنية متكاملة'} رقم ${unit.unitNumber} في ${comm.name} (${blk})`,
          description: `وحدة سكنية ممتازة معروضة كجزء من ${comm.name} ضمن منطقة ${comm.district}، وتحديداً في ${blk}. تتمتع الوحدة بتصميم وتجهيز ممتاز، وتشطيبات درجة أولى، ومرافق كهرباء وخدمات مستقرة ٢٤ ساعة. وتعد هذه فرصة استثنائية لامتلاك عقار داخل أحد كبرى المجمعات الاستثمارية بالمحافظة مع ضمان الصيانة والخدمات.`,
          priceIQD,
          priceUSD,
          category: isHouse ? 'house' : 'apartment',
          transactionType: 'sale',
          district: comm.district,
          neighborhood: comm.neighborhood,
          addressDetails: `داخل المجمع السكني، ${blk}، وحدة رقم ${unit.unitNumber}`,
          area: isHouse ? 200 : 130,
          rooms: isHouse ? 3 : 2,
          bathrooms: isHouse ? 2 : 2,
          floors: isHouse ? 2 : 1,
          images: isHouse ? [
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80'
          ] : [
            'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'
          ],
          isPremium: unit.unitNumber < 10,
          broker: mockBrokers[0], // Al-Samawi
          features: ['بنى تحتية متكاملة', 'أمن وحراسة ٢٤ ساعة', 'خط كهرباء ذهبي', 'طابو استثماري سند مستقل', 'تأسيسات غاز مركزية', 'عزل حراري ورطوبة عالي الجودة'],
          createdAt: '2026-06-05',
          views: 95 + unit.unitNumber * 3,
          belongsToCommunity: true,
          communityId: comm.id,
          blockIdentifier: blk,
          unitNumber: unit.unitNumber,
          availabilityStatus: 'available'
        };

        mockCommunityProperties.push(prop);
      }
    });
  });
});
