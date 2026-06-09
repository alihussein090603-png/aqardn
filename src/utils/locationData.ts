/**
 * static mapping data of Al-Muthanna Province regions (أقضية ونواحي محافظة المثنى)
 */

export interface NeighborhoodData {
  name: string;
  isPopular: boolean;
  averagePriceRangeM2: string; // approximate range in thousand IQD
}

export interface DistrictData {
  id: string;
  name: string;
  subUrbsCount: number;
  neighborhoods: NeighborhoodData[];
}

export const AL_MUTHANNA_REGIONS: DistrictData[] = [
  {
    id: 'samawa',
    name: 'السماوة',
    subUrbsCount: 10,
    neighborhoods: [
      { name: 'حي الحكيم', isPopular: true, averagePriceRangeM2: '450 - 750' },
      { name: 'حي الشرطة', isPopular: true, averagePriceRangeM2: '350 - 550' },
      { name: 'الصوب الكبير (السوق الثاني)', isPopular: true, averagePriceRangeM2: '600 - 1200' },
      { name: 'الصوب الصغير', isPopular: true, averagePriceRangeM2: '400 - 700' },
      { name: 'حي الغربي', isPopular: false, averagePriceRangeM2: '300 - 500' },
      { name: 'حي القشلة التاريخي', isPopular: true, averagePriceRangeM2: '500 - 900' },
      { name: 'مجمع تبارك السكني', isPopular: true, averagePriceRangeM2: '550 - 800' },
      { name: 'حي المعلمين', isPopular: false, averagePriceRangeM2: '350 - 500' },
      { name: 'حي صدر القناة', isPopular: false, averagePriceRangeM2: '300 - 450' },
      { name: 'حي الجربوعية', isPopular: false, averagePriceRangeM2: '250 - 400' }
    ]
  },
  {
    id: 'rumaitha',
    name: 'الرميثة',
    subUrbsCount: 5,
    neighborhoods: [
      { name: 'حي الشهداء', isPopular: true, averagePriceRangeM2: '200 - 350' },
      { name: 'حي العسكري بالرميثة', isPopular: true, averagePriceRangeM2: '180 - 300' },
      { name: 'الحي الصناعي', isPopular: false, averagePriceRangeM2: '300 - 600' },
      { name: 'منطقة السراي القديمة', isPopular: true, averagePriceRangeM2: '250 - 450' },
      { name: 'حي بابل', isPopular: false, averagePriceRangeM2: '150 - 250' }
    ]
  },
  {
    id: 'khidhir',
    name: 'الخضر',
    subUrbsCount: 3,
    neighborhoods: [
      { name: 'حي الخضر الكبير', isPopular: true, averagePriceRangeM2: '180 - 280' },
      { name: 'منطقة الكورنيش', isPopular: true, averagePriceRangeM2: '250 - 400' },
      { name: 'الحي العسكري بالخضر', isPopular: false, averagePriceRangeM2: '150 - 220' }
    ]
  }
];
