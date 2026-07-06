"use client";

import { useCallback, useEffect, useState } from "react";
import { Fingerprint, Plus, Trash2, Loader2 } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/lib/toast";
import { passkeyErrorMessage } from "@/lib/passkey";
import { formatDate } from "@/lib/format";

type PasskeyItem = {
  id: string;
  friendly_name?: string;
  created_at: string;
  last_used_at?: string;
};

/**
 * Passkey management for signed-in users: register a Touch ID / Face ID /
 * security-key credential, and revoke ones you no longer use. Only rendered
 * for real (Supabase) sessions — the local demo has no account to attach a
 * passkey to.
 */
export function PasskeysCard() {
  const toast = useToast();
  const [items, setItems] = useState<PasskeyItem[] | null>(null);
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.passkey.list();
      setItems(error ? [] : (data ?? []));
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function add() {
    setAdding(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.registerPasskey();
      if (error) {
        toast.error(passkeyErrorMessage(error.message));
      } else {
        toast.success("Passkey added. You can sign in with it next time.");
        await load();
      }
    } catch (err) {
      toast.error(passkeyErrorMessage(err instanceof Error ? err.message : null));
    }
    setAdding(false);
  }

  async function remove(id: string) {
    setRemovingId(id);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.passkey.delete({ passkeyId: id });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Passkey removed");
        await load();
      }
    } catch {
      toast.error("Couldn't remove that passkey. Try again.");
    }
    setRemovingId(null);
  }

  return (
    <Card>
      <CardHeader
        title="Passkeys"
        subtitle="Sign in with Touch ID, Face ID, or a security key instead of a password."
        action={
          <Button variant="secondary" size="sm" onClick={add} disabled={adding}>
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add passkey
          </Button>
        }
      />
      <CardBody>
        {items === null ? (
          <div className="flex items-center gap-2 text-sm text-fog">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading passkeys…
          </div>
        ) : items.length === 0 ? (
          <div className="flex items-start gap-3 rounded-[10px] border border-hairline bg-ink p-4 text-sm text-fog">
            <Fingerprint className="mt-0.5 h-5 w-5 shrink-0 text-signal" />
            <p>
              No passkeys yet. Add one to sign in with your fingerprint or face next time, with no
              password to remember.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-3 rounded-[10px] border border-hairline bg-ink p-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] border border-signal/20 bg-signal/10 text-signal">
                    <Fingerprint className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-bone">
                      {p.friendly_name || "Passkey"}
                    </div>
                    <div className="text-xs text-fog">Added {formatDate(p.created_at)}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => remove(p.id)}
                  disabled={removingId === p.id}
                  aria-label="Remove passkey"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] text-fog transition hover:bg-white/[0.03] hover:text-mute-red disabled:opacity-50"
                >
                  {removingId === p.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
