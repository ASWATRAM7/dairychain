/**
 * Mock data powering the DairyChain UI until a live contract is deployed.
 * Shapes mirror what useContract.js's read functions return.
 */

// ---------------------------------------------------------------------------
// Recent batches (Dashboard table)
// ---------------------------------------------------------------------------
export const recentBatches = [
  {
    id: "BATCH-TN-093",
    origin: "Aavin Dairy Cooperative",
    volumeLiters: 13346,
    avgTemp: 3.0,
    status: "safe",
    route: "Erode → Chennai South",
    block: 18401,
    action: "inspect",
  },
  {
    id: "BATCH-TN-092",
    origin: "Kongu Agricultural Dairy Union",
    volumeLiters: 8246,
    avgTemp: 3.8,
    status: "safe",
    route: "Salem → Vellore Depot",
    block: 18400,
    action: "inspect",
  },
  {
    id: "BATCH-TN-091",
    origin: "Nilgiris Mountain Federation",
    volumeLiters: 25490,
    avgTemp: 4.2,
    status: "safe",
    route: "Coimbatore → Salem Hub",
    block: 18399,
    action: "inspect",
  },
  {
    id: "BATCH-TN-090",
    origin: "Madurai South Milk Producers Co.",
    volumeLiters: 6496,
    avgTemp: 5.4,
    status: "alert",
    statusNote: "Threshold Breach",
    route: "Madurai → Dindigul Depot",
    block: 18398,
    action: "audit",
  },
  {
    id: "BATCH-TN-089",
    origin: "Tirunelveli Dairy Federation",
    volumeLiters: 15880,
    avgTemp: 3.7,
    status: "safe",
    route: "Tirunelveli → Madurai Hub",
    block: 18397,
    action: "inspect",
  },
];

// ---------------------------------------------------------------------------
// Live sensor telemetry feed (Dashboard right panel)
// ---------------------------------------------------------------------------
export const sensorFeed = [
  {
    id: "CBPD-001",
    type: "Int. TP-042",
    reading: "3.8°C",
    status: "safe",
    statusLabel: "Stable",
    timestamp: "18:42:15 IST",
  },
  {
    id: "TRN-BG-30-42",
    type: "Chiller Compressor",
    reading: "3.5°C",
    status: "safe",
    statusLabel: "Stable",
    timestamp: "18:42:15 IST",
  },
  {
    id: "MP-22B-23",
    type: "Pasteurizer Zone 3",
    reading: "72.1°C",
    status: "safe",
    statusLabel: "Cycle Verified",
    timestamp: "18:42:15 IST",
  },
  {
    id: "TS-04-2026",
    type: "Fleet Thermal Sensors",
    reading: "3.8°C",
    status: "safe",
    statusLabel: "Stable",
    timestamp: "18:42:15 IST",
  },
];

// ---------------------------------------------------------------------------
// Collection center network nodes (Dashboard map card)
// ---------------------------------------------------------------------------
export const gridNetworkNodes = [
  { name: "Coimbatore", lat: 11.0168, lng: 76.9558, kind: "primary" },
  { name: "Erode", lat: 11.341, lng: 77.7172, kind: "secondary" },
  { name: "Salem", lat: 11.664, lng: 78.146, kind: "secondary" },
  { name: "Madurai", lat: 9.9252, lng: 78.1198, kind: "secondary" },
  { name: "Chennai", lat: 13.0827, lng: 80.2707, kind: "secondary" },
];

// ---------------------------------------------------------------------------
// Batch journey detail for MILK001 (Batch Detail page)
// ---------------------------------------------------------------------------
export const batchJourney = {
  id: "MILK001",
  contract: "0x4F8b...91A",
  gasGwei: 4.4,
  volumeLiters: 12350,
  union: "Erode Union",
  complianceScore: 100,
  route: [
    {
      status: "complete",
      title: "Farm Dispatch",
      subtitle: "Erode Dairy Cluster",
      details: ["Bd: 48°F", "Driver: S-9001"],
    },
    {
      status: "complete",
      title: "Chilling Center",
      subtitle: "Bhavani BMC",
      details: ["Bd: 37.8°F", "Sensor: 9C-022"],
    },
    {
      status: "complete",
      title: "Transit Tanker",
      subtitle: "TN-38/2802",
      details: ["3H 45M (Current)", "Estd: 19:35", "Variance +0.4°C"],
    },
    {
      status: "pending",
      title: "Processing Plant",
      subtitle: "Salem Central Dairy",
      details: ["Estd: 11:30 AM", "Batch #: 11134", "Intake Gate 2"],
    },
    {
      status: "pending",
      title: "Retail Cold Storage",
      subtitle: "Chennai Hub",
      details: ["Estd: 04:00 PM", "Bd: 40°F", "Hub Bay C"],
    },
  ],
  metrics: [
    { label: "MEAN TEMP", value: "3.92°C", note: "±0.3°C Dev." },
    { label: "PEAK RECORDED", value: "6.42°C", note: "+1.30 AM" },
    { label: "LOWEST RECORDED", value: "3.40°C", note: "06:15 AM" },
    { label: "THERMAL STABILITY", value: "99.3%", note: "Zero Excursions" },
  ],
  farmOrigin: {
    name: "Erode Cooperative Dairy Circle",
    zone: "Cluster Zone 04 — Bhavani Basin",
    farmers: "18 Registered (Erode)",
    gps: "11.445° N, 77.684° E",
  },
  chemistry: [
    { label: "FAT", value: "4.5%" },
    { label: "SNF", value: "8.5%" },
    { label: "QUALITY", value: "4.5/5" },
  ],
  merkleRoot: "0x7b8c5e58193c9822ea76932a789102934729",
  validationNode: "Tamil Nadu Dairy Board Digital",
  lastAssertion: "09:35:16",
};

// Temperature history for MILK001's continuous telemetry chart.
export const milk001TemperatureLog = [
  { time: "04:30", label: "04:30 AM (Dispatch)", temp: 3.6 },
  { time: "05:00", temp: 3.8 },
  { time: "05:30", label: "05:30 AM", temp: 3.7 },
  { time: "06:00", temp: 3.9 },
  { time: "06:30", label: "06:30 AM (Midway)", temp: 3.4 },
  { time: "07:00", temp: 4.1 },
  { time: "07:30", label: "07:30 AM", temp: 4.4 },
  { time: "08:00", temp: 5.2 },
  { time: "08:15", temp: 6.4 },
  { time: "08:30", label: "08:30 AM (Arrival)", temp: 4.0 },
];

// ---------------------------------------------------------------------------
// Verify page — certificate + custody timeline for MILK001
// ---------------------------------------------------------------------------
export const verifiedCertificate = {
  batchId: "MILK001",
  farmOrigin: {
    coop: "Erode Union Patrice Co-op",
    gps: "11.346° N, 77.717° E",
    farmers: "127 Member Farmers Verified",
  },
  pasteurization: {
    timestamp: "24 Oct 2025, 09:15 IST",
    compliance: "Thermal Standard Compliant",
    method: "Verification Method 2",
  },
  coldChainIntegrity: {
    percent: "100%",
    note: "Maintained • +0.0°C Variance",
    threshold: "Zero Breach Threshold",
  },
  smartContract: {
    address: "0x4e77...98c1",
    version: "Solidity v0.8.19 | Polygon PoS",
    validity: "Verification Valid 22 Blocks",
  },
  consensus: {
    block: "#849,112",
    confirmations: "2.14 Confirmations",
  },
  merkleHash:
    "0x88f2b2f7ab991c45e9df7f2fa6f36d7f6d8b2d9e3d5b1f4f2a8a9b1c78d1a7c9",
  signatureNode:
    "Digital Signature Verified by Tamil Nadu Milk Federation Node • 0x7F3A...C21B",
};

export const custodyTimeline = [
  {
    title: "Farm Chilling Vat",
    batchId: "MILK-001-RT",
    note: "Received at chilling center",
    timestamp: "03 Oct 2025, 05:07 IST",
    active: false,
  },
  {
    title: "Verified Tanker",
    batchId: "MILK-001-TNK",
    note: "GPS: 11.3421° N, 77.720° E",
    timestamp: "03 Oct 2025, 06:49 IST",
    active: false,
  },
  {
    title: "Automated Packaging",
    batchId: "MILK-001-PKG",
    note: "Sealed at 4.0°C under 20 min",
    timestamp: "05 Oct 2025, 05:37 IST",
    active: false,
  },
  {
    title: "Retail Cold Hub",
    batchId: "MILK-001-RTL",
    note: "Delivered to Chennai retail",
    timestamp: "04 Oct 2025, 18:42 IST",
    active: true,
  },
];

// ---------------------------------------------------------------------------
// Ledger page — block/transaction table
// ---------------------------------------------------------------------------
export const ledgerEntries = [
  {
    id: "849205",
    block: "849,205",
    txHash: "8x7f4e...9c12",
    batchId: "MILK001",
    eventType: "Temp Log Ping",
    temperature: "+3.8°C",
    tempStatus: "safe",
    timeAgo: "12s ago (14:32:05)",
    validator: "Node-Salem-04",
    status: "confirmed",
    expanded: {
      merkleRoot:
        "0x9a34d6c2819a0129d9b8c8bd4973baa4c0e9d9a1f923aa4e0fd3c6bf1d23a4",
      gasUsed: "21,430",
      nonce: "18492",
      sensorId: "*HTMS-ERD-9902",
      gps: "11.3410 N, 77.7172 E (Erode Farm Tract 39)",
      battery: "82%",
      compressor: "ACTIVE",
      signatures: [
        { name: "Farmer Co-Op", address: "0xE42...", signed: true },
        { name: "Logistics Carrier", address: "0xF06F...", signed: true },
        { name: "Chilling Center", address: "0x72A...", signed: true },
      ],
    },
  },
  {
    id: "849204",
    block: "849,204",
    txHash: "8x3d8a...8c21",
    batchId: "MILK002",
    eventType: "Chiller Handover",
    temperature: "+4.1°C",
    tempStatus: "safe",
    timeAgo: "1s ago (14:31:18)",
    validator: "Node-Erode-01",
    status: "confirmed",
  },
  {
    id: "849203",
    block: "849,203",
    txHash: "8x11a9...4b33",
    batchId: "MILK003",
    eventType: "Transit GPS + Temp",
    temperature: "+7.2°C",
    tempStatus: "critical",
    timeAgo: "4s ago (14:28:10)",
    validator: "Node-Madurai-02",
    status: "confirmed",
  },
  {
    id: "849202",
    block: "849,202",
    txHash: "8x982c...31e5",
    batchId: "MILK001",
    eventType: "Pasteurization Cycle",
    temperature: "+72.8°C",
    tempStatus: "info",
    timeAgo: "8s ago (14:24:58)",
    validator: "Node-Salem-01",
    status: "confirmed",
  },
  {
    id: "849201",
    block: "849,201",
    txHash: "8xee44...8881",
    batchId: "MILK004",
    eventType: "Quality Grade (Fat 4.2%)",
    temperature: "+3.4°C",
    tempStatus: "safe",
    timeAgo: "12s ago (14:28:11)",
    validator: "Node-Vellore-03",
    status: "pending",
    statusNote: "2/3",
  },
  {
    id: "849200",
    block: "849,200",
    txHash: "8xbcc52...192f",
    batchId: "MILK002",
    eventType: "Temp Log Ping",
    temperature: "+3.9°C",
    tempStatus: "safe",
    timeAgo: "16s ago (14:07:42)",
    validator: "Node-Salem-04",
    status: "confirmed",
  },
];

// ---------------------------------------------------------------------------
// Landing page mini-dashboard mockup card
// ---------------------------------------------------------------------------
export const heroBatchPreview = {
  label: "MILK-TRK-042",
  temperature: "3.8°C",
  block: "18,492",
  verifiedNote: "Verified 2 mins ago",
  chart: [3.6, 3.9, 3.7, 3.8, 3.5, 3.8, 3.9, 3.8],
  status: "OPTIMAL",
  variation: "0.2°C",
};

export const landingStats = [
  {
    value: "500+",
    label: "Batches Tracked",
    description:
      "Across 42 collection centers with real-time temperature monitoring",
  },
  {
    value: "10,000+",
    label: "Temperature Logs",
    description:
      "Recorded on-chain in the last 30 days with sub-second precision",
  },
  {
    value: "2°C–6°C",
    label: "Safe Range Validated",
    description:
      "98.7% of all batches retained within optimal cold-chain parameters",
  },
];
