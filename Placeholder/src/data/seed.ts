import type { Database, Customer, Product, Invoice, InvoiceLineItem } from "@/types";
import { addDaysISO, todayISO } from "@/lib/format";

/**
 * Demo data so the app feels alive on first run. Replace by clearing data in
 * Settings, or wire a real backend and drop this file. Dates are computed
 * relative to "today" so the dashboard chart always looks current.
 *
 * The seller defaults to a consulting firm because that's our MVP wedge —
 * everything still works for the other business types.
 *
 * The invoice list is generated (not hand-written) so the demo looks like a
 * real, growing business: ~36 invoices spread across the last 7 months with a
 * believable upward revenue curve and a realistic status mix. Generation is
 * deterministic (seeded PRNG) so the demo looks identical on every load.
 */
/** A clean, empty workspace (used by "Start fresh" / onboarding from scratch). */
export function createEmptyDatabase(): Database {
  return {
    version: 1,
    onboarded: false,
    company: {
      name: "",
      legalName: "",
      email: "",
      phone: "",
      vatNumber: "",
      crNumber: "",
      address: "",
      city: "",
      businessType: "consulting",
    },
    settings: {
      invoicePrefix: "INV-",
      nextInvoiceNumber: 1001,
      defaultVatRate: 0.15,
      defaultDueDays: 30,
      defaultNotes: "Thank you for your business.",
      currency: "SAR",
      invoiceHeaderMode: "standard",
      invoiceLetterheadTopMm: 45,
      invoiceLetterheadBottomMm: 25,
      invoiceFooterText: "",
    },
    customers: [],
    products: [],
    invoices: [],
  };
}

/** Deterministic PRNG (mulberry32) so the generated demo is stable across loads. */
function mulberry32(seed: number): () => number {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createSeedDatabase(): Database {
  const today = todayISO();

  const customers: Customer[] = [
    {
      id: "cus_najm",
      name: "Layla Al-Harbi",
      company: "Najm Logistics",
      email: "layla@najm-logistics.sa",
      phone: "+966 50 123 4567",
      vatNumber: "311111111100003",
      address: "King Fahd Rd, Olaya, Riyadh",
      notes: "Prefers invoices in English. Net 30 terms.",
      createdAt: addDaysISO(today, -205) + "T09:00:00.000Z",
    },
    {
      id: "cus_tamkeen",
      name: "Omar Bin Saleh",
      company: "Tamkeen Retail Group",
      email: "omar@tamkeenretail.com",
      phone: "+966 55 987 6543",
      vatNumber: "312222222200003",
      address: "Prince Sultan St, Jeddah",
      notes: "",
      createdAt: addDaysISO(today, -198) + "T09:00:00.000Z",
    },
    {
      id: "cus_bayan",
      name: "Sara Al-Mutairi",
      company: "Bayan Technologies",
      email: "sara@bayan.tech",
      phone: "+966 53 444 2211",
      vatNumber: "313333333300003",
      address: "Al Khobar Corniche, Al Khobar",
      notes: "Key account on a quarterly retainer.",
      createdAt: addDaysISO(today, -190) + "T09:00:00.000Z",
    },
    {
      id: "cus_areej",
      name: "Fatimah Noor",
      company: "Areej Catering",
      email: "accounts@areej.sa",
      phone: "+966 56 222 8899",
      vatNumber: "",
      address: "Al Malqa District, Riyadh",
      notes: "Small business, no VAT number yet.",
      createdAt: addDaysISO(today, -140) + "T09:00:00.000Z",
    },
    {
      id: "cus_mawten",
      name: "Khalid Al-Dosari",
      company: "Mawten Real Estate",
      email: "khalid@mawten.sa",
      phone: "+966 50 771 3300",
      vatNumber: "314444444400003",
      address: "Al Muruj, Riyadh",
      notes: "Invoices via procurement portal.",
      createdAt: addDaysISO(today, -175) + "T09:00:00.000Z",
    },
    {
      id: "cus_rawaf",
      name: "Nasser Al-Qahtani",
      company: "Rawaf Trading Co.",
      email: "nasser@rawaf.com.sa",
      phone: "+966 54 300 1188",
      vatNumber: "315555555500003",
      address: "King Saud St, Dammam",
      notes: "",
      createdAt: addDaysISO(today, -168) + "T09:00:00.000Z",
    },
    {
      id: "cus_durrah",
      name: "Huda Al-Shammari",
      company: "Durrah Interiors",
      email: "huda@durrah.design",
      phone: "+966 55 610 4477",
      vatNumber: "316666666600003",
      address: "Al Rawdah, Jeddah",
      notes: "Half-day workshops preferred.",
      createdAt: addDaysISO(today, -150) + "T09:00:00.000Z",
    },
    {
      id: "cus_qimam",
      name: "Yousef Al-Ghamdi",
      company: "Qimam Consulting Partners",
      email: "yousef@qimam.partners",
      phone: "+966 50 909 2020",
      vatNumber: "317777777700003",
      address: "KAFD, Riyadh",
      notes: "Referral partner. Net 45.",
      createdAt: addDaysISO(today, -160) + "T09:00:00.000Z",
    },
    {
      id: "cus_nakhla",
      name: "Reem Al-Otaibi",
      company: "Nakhla Foods",
      email: "reem@nakhlafoods.sa",
      phone: "+966 56 143 7788",
      vatNumber: "318888888800003",
      address: "Al Hamra, Jeddah",
      notes: "",
      createdAt: addDaysISO(today, -120) + "T09:00:00.000Z",
    },
    {
      id: "cus_sadeem",
      name: "Faisal Al-Harthy",
      company: "Sadeem Cloud",
      email: "faisal@sadeem.cloud",
      phone: "+966 53 555 6600",
      vatNumber: "319999999900003",
      address: "Business Gate, Al Khobar",
      notes: "Key account, expanding scope next quarter.",
      createdAt: addDaysISO(today, -185) + "T09:00:00.000Z",
    },
    {
      id: "cus_barq",
      name: "Abdullah Al-Zahrani",
      company: "Barq Delivery",
      email: "ap@barq.delivery",
      phone: "+966 54 802 3311",
      vatNumber: "320000000000003",
      address: "Prince Mohammed St, Dammam",
      notes: "",
      createdAt: addDaysISO(today, -95) + "T09:00:00.000Z",
    },
    {
      id: "cus_lamar",
      name: "Dr. Aisha Al-Subaie",
      company: "Lamar Clinics",
      email: "finance@lamarclinics.sa",
      phone: "+966 50 447 9900",
      vatNumber: "321111111100003",
      address: "Al Yasmin, Riyadh",
      notes: "Send statements monthly.",
      createdAt: addDaysISO(today, -110) + "T09:00:00.000Z",
    },
  ];

  const products: Product[] = [
    {
      id: "prd_strategy",
      name: "Business strategy consultation",
      description: "Per-hour advisory session with a senior consultant.",
      unitPrice: 500,
      vatCategory: "standard",
      active: true,
      createdAt: addDaysISO(today, -210) + "T09:00:00.000Z",
    },
    {
      id: "prd_retainer",
      name: "Monthly advisory retainer",
      description: "Ongoing advisory support, billed monthly.",
      unitPrice: 8000,
      vatCategory: "standard",
      active: true,
      createdAt: addDaysISO(today, -210) + "T09:00:00.000Z",
    },
    {
      id: "prd_model",
      name: "Financial model build",
      description: "3-statement financial model with scenarios.",
      unitPrice: 4500,
      vatCategory: "standard",
      active: true,
      createdAt: addDaysISO(today, -200) + "T09:00:00.000Z",
    },
    {
      id: "prd_workshop",
      name: "Brand strategy workshop (half day)",
      description: "Facilitated half-day session for up to 8 people.",
      unitPrice: 3500,
      vatCategory: "standard",
      active: true,
      createdAt: addDaysISO(today, -190) + "T09:00:00.000Z",
    },
    {
      id: "prd_research",
      name: "Market research report",
      description: "Sector deep-dive with competitor benchmarking.",
      unitPrice: 6000,
      vatCategory: "standard",
      active: true,
      createdAt: addDaysISO(today, -180) + "T09:00:00.000Z",
    },
    {
      id: "prd_gtm",
      name: "Go-to-market roadmap",
      description: "90-day launch plan with owners and milestones.",
      unitPrice: 5500,
      vatCategory: "standard",
      active: true,
      createdAt: addDaysISO(today, -170) + "T09:00:00.000Z",
    },
    {
      id: "prd_pitch",
      name: "Investor pitch deck",
      description: "Narrative + designed deck for fundraising.",
      unitPrice: 3000,
      vatCategory: "standard",
      active: true,
      createdAt: addDaysISO(today, -150) + "T09:00:00.000Z",
    },
    {
      id: "prd_ops",
      name: "Operations process review",
      description: "Workflow audit with a prioritized improvement plan.",
      unitPrice: 4000,
      vatCategory: "standard",
      active: true,
      createdAt: addDaysISO(today, -130) + "T09:00:00.000Z",
    },
    {
      id: "prd_board",
      name: "Quarterly board advisory",
      description: "Board-pack preparation and quarterly review.",
      unitPrice: 12000,
      vatCategory: "standard",
      active: true,
      createdAt: addDaysISO(today, -120) + "T09:00:00.000Z",
    },
    {
      id: "prd_audit",
      name: "Website & funnel audit",
      description: "One-time audit with a prioritized action list.",
      unitPrice: 1500,
      vatCategory: "standard",
      active: false,
      createdAt: addDaysISO(today, -100) + "T09:00:00.000Z",
    },
  ];

  const invoices = generateInvoices(customers, products, today);

  return {
    version: 2,
    onboarded: true, // demo data is ready; the wizard is still available from signup/settings
    company: {
      name: "Riyadh Advisory Co.",
      legalName: "Riyadh Advisory Company LLC",
      email: "billing@riyadhadvisory.sa",
      phone: "+966 11 200 3000",
      vatNumber: "310000000000003",
      crNumber: "1010101010",
      address: "Building 12, King Abdullah Financial District",
      city: "Riyadh",
      businessType: "consulting",
    },
    settings: {
      invoicePrefix: "INV-",
      nextInvoiceNumber: 1001 + invoices.length,
      defaultVatRate: 0.15,
      defaultDueDays: 30,
      defaultNotes: "Payment due within the terms above. Thank you for your business.",
      currency: "SAR",
      invoiceHeaderMode: "standard",
      invoiceLetterheadTopMm: 45,
      invoiceLetterheadBottomMm: 25,
      invoiceFooterText: "",
    },
    customers,
    products,
    invoices,
  };
}

/**
 * Build a believable invoice history using day-offsets back from today (so no
 * invoice is ever future-dated, even on the 1st of a month). Volume rises
 * toward the present; older invoices are mostly paid, recent ones are a mix of
 * sent/overdue/draft. Windows mirror the dashboard's trailing 30-day buckets.
 */
function generateInvoices(customers: Customer[], products: Product[], today: string): Invoice[] {
  const rng = mulberry32(20260701);
  const pickInt = (min: number, max: number) => min + Math.floor(rng() * (max - min + 1));
  const chance = (p: number) => rng() < p;

  // A few "top" accounts recur more often (weighted pool of customer indices).
  const weights = [5, 3, 6, 2, 3, 3, 2, 5, 3, 6, 2, 3];
  const customerPool: number[] = [];
  weights.forEach((w, i) => {
    for (let n = 0; n < w; n++) customerPool.push(i);
  });

  // Billable services (the inactive audit is excluded from new invoices).
  const billable = products.filter((p) => p.active);
  const std = 0.15;

  // Invoices per 30-day window, index 0 = last 30 days … index 6 = oldest.
  // Decreasing with age → rising volume toward the present.
  const perWindow = [8, 6, 5, 5, 4, 4, 3];
  const invoices: Invoice[] = [];
  let seq = 1001;

  // Build oldest → newest so invoice numbers ascend with time.
  for (let w = perWindow.length - 1; w >= 0; w--) {
    const count = perWindow[w];
    for (let k = 0; k < count; k++) {
      const number = `INV-${seq}`;
      const id = `inv_${seq}`;
      // Spread across the window; window 0 stays a few days behind "today".
      const daysAgo = w * 30 + pickInt(w === 0 ? 1 : 0, 27);
      const issueDate = addDaysISO(today, -daysAgo);
      const customerId = customers[customerPool[Math.floor(rng() * customerPool.length)]].id;

      // 1–3 distinct line items.
      const itemCount = chance(0.15) ? 3 : chance(0.45) ? 2 : 1;
      const used = new Set<string>();
      const items: InvoiceLineItem[] = [];
      for (let li = 0; li < itemCount; li++) {
        let prod = billable[Math.floor(rng() * billable.length)];
        let guard = 0;
        while (used.has(prod.id) && guard++ < 8) {
          prod = billable[Math.floor(rng() * billable.length)];
        }
        if (used.has(prod.id)) continue;
        used.add(prod.id);
        const qty =
          prod.id === "prd_strategy"
            ? pickInt(2, 12)
            : prod.id === "prd_retainer" || prod.id === "prd_board"
              ? 1
              : pickInt(1, 2);
        items.push({
          id: `li_${seq}_${li}`,
          productId: prod.id,
          name: prod.name,
          quantity: qty,
          unitPrice: prod.unitPrice,
          vatRate: std,
        });
      }

      const discountPercent = chance(0.15) ? (chance(0.5) ? 10 : 5) : 0;
      const netDays = chance(0.2) ? 45 : chance(0.25) ? 15 : 30;
      const dueDate = addDaysISO(issueDate, netDays);

      // Status: older = paid; recent = mixed; current window has drafts.
      let status: Invoice["status"] = "paid";
      if (w === 0) {
        status = chance(0.3) ? "draft" : chance(0.6) ? "sent" : "paid";
      } else if (w === 1) {
        status = chance(0.65) ? "paid" : "sent"; // some "sent" become overdue via dueDate
      } else {
        status = chance(0.94) ? "paid" : "sent";
      }

      let paidDate: string | null = null;
      let updatedAt = issueDate + "T09:00:00.000Z";
      let notes = "";
      if (status === "paid") {
        let pd = addDaysISO(issueDate, pickInt(4, Math.min(netDays + 5, 28)));
        if (pd > today) pd = today;
        paidDate = pd;
        updatedAt = pd + "T14:30:00.000Z";
      } else if (status === "sent") {
        updatedAt = addDaysISO(issueDate, pickInt(1, 6)) + "T11:00:00.000Z";
        if (dueDate < today) notes = "Reminder sent.";
      }

      invoices.push({
        id,
        number,
        customerId,
        issueDate,
        dueDate,
        status,
        items,
        discountPercent,
        notes,
        paidDate,
        createdAt: issueDate + "T09:00:00.000Z",
        updatedAt,
      });
      seq++;
    }
  }

  return invoices;
}
