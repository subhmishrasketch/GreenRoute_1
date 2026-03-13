import type { Society, AreaWasteData, RecyclingData } from "@/types/admin";

// Demo societies data
export const societies: Society[] = [
  {
    id: "SOC-001",
    name: "Green Valley CHS",
    area: "Mira Road East",
    ecoPoints: 2850,
    totalPickups: 47,
    plasticCollected: 156,
    cardboardCollected: 234,
    co2Reduced: 890,
    plasticSaved: 156,
    lastPickupDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: "SOC-002",
    name: "Sai Paradise",
    area: "Bhayandar West",
    ecoPoints: 2340,
    totalPickups: 39,
    plasticCollected: 134,
    cardboardCollected: 189,
    co2Reduced: 756,
    plasticSaved: 134,
    lastPickupDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: "SOC-003",
    name: "Shanti Nagar CHS",
    area: "Mira Road West",
    ecoPoints: 1980,
    totalPickups: 32,
    plasticCollected: 98,
    cardboardCollected: 156,
    co2Reduced: 612,
    plasticSaved: 98,
    lastPickupDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: "SOC-004",
    name: "Royal Heights",
    area: "Bhayandar East",
    ecoPoints: 1650,
    totalPickups: 28,
    plasticCollected: 87,
    cardboardCollected: 124,
    co2Reduced: 523,
    plasticSaved: 87,
    lastPickupDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  },
  {
    id: "SOC-005",
    name: "Eco Gardens",
    area: "Kashimira",
    ecoPoints: 1420,
    totalPickups: 24,
    plasticCollected: 76,
    cardboardCollected: 108,
    co2Reduced: 445,
    plasticSaved: 76,
    lastPickupDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: "SOC-006",
    name: "Sunrise Apartments",
    area: "Mira Road East",
    ecoPoints: 1180,
    totalPickups: 20,
    plasticCollected: 62,
    cardboardCollected: 94,
    co2Reduced: 378,
    plasticSaved: 62,
    lastPickupDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
  },
];

export const areaWasteData: AreaWasteData[] = [
  { area: "Mira Road East", plastic: 218, cardboard: 328, total: 546 },
  { area: "Bhayandar West", plastic: 134, cardboard: 189, total: 323 },
  { area: "Mira Road West", plastic: 98, cardboard: 156, total: 254 },
  { area: "Bhayandar East", plastic: 87, cardboard: 124, total: 211 },
  { area: "Kashimira", plastic: 76, cardboard: 108, total: 184 },
];

export const monthlyRecyclingData: RecyclingData[] = [
  { month: "Sep", recycled: 320, landfill: 45 },
  { month: "Oct", recycled: 410, landfill: 38 },
  { month: "Nov", recycled: 485, landfill: 32 },
  { month: "Dec", recycled: 520, landfill: 28 },
  { month: "Jan", recycled: 613, landfill: 22 },
];

export const getAdminStats = () => {
  const totalWaste = societies.reduce(
    (acc, s) => acc + s.plasticCollected + s.cardboardCollected,
    0
  );
  const totalPlastic = societies.reduce((acc, s) => acc + s.plasticCollected, 0);
  const totalCardboard = societies.reduce((acc, s) => acc + s.cardboardCollected, 0);
  const totalCO2Reduced = societies.reduce((acc, s) => acc + s.co2Reduced, 0);
  const totalPickups = societies.reduce((acc, s) => acc + s.totalPickups, 0);
  const totalSocieties = societies.length;

  return {
    totalWaste,
    totalPlastic,
    totalCardboard,
    totalCO2Reduced,
    totalPickups,
    totalSocieties,
  };
};
