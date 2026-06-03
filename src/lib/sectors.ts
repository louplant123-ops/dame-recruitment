export interface SectorFaq {
  q: string
  a: string
}

export interface SectorData {
  slug: string
  name: string
  /** Used in titles, e.g. "Warehouse" in "Warehouse Recruitment" */
  keyword: string
  intro: string
  overview: string[]
  roles: string[]
  faqs: SectorFaq[]
}

export const SECTORS: SectorData[] = [
  {
    slug: 'warehousing',
    name: 'Warehousing',
    keyword: 'Warehouse',
    intro:
      'Reliable warehouse staff across the East Midlands — pickers, packers, forklift drivers and team leaders who turn up and get the job done.',
    overview: [
      'Warehousing and fulfilment is the backbone of the East Midlands economy, and it lives or dies on attendance. We supply warehouse operatives, forklift drivers and shift leaders who show up on time and hit the ground running.',
      'Every candidate is interviewed, reference-checked and given a realistic preview of the role — shift patterns, site requirements and pace — before they ever set foot on your floor. That is why our temp attendance rate sits above 90%.',
    ],
    roles: [
      'Warehouse Operative',
      'Forklift Driver (Counterbalance & Reach)',
      'Picker / Packer',
      'Goods In / Goods Out',
      'Team Leader / Shift Supervisor',
      'Inventory Controller',
    ],
    faqs: [
      {
        q: 'Can you supply forklift drivers at short notice?',
        a: 'Yes. We hold a pool of accredited counterbalance and reach truck drivers and can usually cover urgent shifts same-day or next-day across Leicester, Nottingham, Derby, Coventry and Northampton.',
      },
      {
        q: 'Do you check licences and certifications?',
        a: 'Every forklift driver has their licence and accreditation verified, and all candidates complete a Right to Work check before placement.',
      },
    ],
  },
  {
    slug: 'manufacturing',
    name: 'Manufacturing',
    keyword: 'Manufacturing',
    intro:
      'Production operatives, machine operators and line leaders for East Midlands manufacturers — vetted for reliability and ready to work.',
    overview: [
      'From food production to metal fabrication, manufacturers need people who are dependable, safety-conscious and comfortable on a line. We recruit production and assembly staff who keep your output steady.',
      'We brief every candidate on the realities of the role and confirm attendance the day before each shift, with pre-vetted backups on standby so a no-show never stops your line.',
    ],
    roles: [
      'Production Operative',
      'Machine Operator',
      'Quality Controller',
      'Assembly Worker',
      'Line Leader',
      'Maintenance Assistant',
    ],
    faqs: [
      {
        q: 'Can you scale a team up for a production peak?',
        a: 'Yes. We regularly ramp teams up for seasonal peaks and new contracts, and scale back down just as smoothly — all on flexible temporary terms.',
      },
      {
        q: 'Do candidates have manufacturing experience?',
        a: 'We match on experience wherever it matters, and for entry-level lines we screen hard for reliability, attitude and a clean attendance record.',
      },
    ],
  },
  {
    slug: 'engineering',
    name: 'Engineering',
    keyword: 'Engineering',
    intro:
      'Skilled engineers and technicians for maintenance, electrical and mechanical roles across the East Midlands.',
    overview: [
      'The East Midlands is home to some of the UK\u2019s most advanced engineering — and skilled people are in short supply. We source maintenance engineers, electricians, fitters and CNC operators for permanent and contract roles.',
      'We take the time to understand the technical detail of each vacancy so the people we send can actually do the job, not just tick a box on a CV.',
    ],
    roles: [
      'Maintenance Engineer',
      'Electrical Technician',
      'Mechanical Fitter',
      'CNC Operator',
      'Welder / Fabricator',
      'Plant Engineer',
    ],
    faqs: [
      {
        q: 'Do you recruit for permanent engineering roles?',
        a: 'Yes — alongside temporary and contract cover, we run full permanent searches for skilled engineering positions, backed by a 90-day placement guarantee.',
      },
      {
        q: 'Can you find shift maintenance engineers?',
        a: 'We regularly place maintenance engineers across days, nights and continental shift patterns for manufacturing and warehousing sites.',
      },
    ],
  },
  {
    slug: 'logistics-distribution',
    name: 'Logistics & Distribution',
    keyword: 'Logistics & Driving',
    intro:
      'HGV drivers, transport planners and distribution staff for the heart of the UK\u2019s logistics network.',
    overview: [
      'Sitting in the UK\u2019s \u201cgolden triangle\u201d of distribution, the East Midlands runs on logistics. We supply HGV Class 1 and 2 drivers, van drivers and transport office staff who keep freight moving.',
      'All drivers have their licences, CPC and tacho cards checked before placement, so you can put them on the road with complete confidence.',
    ],
    roles: [
      'HGV Class 1 Driver',
      'HGV Class 2 Driver',
      'Van / Multidrop Driver',
      'Transport Planner',
      'Distribution Manager',
      'Supply Chain Coordinator',
    ],
    faqs: [
      {
        q: 'Do you check driver licences and CPC?',
        a: 'Yes. We verify licence categories, Driver CPC, tachograph cards and carry out Right to Work checks for every driver we place.',
      },
      {
        q: 'Can you cover urgent driving shifts?',
        a: 'We hold a pool of compliant Class 1 and Class 2 drivers and can often cover same-day and weekend shifts across the region.',
      },
    ],
  },
  {
    slug: 'finance',
    name: 'Finance & Office',
    keyword: 'Finance & Office',
    intro:
      'Finance and office support staff — from credit controllers to payroll administrators — for East Midlands businesses.',
    overview: [
      'Behind every operation is a finance and office team keeping it running. We recruit accounts, payroll and administrative staff on both temporary and permanent terms.',
      'We screen for the right software skills and the right temperament, so new starters slot into your team quickly.',
    ],
    roles: [
      'Credit Controller',
      'Accounts Payable / Receivable',
      'Payroll Administrator',
      'Bookkeeper',
      'Finance Assistant',
      'Assistant Accountant',
    ],
    faqs: [
      {
        q: 'Do you cover temporary finance cover?',
        a: 'Yes — from holiday and maternity cover to year-end and month-end support, we supply experienced finance staff on flexible terms.',
      },
      {
        q: 'Do you test software skills?',
        a: 'We confirm experience with the systems that matter to you, such as Sage, Xero and Excel, before putting a candidate forward.',
      },
    ],
  },
  {
    slug: 'energy',
    name: 'Energy & Renewables',
    keyword: 'Energy & Renewables',
    intro:
      'Installers and engineers for the growing renewable energy sector across the East Midlands.',
    overview: [
      'The shift to clean energy is creating real demand for skilled installers and engineers. We recruit for solar, EV charging, smart metering and wider electrical roles.',
      'We understand the accreditations and safety standards this sector demands and screen accordingly.',
    ],
    roles: [
      'Solar Panel Installer',
      'EV Charge Point Engineer',
      'Smart Meter Engineer',
      'Wind Turbine Technician',
      'Electrical Improver',
    ],
    faqs: [
      {
        q: 'Do you recruit for solar and EV installation roles?',
        a: 'Yes — we place solar PV installers, EV charge point engineers and smart meter engineers for installers operating across the East Midlands.',
      },
      {
        q: 'Are candidates suitably accredited?',
        a: 'We screen for the relevant electrical qualifications and accreditations the role requires before putting anyone forward.',
      },
    ],
  },
]

export function getSector(slug: string): SectorData | undefined {
  return SECTORS.find((s) => s.slug === slug)
}
