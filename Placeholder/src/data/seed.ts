import type { Database, Customer, Product, Invoice } from "@/types";
import { addDaysISO, todayISO } from "@/lib/format";

/**
 * Demo data so the app feels alive on first run. Replace by clearing data in
 * Settings, or wire a real backend and drop this file. Dates are computed
 * relative to "today" so the dashboard chart always looks current.
 *
 * The seller defaults to a consulting firm because that's our MVP wedge —
 * everything still works for the other business types.
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
    },
    customers: [],
    products: [],
    invoices: [],
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
      createdAt: addDaysISO(today, -160) + "T09:00:00.000Z",
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
      createdAt: addDaysISO(today, -120) + "T09:00:00.000Z",
    },
    {
      id: "cus_bayan",
      name: "Sara Al-Mutairi",
      company: "Bayan Technologies",
      email: "sara@bayan.tech",
      phone: "+966 53 444 2211",
      vatNumber: "313333333300003",
      address: "Al Khobar Corniche, Al Khobar",
      notes: "Key account — quarterly retainer.",
      createdAt: addDaysISO(today, -90) + "T09:00:00.000Z",
    },
    {
      id: "cus_areej",
      name: "Fatimah Noor",
      company: "Areej Catering",
      email: "accounts@areej.sa",
      phone: "+966 56 222 8899",
      vatNumber: "",
      address: "Al Malqa District, Riyadh",
      notes: "Small business — no VAT number yet.",
      createdAt: addDaysISO(today, -30) + "T09:00:00.000Z",
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
      createdAt: addDaysISO(today, -170) + "T09:00:00.000Z",
    },
    {
      id: "prd_retainer",
      name: "Monthly advisory retainer",
      description: "Ongoing advisory support, billed monthly.",
      unitPrice: 8000,
      vatCategory: "standard",
      active: true,
      createdAt: addDaysISO(today, -170) + "T09:00:00.000Z",
    },
    {
      id: "prd_model",
      name: "Financial model build",
      description: "3-statement financial model with scenarios.",
      unitPrice: 4500,
      vatCategory: "standard",
      active: true,
      createdAt: addDaysISO(today, -150) + "T09:00:00.000Z",
    },
    {
      id: "prd_workshop",
      name: "Brand strategy workshop (half day)",
      description: "Facilitated half-day session for up to 8 people.",
      unitPrice: 3500,
      vatCategory: "standard",
      active: true,
      createdAt: addDaysISO(today, -80) + "T09:00:00.000Z",
    },
    {
      id: "prd_audit",
      name: "Website & funnel audit",
      description: "One-time audit with a prioritized action list.",
      unitPrice: 1500,
      vatCategory: "standard",
      active: false,
      createdAt: addDaysISO(today, -60) + "T09:00:00.000Z",
    },
  ];

  const std = 0.15;
  const invoices: Invoice[] = [
    {
      id: "inv_1001",
      number: "INV-1001",
      customerId: "cus_najm",
      issueDate: addDaysISO(today, -150),
      dueDate: addDaysISO(today, -120),
      status: "paid",
      items: [
        { id: "li_1", productId: "prd_retainer", name: "Monthly advisory retainer", quantity: 1, unitPrice: 8000, vatRate: std },
      ],
      discountPercent: 0,
      notes: "Thank you for your business.",
      paidDate: addDaysISO(today, -125),
      createdAt: addDaysISO(today, -150) + "T09:00:00.000Z",
      updatedAt: addDaysISO(today, -125) + "T09:00:00.000Z",
    },
    {
      id: "inv_1002",
      number: "INV-1002",
      customerId: "cus_tamkeen",
      issueDate: addDaysISO(today, -110),
      dueDate: addDaysISO(today, -80),
      status: "paid",
      items: [
        { id: "li_2", productId: "prd_model", name: "Financial model build", quantity: 1, unitPrice: 4500, vatRate: std },
        { id: "li_3", productId: "prd_strategy", name: "Business strategy consultation", quantity: 6, unitPrice: 500, vatRate: std },
      ],
      discountPercent: 10,
      notes: "",
      paidDate: addDaysISO(today, -85),
      createdAt: addDaysISO(today, -110) + "T09:00:00.000Z",
      updatedAt: addDaysISO(today, -85) + "T09:00:00.000Z",
    },
    {
      id: "inv_1003",
      number: "INV-1003",
      customerId: "cus_bayan",
      issueDate: addDaysISO(today, -70),
      dueDate: addDaysISO(today, -40),
      status: "paid",
      items: [
        { id: "li_4", productId: "prd_retainer", name: "Monthly advisory retainer", quantity: 1, unitPrice: 8000, vatRate: std },
        { id: "li_5", productId: "prd_workshop", name: "Brand strategy workshop (half day)", quantity: 1, unitPrice: 3500, vatRate: std },
      ],
      discountPercent: 0,
      notes: "",
      paidDate: addDaysISO(today, -4),
      createdAt: addDaysISO(today, -70) + "T09:00:00.000Z",
      updatedAt: addDaysISO(today, -4) + "T09:00:00.000Z",
    },
    {
      id: "inv_1004",
      number: "INV-1004",
      customerId: "cus_najm",
      issueDate: addDaysISO(today, -40),
      dueDate: addDaysISO(today, -10),
      status: "sent",
      items: [
        { id: "li_6", productId: "prd_retainer", name: "Monthly advisory retainer", quantity: 1, unitPrice: 8000, vatRate: std },
      ],
      discountPercent: 0,
      notes: "Second reminder sent.",
      paidDate: null,
      createdAt: addDaysISO(today, -40) + "T09:00:00.000Z",
      updatedAt: addDaysISO(today, -12) + "T09:00:00.000Z",
    },
    {
      id: "inv_1005",
      number: "INV-1005",
      customerId: "cus_bayan",
      issueDate: addDaysISO(today, -8),
      dueDate: addDaysISO(today, 22),
      status: "sent",
      items: [
        { id: "li_7", productId: "prd_strategy", name: "Business strategy consultation", quantity: 10, unitPrice: 500, vatRate: std },
      ],
      discountPercent: 0,
      notes: "",
      paidDate: null,
      createdAt: addDaysISO(today, -8) + "T09:00:00.000Z",
      updatedAt: addDaysISO(today, -8) + "T09:00:00.000Z",
    },
    {
      id: "inv_1006",
      number: "INV-1006",
      customerId: "cus_areej",
      issueDate: today,
      dueDate: addDaysISO(today, 14),
      status: "draft",
      items: [
        { id: "li_8", productId: "prd_workshop", name: "Brand strategy workshop (half day)", quantity: 1, unitPrice: 3500, vatRate: std },
      ],
      discountPercent: 0,
      notes: "",
      paidDate: null,
      createdAt: today + "T09:00:00.000Z",
      updatedAt: today + "T09:00:00.000Z",
    },
  ];

  return {
    version: 1,
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
      nextInvoiceNumber: 1007,
      defaultVatRate: 0.15,
      defaultDueDays: 30,
      defaultNotes: "Payment due within the terms above. Thank you for your business.",
      currency: "SAR",
    },
    customers,
    products,
    invoices,
  };
}
