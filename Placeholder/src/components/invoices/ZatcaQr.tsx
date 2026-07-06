"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { buildZatcaTlvBase64, type ZatcaQrInput } from "@/lib/zatca";

/**
 * Renders a ZATCA QR from the invoice's TLV payload — Phase-1-style by
 * default, upgrading to the Phase-2-style fields (hash/signature/public key)
 * once the optional signing props are supplied. Generated client-side on
 * mount; falls back to a subtle placeholder while it renders so the
 * print/preview layout never jumps.
 */
export function ZatcaQr({ size = 96, ...input }: ZatcaQrInput & { size?: number }) {
  const [svg, setSvg] = useState<string>("");
  const { sellerName, vatNumber, timestamp, total, vatTotal, invoiceHash, signature, publicKey } = input;

  useEffect(() => {
    let cancelled = false;
    const payload = buildZatcaTlvBase64({
      sellerName,
      vatNumber,
      timestamp,
      total,
      vatTotal,
      invoiceHash,
      signature,
      publicKey,
    });
    QRCode.toString(payload, {
      type: "svg",
      margin: 0,
      errorCorrectionLevel: "M",
      color: { dark: "#121317", light: "#00000000" },
    })
      .then((out) => {
        if (!cancelled) setSvg(out);
      })
      .catch(() => {
        /* leave placeholder */
      });
    return () => {
      cancelled = true;
    };
  }, [sellerName, vatNumber, timestamp, total, vatTotal, invoiceHash, signature, publicKey]);

  return (
    <div
      className="rounded-[10px] border border-slate-200 bg-white p-1.5 [&>svg]:h-full [&>svg]:w-full"
      style={{ width: size, height: size }}
      aria-label="ZATCA QR code preview"
    >
      {svg ? (
        <div className="h-full w-full" dangerouslySetInnerHTML={{ __html: svg }} />
      ) : (
        <div className="h-full w-full animate-pulse rounded-[4px] bg-slate-100" />
      )}
    </div>
  );
}
