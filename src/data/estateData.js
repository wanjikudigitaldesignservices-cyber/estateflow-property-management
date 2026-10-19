export const initialProperties = [
  {
    id: "EST-101",
    name: "Crown Heights Executive Enclave",
    location: "Kilimani, Argwings Kodhek",
    unitsCount: 16,
    occupancyRate: "93.8%",
    manager: "Wanjiku Property Managers",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "EST-102",
    name: "Serene Palms Luxury Townhomes",
    location: "Lavington, James Gichuru Road",
    unitsCount: 8,
    occupancyRate: "100%",
    manager: "Wanjiku Property Managers",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "EST-103",
    name: "Horizon Business & Loft Suites",
    location: "Westlands, Muthithi Road",
    unitsCount: 12,
    occupancyRate: "91.6%",
    manager: "Wanjiku Property Managers",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80"
  }
];

export const initialUnits = [
  {
    id: "UNT-402",
    estateId: "EST-101",
    estateName: "Crown Heights Executive Enclave",
    unitNumber: "Apartment 4B",
    type: "2 Bedroom Master Ensuite",
    monthlyRent: 1250,
    status: "Occupied",
    tenant: {
      id: "TNT-8801",
      name: "Marcus Vance",
      phone: "+254 721 889 900",
      email: "marcus.v@apexcorp.com",
      leaseStart: "2026-01-01",
      leaseEnd: "2026-12-31",
      depositPaid: 2500,
      rentBalance: 0,
      rentStatus: "Paid"
    }
  },
  {
    id: "UNT-403",
    estateId: "EST-101",
    estateName: "Crown Heights Executive Enclave",
    unitNumber: "Apartment 4C",
    type: "3 Bedroom Duplex Penthouse",
    monthlyRent: 1800,
    status: "Occupied",
    tenant: {
      id: "TNT-8802",
      name: "Faith Kamau",
      phone: "+254 734 556 778",
      email: "faith.kamau@horizon.org",
      leaseStart: "2025-09-01",
      leaseEnd: "2026-08-31",
      depositPaid: 3600,
      rentBalance: 600,
      rentStatus: "Partial"
    }
  },
  {
    id: "UNT-404",
    estateId: "EST-101",
    estateName: "Crown Heights Executive Enclave",
    unitNumber: "Apartment 2A",
    type: "1 Bedroom Loft",
    monthlyRent: 850,
    status: "Vacant",
    tenant: null
  },
  {
    id: "UNT-201",
    estateId: "EST-102",
    estateName: "Serene Palms Luxury Townhomes",
    unitNumber: "Villa #3",
    type: "4 Bedroom Contemporary Villa",
    monthlyRent: 2400,
    status: "Occupied",
    tenant: {
      id: "TNT-8803",
      name: "David Omondi",
      phone: "+254 711 223 344",
      email: "d.omondi@logistics.co.ke",
      leaseStart: "2026-03-01",
      leaseEnd: "2027-02-28",
      depositPaid: 4800,
      rentBalance: 0,
      rentStatus: "Paid"
    }
  }
];

export const initialRentLedger = [
  {
    id: "RCPT-9921",
    unitNumber: "Apartment 4B",
    tenantName: "Marcus Vance",
    amount: 1250,
    period: "October 2026",
    method: "M-Pesa (REF: QKR89421)",
    date: "2026-10-02",
    status: "Cleared"
  },
  {
    id: "RCPT-9920",
    unitNumber: "Villa #3",
    tenantName: "David Omondi",
    amount: 2400,
    period: "October 2026",
    method: "Bank Wire (Standard Chartered)",
    date: "2026-10-01",
    status: "Cleared"
  },
  {
    id: "RCPT-9919",
    unitNumber: "Apartment 4C",
    tenantName: "Faith Kamau",
    amount: 1200,
    period: "October 2026 (Partial)",
    method: "M-Pesa (REF: QKR11209)",
    date: "2026-10-04",
    status: "Cleared"
  }
];

export const initialMaintenanceTickets = [
  {
    id: "TCK-401",
    unitNumber: "Apartment 4C",
    tenantName: "Faith Kamau",
    category: "Plumbing",
    title: "Ensuite shower mixer temperature valve leaking",
    priority: "Urgent",
    status: "In Progress",
    assignedTo: "Fundi Fix Kenya (John Mwangi)",
    date: "2026-10-18",
    description: "Water pressure fluctuates and mixer lever drips continuously."
  },
  {
    id: "TCK-402",
    unitNumber: "Villa #3",
    tenantName: "David Omondi",
    category: "Electrical",
    title: "Backyard solar security sensor lamp inspection",
    priority: "Normal",
    status: "Scheduled",
    assignedTo: "Apex Electricals",
    date: "2026-10-17",
    description: "Motion sensor light occasionally trips during heavy rain."
  },
  {
    id: "TCK-400",
    unitNumber: "Apartment 4B",
    tenantName: "Marcus Vance",
    category: "Carpentry",
    title: "Balcony sliding glass latch tightening",
    priority: "Normal",
    status: "Resolved",
    assignedTo: "Estate Maintenance Team",
    date: "2026-10-12",
    description: "Latch calibrated and lubricated. Completed."
  }
];

export const initialNotices = [
  {
    id: "NOT-110",
    title: "Quarterly Water Storage Reservoir Sanitation & Flushed Lines",
    date: "2026-10-17",
    target: "All Residents (Crown Heights)",
    body: "Please be notified that the rooftop tanks will undergo comprehensive sanitization this Thursday between 10:00 AM and 2:00 PM. Water supply will be temporarily routed through the secondary borehole reservoir."
  },
  {
    id: "NOT-109",
    title: "Fiber Optic Backbone Upgrade & High-Speed Lifts Service",
    date: "2026-10-14",
    target: "All Estates",
    body: "Safaricom & Liquid Telecom teams will complete high-speed 1Gbps fiber splicing. Elevator Lift B will be serviced Saturday morning."
  }
];
