"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Upload, Trash2, ImageIcon, Stamp } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useStore } from "@/lib/store";
import { useToast } from "@/lib/toast";
import { fileToDataUrl } from "@/lib/image";

/** A labelled image upload with live preview + remove, used for both logo and stamp. */
function ImageUploader({
  label,
  hint,
  icon,
  value,
  maxDim,
  previewClass,
  onChange,
}: {
  label: string;
  hint: string;
  icon: React.ReactNode;
  value: string;
  maxDim: number;
  previewClass?: string;
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
        <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl border border-hairline bg-white/[0.03]">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element -- local data URL preview
            <img src={value} alt={`${label} preview`} className={previewClass ?? "h-full w-full object-contain p-1.5"} />
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

export function InvoiceBrandingCard() {
  const { settings, updateSettings } = useStore();
  const toast = useToast();

  function saveLogo(dataUrl: string) {
    updateSettings({ invoiceLogoDataUrl: dataUrl });
    toast.success(dataUrl ? "Logo updated" : "Logo removed");
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

  return (
    <Card>
      <CardHeader
        title="Invoice branding"
        subtitle="Your logo and stamp flow onto every invoice automatically. Leave the logo empty to use the default Invoice X mark."
      />
      <CardBody className="space-y-6">
        <ImageUploader
          label="Company logo"
          hint="PNG, JPG, WEBP, or SVG. Shown in the invoice header."
          icon={<ImageIcon className="h-6 w-6" />}
          value={settings.invoiceLogoDataUrl}
          maxDim={360}
          onChange={saveLogo}
        />

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
      </CardBody>
    </Card>
  );
}
