import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, X, CheckCircle2 } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

interface Props {
  open: boolean;
  onClose: () => void;
  onScan: (decoded: string) => void;
  title?: string;
}

const REGION_ID = 'qr-scanner-region';

/** Reusable QR camera scanner using html5-qrcode. */
const QrScannerModal = ({ open, onClose, onScan, title }: Props) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setError(null);
    setLastResult(null);

    const start = async () => {
      try {
        const scanner = new Html5Qrcode(REGION_ID, { verbose: false });
        scannerRef.current = scanner;
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (decoded) => {
            if (cancelled) return;
            setLastResult(decoded);
            onScan(decoded);
            scanner.stop().catch(() => {});
          },
          () => {}
        );
      } catch (e: any) {
        setError(e?.message || 'Impossible d\'accéder à la caméra');
      }
    };
    start();

    return () => {
      cancelled = true;
      const s = scannerRef.current;
      if (s) {
        s.stop().catch(() => {}).finally(() => s.clear().catch(() => {}));
        scannerRef.current = null;
      }
    };
  }, [open, onScan]);

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            {title || 'Scanner un QR code'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative rounded-xl overflow-hidden bg-black aspect-square mb-4">
          <div id={REGION_ID} className="w-full h-full [&_video]:object-cover [&_video]:w-full [&_video]:h-full" />
          {!error && !lastResult && (
            <>
              <div className="absolute inset-6 border-2 border-primary/70 rounded-xl pointer-events-none" />
              <div className="absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-primary/80 animate-pulse" style={{ boxShadow: '0 0 12px hsl(var(--primary))' }} />
            </>
          )}
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-xs text-destructive">{error}</div>
        )}
        {lastResult && (
          <div className="p-3 rounded-lg bg-success/10 border border-success/30 text-xs text-success flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span className="font-mono truncate">{lastResult}</span>
          </div>
        )}
        {!error && !lastResult && (
          <p className="text-xs text-muted-foreground text-center">Pointez la caméra vers un QR code</p>
        )}
      </motion.div>
    </motion.div>
  );
};

export default QrScannerModal;
