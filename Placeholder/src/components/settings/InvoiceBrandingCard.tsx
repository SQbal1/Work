"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Upload, Trash2, ImageIcon, Stamp, PanelTop } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useStore } from "@/lib/store";
import { useToast } from "@/lib/toast";
import { fileToDataUrl } from "@/lib/image";

/** A labelled image upload with live preview + remove, used for logo, stamp, and letterhead banners. */
function ImageUploader({
  label,
  hint,
  icon,
  value,
  maxDim,
  wide,
  onChange,
}: {
  label: string;
  hint: string;
  icon: React.ReactNode;
  value: string;
  maxDim: number;
  wide?: boolean;
  onChange: (dataUrl: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file after a remove
    if (!file) return;
    setBusy(true);
    try {
      onChange(await fileToDataUrl(file, maxDim));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't process that image.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-cloud">{label}</div>
      <div className="flex items-center gap-4">
        <div
          className={cnBox(wide)}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element -- local data URL preview
            <img src={value} alt={`${label} preview`} className="h-full w-full object-contain p-1.5" />
          ) : (
            <span className="text-fog">{icon}</span>
          )}
        </div>
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
            >
              <Upload className="h-4 w-4" /> {busy ? "Uploading…" : value ? "Replace" : "Upload"}
            </Button>
            {value ? (
              <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")}>
                <Trash2 className="h-4 w-4" /> Remove
              </Button>
            ) : null}
          </div>
          <p className="text-xs text-fog">{hint}</p>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}

function cnBox(wide?: boolean) {
  return [
    "grid shrink-0 place-items-center overflow-hidden rounded-xl border border-hairline bg-white/[0.03]",
    wide ? "h-16 w-40" : "h-20 w-20",
  ].join(" ");
}

export function InvoiceBrandingCard() {
  const { settings, updateSettings } = useStore();
  const toast = useToast();
  const [scale, setScale] = useState(settings.invoiceLogoScale);

  function saveLogo(dataUrl: string) {
    updateSettings({ invoiceLogoDataUrl: dataUrl });
    toast.success(dataUrl ? "Logo updated" : "Logo removed");
  }

  function commitScale(next: number) {
    if (next !== settings.invoiceLogoScale) updateSettings({ invoiceLogoScale: next });
  }

  function saveStamp(dataUrl: string) {
    // Uploading a stamp turns it on by default; removing it turns the feature off.
    updateSettings({
      invoiceStampDataUrl: dataUrl,
      invoiceStampEnabled: dataUrl ? true : false,
    });
    toast.success(dataUrl ? "Stamp updated" : "Stamp removed");
  }

  function toggleStamp() {
    updateSettings({ invoiceStampEnabled: !settings.invoiceStampEnabled });
  }

  function toggleLetterhead() {
    updateSettings({ invoiceLetterheadImageEnabled: !settings.invoiceLetterheadImageEnabled });
  }

  const letterheadOn = settings.invoiceLetterheadImageEnabled;

  return (
    <Card>
      <CardHeader
        title="Invoice branding"
        subtitle="Your logo, stamp, and letterhead flow onto every invoice automatically. Leave the logo empty to use the default Invoice X mark."
      />
      <CardBody className="space-y-6">
        <div className="space-y-4">
          <ImageUploader
            label="Company logo"
            hint="PNG, JPG, WEBP, or SVG. Shown at the top of the invoice."
            icon={<ImageIcon className="h-6 w-6" />}
            value={settings.invoiceLogoDataUrl}
            maxDim={480}
            onChange={saveLogo}
          />
          {/* Logo size — tenants can scale their own logo up or down. */}
          <div className="max-w-sm">
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="font-medium text-cloud">Logo size</span>
              <span className="font-mono text-xs text-fog">{scale}%</span>
            </div>
            <input
              type="range"
              min={50}
              max={200}
              step={5}
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              onMouseUp={() => commitScale(scale)}
              onTouchEnd={() => commitScale(scale)}
              onKeyUp={() => commitScale(scale)}
              className="w-full accent-signal"
              aria-label="Logo size percentage"
            />
            <div className="mt-1 flex justify-between text-[10px] uppercase tracking-wide text-fog">
              <span>Smaller</span>
              <span>Larger</span>
            </div>
          </div>
        </div>

        <div className="border-t border-hairline pt-6">
          <ImageUploader
            label="Company stamp / seal"
            hint="A transparent PNG works best — it prints near the signature line."
            icon={<Stamp className="h-6 w-6" />}
            value={settings.invoiceStampDataUrl}
            maxDim={400}
            onChange={saveStamp}
          />
          {settings.invoiceStampDataUrl ? (
            <label className="mt-3 flex cursor-pointer items-center gap-3 text-sm text-cloud">
              <input
                type="checkbox"
                checked={settings.invoiceStampEnabled}
                onChange={toggleStamp}
                className="h-4 w-4 rounded border-hairline bg-white/[0.03] accent-signal"
              />
              Attach the stamp to every generated invoice
            </label>
          ) : null}
        </div>

        {/* Letterhead header & footer — embed a tenant's own branded banners. */}
        <div className="space-y-4 border-t border-hairline pt-6">
          <div className="flex items-start gap-3">
            <PanelTop className="mt-0.5 h-5 w-5 shrink-0 text-fog" />
            <div className="min-w-0">
              <div className="text-sm font-medium text-cloud">Letterhead header &amp; footer</div>
              <p className="text-xs text-fog">
                Upload banners that print full-width across the top and bottom of every invoice, so it
                generates onto your own letterhead. Turn it off to show the standard header.
              </p>
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-3 text-sm text-cloud">
            <input
              type="checkbox"
              checked={letterheadOn}
              onChange={toggleLetterhead}
              className="h-4 w-4 rounded border-hairline bg-white/[0.03] accent-signal"
            />
            Use my letterhead header &amp; footer
          </label>

          {letterheadOn ? (
            <div className="space-y-5 rounded-xl border border-hairline bg-white/[0.02] p-4">
              <ImageUploader
                label="Header banner"
                hint="Full-width image printed at the very top (your letterhead header)."
                icon={<PanelTop className="h-6 w-6" />}
                value={settings.invoiceHeaderImageDataUrl}
                maxDim={1400}
                wide
                onChange={(url) => {
                  updateSettings({ invoiceHeaderImageDataUrl: url });
                  toast.success(url ? "Header banner updated" : "Header banner removed");
                }}
              />
              <ImageUploader
                label="Footer banner"
                hint="Full-width image printed at the very bottom (your letterhead footer)."
                icon={<PanelTop className="h-6 w-6 rotate-180" />}
                value={settings.invoiceFooterImageDataUrl}
                maxDim={1400}
                wide
                onChange={(url) => {
                  updateSettings({ invoiceFooterImageDataUrl: url });
                  toast.success(url ? "Footer banner updated" : "Footer banner removed");
                }}
              />
            </div>
          ) : null}
        </div>
      </CardBody>
    </Card>
  );
}
