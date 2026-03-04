import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ZoomOut } from 'lucide-react';
import { useState } from 'react';

interface ImagePreviewModalProps {
  src: string;
  alt: string;
  open: boolean;
  onClose: () => void;
}

const ImagePreviewModal = ({ src, alt, open, onClose }: ImagePreviewModalProps) => {
  const [zoom, setZoom] = useState(1);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/90 backdrop-blur-md z-[60] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            className="relative max-w-2xl max-h-[80vh]"
            onClick={e => e.stopPropagation()}
          >
            <div className="absolute -top-12 right-0 flex items-center gap-2">
              <button
                onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
                className="w-8 h-8 rounded-lg bg-muted/80 flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="text-xs text-muted-foreground font-mono">{Math.round(zoom * 100)}%</span>
              <button
                onClick={() => setZoom(z => Math.min(3, z + 0.25))}
                className="w-8 h-8 rounded-lg bg-muted/80 flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-muted/80 flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <motion.img
              src={src}
              alt={alt}
              animate={{ scale: zoom }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="rounded-xl shadow-2xl max-h-[75vh] object-contain"
              loading="lazy"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ImagePreviewModal;
