/**
 * ZATCA Phase-2 structural preview: UBL 2.1 Invoice XML builder.
 *
 * This produces a structurally correct UBL invoice covering the fields ZATCA's
 * schema cares about (parties, VAT breakdown, ICV/PIH, monetary totals), but
 * it is NOT byte-conformant with ZATCA's official canonicalization algorithm
 * (which strips the UBLExtensions signature block before hashing, among other
 * rules). The hash in signing.ts is computed over this generated XML directly
 * — good enough for an internally consistent preview/demo, but it would need
 * validation against ZATCA's real SDK before any live submission. See
 * CLAUDE.md.
 */

import type { Company, Customer, InvoiceLineItem, InvoiceTotals } from "@/types";
import { lineSubtotal, round2 } from "@/lib/calc";

export interface UblInvoiceInput {
  company: Company;
  customer: Customer | null;
  invoiceNumber: string;
  invoiceId: string;
  issueDateTime: Date;
  currency: string;
  items: InvoiceLineItem[];
  totals: InvoiceTotals;
  icv: number;
  previousHash: string;
}

export function escapeXml(value: string): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function isoTime(d: Date): string {
  return d.toISOString().slice(11, 19);
}

function vatRatePercent(rate: number): string {
  return round2(rate * 100).toFixed(2);
}

function invoiceLineXml(item: InvoiceLineItem, currency: string, index: number): string {
  const subtotal = lineSubtotal(item);
  const vatAmount = round2(subtotal * (Number(item.vatRate) || 0));
  const lineTotal = round2(subtotal + vatAmount);
  return `
    <cac:InvoiceLine>
      <cbc:ID>${index + 1}</cbc:ID>
      <cbc:InvoicedQuantity unitCode="PCE">${item.quantity}</cbc:InvoicedQuantity>
      <cbc:LineExtensionAmount currencyID="${escapeXml(currency)}">${subtotal.toFixed(2)}</cbc:LineExtensionAmount>
      <cac:TaxTotal>
        <cbc:TaxAmount currencyID="${escapeXml(currency)}">${vatAmount.toFixed(2)}</cbc:TaxAmount>
        <cbc:RoundingAmount currencyID="${escapeXml(currency)}">${lineTotal.toFixed(2)}</cbc:RoundingAmount>
      </cac:TaxTotal>
      <cac:Item>
        <cbc:Name>${escapeXml(item.name)}</cbc:Name>
        <cac:ClassifiedTaxCategory>
          <cbc:ID>${Number(item.vatRate) > 0 ? "S" : "Z"}</cbc:ID>
          <cbc:Percent>${vatRatePercent(item.vatRate)}</cbc:Percent>
          <cac:TaxScheme>
            <cbc:ID>VAT</cbc:ID>
          </cac:TaxScheme>
        </cac:ClassifiedTaxCategory>
      </cac:Item>
      <cac:Price>
        <cbc:PriceAmount currencyID="${escapeXml(currency)}">${Number(item.unitPrice).toFixed(2)}</cbc:PriceAmount>
      </cac:Price>
    </cac:InvoiceLine>`;
}

/** Build the UBL 2.1 Invoice XML for one invoice. Pure function of its inputs. */
export function buildUblInvoiceXml(input: UblInvoiceInput): string {
  const { company, customer, invoiceNumber, invoiceId, issueDateTime, currency, items, totals, icv, previousHash } =
    input;

  const lines = items.map((item, i) => invoiceLineXml(item, currency, i)).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
  xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
  xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:ProfileID>reporting:1.0</cbc:ProfileID>
  <cbc:ID>${escapeXml(invoiceNumber)}</cbc:ID>
  <cbc:UUID>${escapeXml(invoiceId)}</cbc:UUID>
  <cbc:IssueDate>${isoDate(issueDateTime)}</cbc:IssueDate>
  <cbc:IssueTime>${isoTime(issueDateTime)}</cbc:IssueTime>
  <cbc:InvoiceTypeCode name="0200000">388</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>${escapeXml(currency)}</cbc:DocumentCurrencyCode>
  <cbc:TaxCurrencyCode>${escapeXml(currency)}</cbc:TaxCurrencyCode>
  <cac:AdditionalDocumentReference>
    <cbc:ID>ICV</cbc:ID>
    <cbc:UUID>${icv}</cbc:UUID>
  </cac:AdditionalDocumentReference>
  <cac:AdditionalDocumentReference>
    <cbc:ID>PIH</cbc:ID>
    <cac:Attachment>
      <cbc:EmbeddedDocumentBinaryObject mimeCode="text/plain">${escapeXml(previousHash)}</cbc:EmbeddedDocumentBinaryObject>
    </cac:Attachment>
  </cac:AdditionalDocumentReference>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${escapeXml(company.legalName || company.name)}</cbc:RegistrationName>
        <cbc:CompanyID>${escapeXml(company.crNumber)}</cbc:CompanyID>
      </cac:PartyLegalEntity>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${escapeXml(company.vatNumber)}</cbc:CompanyID>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:PostalAddress>
        <cbc:StreetName>${escapeXml(company.address)}</cbc:StreetName>
        <cbc:CityName>${escapeXml(company.city)}</cbc:CityName>
        <cac:Country>
          <cbc:IdentificationCode>SA</cbc:IdentificationCode>
        </cac:Country>
      </cac:PostalAddress>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${escapeXml(customer?.company || customer?.name || "")}</cbc:RegistrationName>
      </cac:PartyLegalEntity>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${escapeXml(customer?.vatNumber || "")}</cbc:CompanyID>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:PostalAddress>
        <cbc:StreetName>${escapeXml(customer?.address || "")}</cbc:StreetName>
        <cac:Country>
          <cbc:IdentificationCode>SA</cbc:IdentificationCode>
        </cac:Country>
      </cac:PostalAddress>
    </cac:Party>
  </cac:AccountingCustomerParty>
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="${escapeXml(currency)}">${totals.vatTotal.toFixed(2)}</cbc:TaxAmount>
  </cac:TaxTotal>
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="${escapeXml(currency)}">${totals.subtotal.toFixed(2)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="${escapeXml(currency)}">${round2(totals.subtotal - totals.discountAmount).toFixed(2)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="${escapeXml(currency)}">${totals.total.toFixed(2)}</cbc:TaxInclusiveAmount>
    <cbc:AllowanceTotalAmount currencyID="${escapeXml(currency)}">${totals.discountAmount.toFixed(2)}</cbc:AllowanceTotalAmount>
    <cbc:PayableAmount currencyID="${escapeXml(currency)}">${totals.total.toFixed(2)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>${lines}
</Invoice>
`;
}
