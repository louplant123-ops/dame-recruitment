export interface LocationFaq {
  q: string
  a: string
}

export interface LocationData {
  slug: string
  city: string
  /** County or wider area for context, e.g. "Leicestershire" */
  county: string
  /** Phone number for the nearest branch (display) */
  phone: string
  /** tel: href for the branch number */
  phoneHref: string
  /** Short line used as the page banner subtitle */
  intro: string
  /** Body paragraphs — unique, locally relevant copy */
  overview: string[]
  /** Surrounding towns we also cover from this base */
  nearbyAreas: string[]
  /** Sector slugs most relevant to this location */
  sectors: string[]
  faqs: LocationFaq[]
}

export const LOCATIONS: LocationData[] = [
  {
    slug: 'leicester',
    city: 'Leicester',
    county: 'Leicestershire',
    phone: '0116 456 0011',
    phoneHref: 'tel:+441164560011',
    intro:
      'Temporary and permanent recruitment in Leicester — warehouse, manufacturing, engineering and driving staff who turn up and stay.',
    overview: [
      'Leicester is one of the busiest logistics and manufacturing hubs in the UK, and our local team knows it inside out. Whether you are staffing a distribution centre off the M1, a production line in the city, or a skilled engineering role, we supply people who are reliable and ready to work.',
      'As Leicester recruitment specialists, we cover the whole county — from the warehouses around Magna Park and Meridian to manufacturers across the city and beyond. Our consultants are local, contactable, and on hand when you need cover fast.',
    ],
    nearbyAreas: ['Loughborough', 'Hinckley', 'Coalville', 'Wigston', 'Oadby', 'Market Harborough', 'Lutterworth'],
    sectors: ['warehousing', 'manufacturing', 'engineering', 'logistics-distribution'],
    faqs: [
      {
        q: 'Do you cover temporary work across Leicestershire?',
        a: 'Yes. From our Leicester base we supply temporary and permanent staff across the whole county, including Loughborough, Hinckley, Coalville and the Magna Park and Lutterworth distribution corridor.',
      },
      {
        q: 'How quickly can you supply staff in Leicester?',
        a: 'For temporary roles we can often shortlist within hours and place staff same-day or next-day, thanks to a vetted local pool of warehouse, production and driving candidates.',
      },
    ],
  },
  {
    slug: 'nottingham',
    city: 'Nottingham',
    county: 'Nottinghamshire',
    phone: '0115 661 2460',
    phoneHref: 'tel:+441156612460',
    intro:
      'Recruitment in Nottingham — dependable warehouse, manufacturing and logistics staff for employers across Nottinghamshire.',
    overview: [
      'Nottingham combines a strong manufacturing base with fast-growing distribution and logistics operations. Our Nottingham team supplies the operatives, drivers and skilled staff that keep these businesses moving.',
      'We recruit across the city and the wider county, briefing every candidate properly and confirming attendance before each shift so you are never left short.',
    ],
    nearbyAreas: ['Beeston', 'Arnold', 'West Bridgford', 'Hucknall', 'Mansfield', 'Ilkeston', 'Eastwood'],
    sectors: ['warehousing', 'manufacturing', 'logistics-distribution', 'engineering'],
    faqs: [
      {
        q: 'Which areas around Nottingham do you cover?',
        a: 'We place staff across Nottinghamshire, including Beeston, Arnold, West Bridgford, Hucknall and Mansfield, as well as the logistics sites along the M1.',
      },
      {
        q: 'Can you provide both temp and permanent staff in Nottingham?',
        a: 'Yes — we handle temporary, temp-to-perm and permanent recruitment, with a 90-day guarantee on permanent placements.',
      },
    ],
  },
  {
    slug: 'derby',
    city: 'Derby',
    county: 'Derbyshire',
    phone: '0330 043 5011',
    phoneHref: 'tel:+443300435011',
    intro:
      'Recruitment in Derby — engineering, manufacturing and warehouse staff for one of the UK\u2019s great engineering cities.',
    overview: [
      'Derby is a powerhouse of advanced engineering and manufacturing, and the skilled-staff market here is competitive. We help employers across the city secure dependable operatives and skilled engineers without the usual hassle.',
      'From production lines to maintenance roles and distribution sites, our team supplies people who are properly vetted and matched to the technical detail of your vacancy.',
    ],
    nearbyAreas: ['Burton upon Trent', 'Ilkeston', 'Ripley', 'Belper', 'Long Eaton', 'Alfreton'],
    sectors: ['engineering', 'manufacturing', 'warehousing', 'logistics-distribution'],
    faqs: [
      {
        q: 'Do you recruit skilled engineers in Derby?',
        a: 'Yes. Derby\u2019s engineering sector is a core focus for us — we place maintenance engineers, fitters, CNC operators and electrical technicians on both contract and permanent terms.',
      },
      {
        q: 'Which areas near Derby do you cover?',
        a: 'We supply staff across Derbyshire and the surrounding area, including Burton upon Trent, Ilkeston, Long Eaton, Ripley and Belper.',
      },
    ],
  },
  {
    slug: 'coventry',
    city: 'Coventry',
    county: 'Warwickshire',
    phone: '024 7775 3721',
    phoneHref: 'tel:+442477753721',
    intro:
      'Recruitment in Coventry — warehouse, manufacturing, automotive and driving staff for Coventry and Warwickshire.',
    overview: [
      'Coventry sits at the centre of the UK motorway network and has a proud automotive and manufacturing heritage. Our Coventry team supplies the warehouse, production and driving staff that local employers rely on.',
      'With excellent links to the M6, M69 and M40, Coventry is a major logistics location — and we keep a ready pool of vetted operatives and drivers to match demand.',
    ],
    nearbyAreas: ['Nuneaton', 'Bedworth', 'Rugby', 'Kenilworth', 'Leamington Spa', 'Warwick'],
    sectors: ['warehousing', 'manufacturing', 'logistics-distribution', 'engineering'],
    faqs: [
      {
        q: 'Do you cover Warwickshire as well as Coventry?',
        a: 'Yes. From our Coventry base we supply staff across Warwickshire, including Nuneaton, Bedworth, Rugby, Kenilworth and Leamington Spa.',
      },
      {
        q: 'Can you supply drivers and warehouse staff at short notice?',
        a: 'We hold a vetted local pool of warehouse operatives and HGV drivers and can often cover urgent and same-day shifts.',
      },
    ],
  },
  {
    slug: 'northampton',
    city: 'Northampton',
    county: 'Northamptonshire',
    phone: '01604 969 011',
    phoneHref: 'tel:+441604969011',
    intro:
      'Recruitment in Northampton — warehouse, distribution and manufacturing staff for the UK\u2019s logistics golden triangle.',
    overview: [
      'Northampton sits at the heart of the UK\u2019s distribution \u201cgolden triangle\u201d, home to some of the largest warehouses in the country. Our team supplies the operatives, pickers, drivers and team leaders these sites depend on.',
      'We brief candidates on shift patterns and site requirements up front and confirm attendance before each shift, keeping fulfilment running smoothly even at peak.',
    ],
    nearbyAreas: ['Wellingborough', 'Kettering', 'Daventry', 'Towcester', 'Rushden', 'Corby'],
    sectors: ['warehousing', 'logistics-distribution', 'manufacturing'],
    faqs: [
      {
        q: 'Do you staff large distribution centres around Northampton?',
        a: 'Yes — large-scale warehouse and distribution staffing is one of our specialisms in Northamptonshire, including Daventry, Wellingborough and the surrounding logistics parks.',
      },
      {
        q: 'Can you ramp teams up for seasonal peaks?',
        a: 'We regularly scale warehouse and fulfilment teams up for peak periods and back down again, all on flexible temporary terms.',
      },
    ],
  },
]

export function getLocation(slug: string): LocationData | undefined {
  return LOCATIONS.find((l) => l.slug === slug)
}
