// Camera QR scanner (html5-qrcode, loaded on demand) with a minimal
// animated viewfinder. Used by riders to find orders and by farmers to
// verify pickup QRs. Falls back to a clear message without a camera.
"use client";

import { CameraOff } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

/**
 * @param onResult - called once with the decoded text (scanner then stops)
 */
export function QrScanner({ onResult }: { onResult: (text: string) => void }) {
  const id = useId().replace(/:/g, "");
  const [error, setError] = useState<string | null>(null);
  const done = useRef(false);
  const cb = useRef(onResult);
  useEffect(() => {
    cb.current = onResult;
  });

  useEffect(() => {
    let scanner: import("html5-qrcode").Html5Qrcode | null = null;
    let cancelled = false;
    (async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (cancelled) return;
        scanner = new Html5Qrcode(`qr-${id}`, { verbose: false });
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 220, height: 220 }, aspectRatio: 1 },
          (text) => {
            if (done.current) return;
            done.current = true;
            navigator.vibrate?.(60);
            cb.current(text);
            scanner?.stop().catch(() => {});
          },
          () => {},
        );
      } catch {
        if (!cancelled) setError("Camera unavailable — allow camera access, or type the code instead.");
      }
    })();
    return () => {
      cancelled = true;
      scanner
        ?.stop()
        .catch(() => {})
        .finally(() => {
          try {
            scanner?.clear();
          } catch {
            /* already cleared */
          }
        });
    };
  }, [id]);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-3xl bg-black">
      <div id={`qr-${id}`} className="size-full [&_video]:size-full [&_video]:object-cover" />
      {error ? (
        <div className="absolute inset-0 grid place-items-center p-6 text-center text-sm text-white/80">
          <div>
            <CameraOff className="mx-auto mb-2 size-8" />
            {error}
          </div>
        </div>
      ) : (
        <div aria-hidden className="pointer-events-none absolute inset-[18%]">
          <span className="absolute top-0 left-0 size-8 rounded-tl-xl border-t-4 border-l-4 border-lime" />
          <span className="absolute top-0 right-0 size-8 rounded-tr-xl border-t-4 border-r-4 border-lime" />
          <span className="absolute bottom-0 left-0 size-8 rounded-bl-xl border-b-4 border-l-4 border-lime" />
          <span className="absolute right-0 bottom-0 size-8 rounded-br-xl border-r-4 border-b-4 border-lime" />
          <span className="absolute inset-x-2 h-0.5 animate-scan bg-lime shadow-[0_0_16px_3px_var(--lime)]" />
        </div>
      )}
    </div>
  );
}
