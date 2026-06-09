/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Property, Broker } from './types';

export const mockBrokers: Broker[] = [
  {
    id: 'b1',
    name: 'الحاج أبو علي السماوي',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80',
    phone: '07801234567',
    whatsapp: '9647801234000',
    agencyName: 'مكتب السماوي للعقارات والمقاولات',
    rating: 4.9,
    isVerified: true,
    activeListingsCount: 12
  },
  {
    id: 'b2',
    name: 'المهندس رائد الخفاجي',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
    phone: '07709876543',
    whatsapp: '9647700000000',
    agencyName: 'مكتب الغدير العقاري - السماوة',
    rating: 4.8,
    isVerified: true,
    activeListingsCount: 8
  },
  {
    id: 'b3',
    name: 'ضياء عادل الرميثي',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    phone: '07812345678',
    whatsapp: '9647812000000',
    agencyName: 'مكتب الرميثة للخدمات العقارية',
    rating: 4.5,
    isVerified: false,
    activeListingsCount: 5
  }
];

export const initialProperties: Property[] = [
  {
    id: 'p1',
    title: 'بيت حديث طابقين بتصميم دبل فوليوم وموقع ممتاز للبيع',
    description: 'منزل حديث فاخر للبيع بناء درجة أولى عام ٢٠٢٥، يقع في أرقى أحياء مدينة السماوة (حي الحكيم) قرب شارع باتا والخدمات الرئيسية. البيت بتصميم معماري عصري يحتوي على نظام تبريد مركزي، ديكورات جبسم بورد فخمة، مغاسل وحمامات سيراميك إسباني، وأرضيات من المرمر الطبيعي. يحتوي الطابق الأرضي على استقبال واسع، صالة طعام، مطبخ مجهز كلياً، وحمام ضيوف. والطابق الثاني يضم غرف النوم مع شرفة مطلة على الشارع الرئيسي.',
    priceIQD: 280, // 280 Million Dinars
    priceUSD: 186000,
    category: 'house',
    transactionType: 'sale',
    district: 'السماوة',
    neighborhood: 'حي الحكيم',
    addressDetails: 'بالقرب من شارع باتا التجاري، خلف صيدلية الفارابي',
    area: 250,
    rooms: 4,
    bathrooms: 3,
    floors: 2,
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80'
    ],
    isPremium: true,
    broker: mockBrokers[0],
    features: ['بناء حديث ٢٠٢٥', 'أرضيات مرمر وطني', 'كاميرات مراقبة', 'موقع تجاري وسكني', 'إنتركم ذكي', 'كراج سيارة مستقل'],
    createdAt: '2026-06-01',
    views: 314
  },
  {
    id: 'p2',
    title: 'أرض زراعية خصبة مطلة مباشرة على نهر الفرات بموقع استراتيجي',
    description: 'أرض زراعية ممتازة للبيع في قضاء الرميثة بمساحة واسعة جداً وتربة مروية وصالحة لشتى المحاصيل أو لإنشاء مشروع ترفيهي أو بستان نموذجي. الأرض لها واجهة مميزة على نهر الفرات مباشرة وقريبة جداً من الطريق العام الرابط بالسماوة. تتوفر فيها الكهرباء والماء وخدمات الري، وبجوارها ممتلكات مأهولة بالسكان والطرق إليها معبدة بالكامل.',
    priceIQD: 95, // 95 Million Dinars
    priceUSD: 63300,
    category: 'land',
    transactionType: 'sale',
    district: 'الرميثة',
    neighborhood: 'منطقة السراي',
    addressDetails: 'كورنيش نهر الفرات خلف الجسر الحديدي القديم',
    area: 1200,
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80'
    ],
    isPremium: false,
    broker: mockBrokers[2],
    features: ['مطلة على نهر الفرات', 'تربة خصبة ومروية', 'سند طابو زراعي ملك صرف', 'طريق معبد مع إنارة شمسية'],
    createdAt: '2026-06-03',
    views: 185
  },
  {
    id: 'p3',
    title: 'شقة سكنية مؤثثة بالكامل للإيجار الشهري بمجمع تبارك السكني',
    description: 'شقة فاخرة ومؤثثة بأحدث الأثاث التركي متوفرة للإيجار السنوي أو الشهري في مجمع تبارك السكني الحديث بالسماوة. المجمع مغلق ومؤمن بالكامل بكاميرات مراقبة وحراسة أمنية ٢٤ ساعة، مع توفر مدرسة وحدائق وماركت ألعاب داخل المجمع. تحتوي الشقة على دبل تبريد كونتور، مطبخ مجهز بأحدث الأجهزة الكهربائية، سخان مركزي، ومولد ذهبي متواصل للأجهزة والإنارة.',
    priceIQD: 0.9, // 900,000 Dinars as 0.9 Million D.G. (or display accordingly)
    priceUSD: 600,
    category: 'apartment',
    transactionType: 'rent',
    district: 'السماوة',
    neighborhood: 'مجمع تبارك السكني',
    addressDetails: 'عمارة (أ)، الطابق الثالث، شقة رقم ١٢',
    area: 135,
    rooms: 2,
    bathrooms: 2,
    floors: 1,
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'
    ],
    isPremium: true,
    broker: mockBrokers[1],
    features: ['مجمع سكني مغلق وأمن', 'أثاث تركي فاخر', 'كهرباء خط ذهبي ٢٤ ساعة', 'إطلالة على الحديقة المركزية', 'مصعد حديث مستقل'],
    createdAt: '2026-05-28',
    views: 412
  },
  {
    id: 'p4',
    title: 'مكتب ومحل تجاري كبير بموقع ريادي للبيع وسط الصوب الكبير',
    description: 'فرصة متميزة وأكيدة للاستثمار العقاري والتجاري الفخم في مركز مدينة السماوة (الصوب الكبير) قرب السوق الرئيسي. عقار يحتوي على محل تجاري في الطابق الأرضي وطابق علوي للمكاتب والشغل التجاري. واجهة زجاجية عريضة من الكرتن وول ضد الكسر، تشطيب فاخر متكامل، ويصلح ليكون عيادة طبية كبرى، معرض تجاري، شركة صرافة أو فروع بنكية.',
    priceIQD: 420, // 420 Million Dinars
    priceUSD: 280000,
    category: 'commercial',
    transactionType: 'sale',
    district: 'السماوة',
    neighborhood: 'الصوب الكبير',
    addressDetails: 'مقابل ساحة الساعة، بجوار مصرف الرافدين',
    area: 180,
    rooms: 3,
    bathrooms: 1,
    floors: 2,
    images: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80'
    ],
    isPremium: true,
    broker: mockBrokers[0],
    features: ['موقع في السوق المركزي', 'واجهة زجاجية فاخرة', 'طابو ملك صرف تجاري', 'موافقات الدفاع المدني متكاملة'],
    createdAt: '2026-06-02',
    views: 520
  },
  {
    id: 'p5',
    title: 'أرض تجارية ركنية مميزة ملك صرف للبيع بالخضر',
    description: 'أرض ركنية تجارية سكنية ممتازة للبيع في مركز قضاء الخضر على الشارع الحولي بعرض ٣٠ متر، أرض مستوية وجاهزة فوراً لتنفيذ البناء التجاري أو السكني الاستثماري الفاخر. تقع الأرض قرب مجمع الأبنية الحكومية الجديد ويسهل الوصول إليها من الشارع العام.',
    priceIQD: 110,
    priceUSD: 73500,
    category: 'land',
    transactionType: 'sale',
    district: 'الخضر',
    neighborhood: 'منطقة الكورنيش',
    addressDetails: 'مقابل مجمع المدارس الجديد، الشارع الحولي ٣٠م',
    area: 300,
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80'
    ],
    isPremium: false,
    broker: mockBrokers[1],
    features: ['أرض ركنية بجبهتين', 'شارع حولي عريض ۳۰م', 'سند طابو سكني ملك صرف', 'خدمات ماء ومجاري تحت الإشراف'],
    createdAt: '2026-05-30',
    views: 145
  },
  {
    id: 'p6',
    title: 'بيت للإيجار الشهري للعوائل حي الغربي السماوة',
    description: 'بيت طابق واحد مؤثث جزئياً وممتاز للعوائل، يقع في حي الغربي بالقرب من جامع الحكيم بمستوى بناء محترم وهادئ جداً. يحتوي البيت على ٢ غرف نوم، هول داخلي للاستقبال، مطبخ مجهز ومفتوح بنظام أمريكي وحوش أمامي للسيارة ومظلة جاهزة.',
    priceIQD: 0.55, // 550,000 Dinars as 0.55 Million
    priceUSD: 370,
    category: 'house',
    transactionType: 'rent',
    district: 'السماوة',
    neighborhood: 'حي الغربي',
    addressDetails: 'قرب جامع الحكيم الكبير، فرع مدرسة بابل',
    area: 150,
    rooms: 2,
    bathrooms: 1,
    floors: 1,
    images: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
    ],
    isPremium: false,
    broker: mockBrokers[1],
    features: ['شارع عريض ۱۲م', 'خط ماء إسالة متواصل', 'قرب مدارس وأسواق الملاحة', 'كراج سيارة مع مظلة لليوز'],
    createdAt: '2026-06-04',
    views: 228
  }
];
