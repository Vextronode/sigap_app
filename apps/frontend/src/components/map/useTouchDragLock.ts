import { useEffect } from "react";
import { useMap } from "react-leaflet";

const isTouchDevice = () => window.matchMedia("(pointer: coarse)").matches;

/**
 * Di perangkat sentuh, geser satu jari hanya aktif setelah peta diketuk agar scroll
 * halaman tidak terjebak di atas peta. Sentuhan di luar bingkai peta (elemen induk
 * kontainer Leaflet, tempat onMouseLeave dipasang di desktop) menonaktifkannya lagi.
 * Desktop tidak terpengaruh.
 */
export const useTouchDragLock = (isInteractive: boolean, onDeactivate: () => void) => {
  const map = useMap();

  useEffect(() => {
    if (!isTouchDevice()) return;
    if (isInteractive) {
      map.dragging.enable();
    } else {
      map.dragging.disable();
    }
  }, [isInteractive, map]);

  useEffect(() => {
    if (!isInteractive || !isTouchDevice()) return;
    const frame = map.getContainer().parentElement ?? map.getContainer();
    const handleTouchStart = (event: TouchEvent) => {
      if (!frame.contains(event.target as Node)) onDeactivate();
    };
    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    return () => document.removeEventListener("touchstart", handleTouchStart);
  }, [isInteractive, map, onDeactivate]);
};
