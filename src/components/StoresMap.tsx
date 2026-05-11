"use client";

import { useEffect, useRef, useState } from "react";
import type { Map, Marker } from "leaflet";

type Store = {
  name: string;
  city: string;
  address: string;
  phone: string;
  whatsapp: string;
  maps: string;
  hours: string;
  lat: number;
  lng: number;
};

type Props = {
  stores: Store[];
  activeStore: string | null;
  onMarkerClick: (name: string) => void;
  locale: string;
};

export default function StoresMap({ stores, activeStore, onMarkerClick, locale }: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<Map | null>(null);
  const markers = useRef<{ name: string; marker: Marker }[]>([]);
  const [showOverlay, setShowOverlay] = useState(false);
  const isAr = locale === "ar";

  useEffect(() => {
    // Leaflet CSS'ini manuel olarak ekle
    if (!document.querySelector("#leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    const initMap = async () => {
      const L = await import("leaflet");
      
      if (!mapRef.current || mapInstance.current) return;

      // Marker icon fix
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // Create map
      const map = L.map(mapRef.current).setView([25.2048, 55.2708], 11);

      // Base tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapInstance.current = map;

      // Add markers
      stores.forEach((store) => {
        const marker = L.marker([store.lat, store.lng])
          .addTo(map)
          .bindPopup(`
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; min-width: 240px;">
              <div style="font-weight: 700; font-size: 14px; color: #1a3a4f; margin-bottom: 8px; border-bottom: 2px solid #0e76bc; padding-bottom: 6px;">
                ${store.name}
              </div>
              <div style="font-size: 12px; color: #4b5563; margin-bottom: 4px;">
                📍 ${store.address}
              </div>
              <div style="font-size: 12px; color: #4b5563; margin-bottom: 4px;">
                🕐 ${store.hours}
              </div>
              <div style="font-size: 12px; color: #4b5563; margin-bottom: 8px;">
                📞 ${store.phone}
              </div>
              <div style="display: flex; gap: 6px; margin-top: 8px;">
                <a href="tel:${store.phone}" style="flex: 1; background: #1a3a4f; color: white; text-align: center; padding: 6px; border-radius: 6px; font-size: 11px; text-decoration: none;">Call</a>
                <a href="https://wa.me/${store.whatsapp}" target="_blank" style="flex: 1; background: #25d366; color: white; text-align: center; padding: 6px; border-radius: 6px; font-size: 11px; text-decoration: none;">WhatsApp</a>
                <a href="${store.maps}" target="_blank" style="background: #f3f4f6; color: #1f2937; text-align: center; padding: 6px 10px; border-radius: 6px; font-size: 11px; text-decoration: none;">Map</a>
              </div>
            </div>
          `);

        marker.on("click", () => onMarkerClick(store.name));
        markers.current.push({ name: store.name, marker });
      });

      // Fit bounds to show all markers
      if (stores.length > 0) {
        const bounds = L.latLngBounds(stores.map((s) => [s.lat, s.lng]));
        map.fitBounds(bounds, { padding: [50, 50] });
      }

      // Desktop: Ctrl + scroll to zoom
      map.scrollWheelZoom.disable();
      
      const handleWheel = (e: WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          const delta = e.deltaY > 0 ? -1 : 1;
          map.setZoom(map.getZoom() + delta);
        }
      };
      
      const container = mapRef.current;
      if (container) {
        container.addEventListener("wheel", handleWheel, { passive: false });
      }

      // Mobile: pinch to zoom (two fingers) - enable touch zoom
      map.touchZoom.enable();
      
      const isMobile = window.innerWidth < 1025;
      if (isMobile) {
        // Single finger = show overlay hint
        const handleTouchStart = (e: TouchEvent) => {
          if (e.touches.length < 2) {
            setShowOverlay(true);
            setTimeout(() => setShowOverlay(false), 2000);
          }
        };
        
        const handleTouchEnd = () => {
          setShowOverlay(false);
        };
        
        container?.addEventListener("touchstart", handleTouchStart);
        container?.addEventListener("touchend", handleTouchEnd);
      }

      return () => {
        if (container) {
          container.removeEventListener("wheel", handleWheel);
        }
      };
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
      markers.current = [];
    };
  }, [stores]);

  // Fly to active store
  useEffect(() => {
    if (!activeStore || !mapInstance.current) return;
    const found = markers.current.find((m) => m.name === activeStore);
    if (found) {
      mapInstance.current.flyTo(found.marker.getLatLng(), 15, { duration: 1 });
      setTimeout(() => found.marker.openPopup(), 800);
    }
  }, [activeStore]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: "12px", overflow: "hidden" }}>
      <div ref={mapRef} style={{ width: "100%", height: "100%", minHeight: "400px" }} />
      
      {/* Desktop zoom hint */}
      <div className="zoom-hint-desktop" style={{
        position: "absolute",
        bottom: 12,
        left: isAr ? "auto" : 12,
        right: isAr ? 12 : "auto",
        zIndex: 1000,
        background: "rgba(26, 58, 79, 0.9)",
        padding: "8px 14px",
        borderRadius: "20px",
        fontSize: "11px",
        color: "white",
        fontWeight: 500,
        pointerEvents: "none",
      }}>
        {isAr ? "Ctrl + عجلة الفأرة للتكبير" : "Ctrl + scroll to zoom"}
      </div>

      {/* Mobile pinch hint */}
      <div className="zoom-hint-mobile" style={{
        position: "absolute",
        bottom: 12,
        left: isAr ? "auto" : 12,
        right: isAr ? 12 : "auto",
        zIndex: 1000,
        background: "rgba(26, 58, 79, 0.9)",
        padding: "8px 14px",
        borderRadius: "20px",
        fontSize: "11px",
        color: "white",
        fontWeight: 500,
        pointerEvents: "none",
      }}>
        {isAr ? "استخدم إصبعين للتكبير والتحريك" : "Use two fingers to zoom & move"}
      </div>

      <style>{`
        @media (min-width: 1025px) {
          .zoom-hint-desktop { display: block !important; }
          .zoom-hint-mobile { display: none !important; }
        }
        @media (max-width: 1024px) {
          .zoom-hint-desktop { display: none !important; }
          .zoom-hint-mobile { display: block !important; }
        }
      `}</style>
      
      {showOverlay && (
        <div style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          pointerEvents: "none",
        }}>
          <div style={{
            background: "#1a3a4f",
            padding: "10px 20px",
            borderRadius: "40px",
            fontSize: "12px",
            color: "white",
            fontWeight: 500,
          }}>
            {isAr ? "استخدم إصبعين للتكبير والتحريك" : "Use two fingers to zoom & move"}
          </div>
        </div>
      )}
    </div>
  );
}