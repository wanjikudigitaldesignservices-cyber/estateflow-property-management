export const initialProperties = [
  {
    id: "EST-101",
    name: "Grandview Executive Enclave",
    location: "Grandview District, Central Avenue",
    unitsCount: 16,
    occupancyRate: "93.8%",
    manager: "Nordic Property Partners",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "EST-102",
    name: "Serene Palms Luxury Townhomes",
    location: "Parkview Terraces, North Boulevard",
    unitsCount: 8,
    occupancyRate: "100%",
    manager: "Nordic Property Partners",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "EST-103",
    name: "Horizon Business & Loft Suites",
    location: "Financial Quarter, Waterfront Way",
    unitsCount: 12,
    occupancyRate: "91.6%",
    manager: "Nordic Property Partners",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80"
  }
];

export const initialUnits = [
  {
    id: "UNT-402",
    estateId: "EST-101",
    estateName: "Grandview Executive Enclave",
    unitNumber: "Apartment 4B",
    type: "2 Bedroom Master Ensuite",
    monthlyRent: 1250,
    status: "Occupied",
    tenant: {
      id: "TNT-8801",
      name: "Marcus Vance",
      phone: "+1 (555) 019-2834",
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
    estateName: "Grandview Executive Enclave",
    unitNumber: "Apartment 4C",
    type: "3 Bedroom Duplex Penthouse",
    monthlyRent: 1800,
    status: "Occupied",
    tenant: {
      id: "TNT-8802",
      name: "Elena Rostova",
      phone: "+1 (555) 734-5567",
      email: "elena.r@horizon.org",
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
    estateName: "Grandview Executive Enclave",
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
      name: "David Sterling",
      phone: "+1 (555) 445-9921",
      email: "d.sterling@logistics.net",
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
    method: "Bank ACH Direct (Chase REF: 89421)",
    date: "2026-10-02",
    status: "Cleared"
  },
  {
    id: "RCPT-9920",
    unitNumber: "Villa #3",
    tenantName: "David Sterling",
    amount: 2400,
    period: "October 2026",
    method: "Wire Remittance (First National)",
    date: "2026-10-01",
    status: "Cleared"
  },
  {
    id: "RCPT-9919",
    unitNumber: "Apartment 4C",
    tenantName: "Elena Rostova",
    amount: 1200,
    period: "October 2026 (Partial)",
    method: "Debit Card (REF: 11209)",
    date: "2026-10-04",
    status: "Cleared"
  }
];

export const initialMaintenanceTickets = [
  {
    id: "TCK-401",
    unitNumber: "Apartment 4C",
    tenantName: "Elena Rostova",
    category: "Plumbing",
    title: "Ensuite shower mixer temperature valve leaking",
    priority: "Urgent",
    status: "In Progress",
    assignedTo: "Apex Facility Solutions",
    date: "2026-10-18",
    description: "Water pressure fluctuates and mixer lever drips continuously.",
    history: [
      { timestamp: "2026-10-18 09:15", note: "Ticket submitted by Elena Rostova" },
      { timestamp: "2026-10-18 11:30", note: "Assigned to Apex Facility Solutions" },
      { timestamp: "2026-10-18 14:00", note: "Status changed to In Progress" }
    ]
  },
  {
    id: "TCK-402",
    unitNumber: "Villa #3",
    tenantName: "David Sterling",
    category: "Electrical",
    title: "Garden exterior motion sensor inspection",
    priority: "Normal",
    status: "Scheduled",
    assignedTo: "Metro Electrical Services",
    date: "2026-10-17",
    description: "Motion sensor light occasionally trips during heavy rain.",
    history: [
      { timestamp: "2026-10-17 14:20", note: "Ticket submitted by David Sterling" },
      { timestamp: "2026-10-17 16:00", note: "Scheduled for inspection" }
    ]
  },
  {
    id: "TCK-400",
    unitNumber: "Apartment 4B",
    tenantName: "Marcus Vance",
    category: "Carpentry",
    title: "Balcony sliding glass latch calibration",
    priority: "Normal",
    status: "Resolved",
    assignedTo: "In-House Maintenance",
    date: "2026-10-12",
    description: "Latch calibrated and lubricated. Completed.",
    history: [
      { timestamp: "2026-10-12 08:30", note: "Ticket submitted" },
      { timestamp: "2026-10-12 11:00", note: "Service technician dispatched" },
      { timestamp: "2026-10-12 13:45", note: "Resolved and tested with tenant" }
    ]
  }
];

export const initialNotices = [
  {
    id: "NOT-110",
    title: "Quarterly Water Storage Reservoir Sanitation & Flushed Lines",
    date: "2026-10-17",
    target: "All Residents (Grandview)",
    body: "Please be notified that the rooftop tanks will undergo comprehensive sanitization this Thursday between 10:00 AM and 2:00 PM. Water supply will be temporarily routed through secondary reserves."
  },
  {
    id: "NOT-109",
    title: "Fiber Optic Backbone Upgrade & High-Speed Lifts Service",
    date: "2026-10-14",
    target: "All Estates",
    body: "Telecommunications technicians will complete 1Gbps fiber splicing. Elevator Lift B will be serviced Saturday morning."
  }
];
