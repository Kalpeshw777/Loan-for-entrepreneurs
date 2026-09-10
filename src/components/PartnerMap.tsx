"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Partner } from "@/lib/types";

interface PartnerMapProps {
  partners: Partner[];
  selectedId: string | null;
  userLocation: { lat: number; lng: number } | null;
  onSelectPartner: (partner: Partner) => void;
}

export default function PartnerMap({
  partners,
  selectedId,
  userLocation,
  onSelectPartner,
}: PartnerMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const userMarkerRef = useRef<L.Marker | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [mapTheme, setMapTheme] = useState<"voyager" | "standard">("voyager");

  // Initialize Map with 60fps smooth zooming and pan animations
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [20.5937, 78.9629],
      zoom: 5,
      minZoom: 4,
      maxZoom: 18,
      zoomAnimation: true,
      fadeAnimation: true,
      markerZoomAnimation: true,
      scrollWheelZoom: true,
      wheelPxPerZoomLevel: 100,
      attributionControl: true,
    });

    mapRef.current = map;

    // CartoDB Voyager Tile Layer - ultra-crisp, high-performance, 0 API key required
    const initialLayer = L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        maxZoom: 19,
        subdomains: "abcd",
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      }
    );

    initialLayer.addTo(map);
    tileLayerRef.current = initialLayer;

    // Handle container resize smoothly
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Smooth Tile Theme Switcher (Both 100% Free & Fast)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const url =
      mapTheme === "voyager"
        ? "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

    const newLayer = L.tileLayer(url, {
      maxZoom: 19,
      subdomains: mapTheme === "voyager" ? "abcd" : "abc",
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    });

    newLayer.addTo(map);
    tileLayerRef.current = newLayer;
  }, [mapTheme]);

  // Update Partner Markers with Smooth CSS Pins
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove existing markers
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    partners.forEach((p) => {
      if (typeof p.lat !== "number" || typeof p.lng !== "number" || isNaN(p.lat) || isNaN(p.lng)) {
        return;
      }

      const isSelected = p.id === selectedId;
      const pinColor = isSelected ? "#F28C28" : "#1769D2";
      const pinSize = isSelected ? 36 : 28;

      const customIcon = L.divIcon({
        className: "nirvaan-map-marker",
        iconSize: [pinSize, pinSize],
        iconAnchor: [pinSize / 2, pinSize],
        popupAnchor: [0, -pinSize],
        html: `
          <div style="position: relative; width: ${pinSize}px; height: ${pinSize}px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);">
            ${
              isSelected
                ? `<span style="position: absolute; inset: -4px; border-radius: 50%; background: rgba(242, 140, 40, 0.45); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>`
                : ""
            }
            <div style="width: ${pinSize}px; height: ${pinSize}px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); background: ${pinColor}; border: 2.5px solid #FFFFFF; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
              <span style="transform: rotate(45deg); color: #ffffff; font-size: ${isSelected ? 14 : 11}px;">🏛</span>
            </div>
          </div>
        `,
      });

      const marker = L.marker([p.lat, p.lng], { icon: customIcon }).addTo(map);

      // Informative Popup
      const popupHtml = `
        <div style="font-family: inherit; min-width: 220px; padding: 4px; color: #0f172a;">
          <div style="display: inline-block; background: #e0f2fe; color: #0369a1; font-size: 10px; font-weight: 800; text-transform: uppercase; padding: 2px 7px; border-radius: 4px; letter-spacing: 0.5px;">
            ${(p.type || "Partner").replace(/-/g, " ")}
          </div>
          <div style="font-size: 14px; font-weight: 800; color: #071a2b; margin-top: 6px; line-height: 1.3;">
            ${p.name}
          </div>
          <div style="font-size: 11px; color: #475569; margin-top: 4px; line-height: 1.4;">
            ${p.address || `${p.city}, ${p.state}`}
          </div>
          ${
            p.phone
              ? `<div style="font-size: 11px; margin-top: 6px;">📞 <a href="tel:${p.phone}" style="color: #1769d2; font-weight: 700; text-decoration: none;">${p.phone}</a></div>`
              : ""
          }
          <div style="margin-top: 10px;">
            <a href="https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}" target="_blank" rel="noopener noreferrer" style="display: block; text-align: center; background: #1769d2; color: #ffffff; padding: 7px 12px; font-size: 11px; font-weight: 700; text-decoration: none; border-radius: 4px; transition: background 0.2s;">
              View Route in Google Maps ↗
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on("click", () => {
        onSelectPartner(p);
      });

      markersRef.current[p.id] = marker;
    });
  }, [partners, selectedId, onSelectPartner]);

  // Smooth FlyTo when user clicks a partner in the list
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedId) return;

    const partner = partners.find((p) => p.id === selectedId);
    if (partner && typeof partner.lat === "number" && typeof partner.lng === "number") {
      map.flyTo([partner.lat, partner.lng], 14, {
        duration: 0.9,
        easeLinearity: 0.25,
      });

      const marker = markersRef.current[selectedId];
      if (marker) {
        setTimeout(() => marker.openPopup(), 400);
      }
    }
  }, [selectedId, partners]);

  // Live Location Radar Marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    if (userLocation && typeof userLocation.lat === "number" && typeof userLocation.lng === "number") {
      const userIcon = L.divIcon({
        className: "nirvaan-user-marker",
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        html: `
          <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
            <span style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background: rgba(37, 99, 235, 0.4); animation: ping 1.5s infinite;"></span>
            <div style="width: 14px; height: 14px; border-radius: 50%; background: #2563eb; border: 2.5px solid #ffffff; box-shadow: 0 0 10px rgba(37,99,235,0.9);"></div>
          </div>
        `,
      });

      const uMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup("<b>Your Current Location</b>");

      userMarkerRef.current = uMarker;
      map.flyTo([userLocation.lat, userLocation.lng], 12, { duration: 1.1 });
    }
  }, [userLocation]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-md border border-[var(--nirvaan-border)] bg-[var(--nirvaan-surface-2)] shadow-sm">
      <div ref={mapContainerRef} className="h-full min-h-[460px] w-full" />

      {/* Smooth Layer View Toggle (Top Right - Zero API Key Needed) */}
      <div className="absolute right-3 top-3 z-[1000] flex gap-1 rounded bg-white/95 p-1 shadow-md backdrop-blur">
        <button
          type="button"
          onClick={() => setMapTheme("voyager")}
          className={`px-3 py-1.5 text-xs font-bold transition-colors rounded ${
            mapTheme === "voyager"
              ? "bg-[var(--nirvaan-blue)] text-white"
              : "text-slate-700 hover:bg-slate-100"
          }`}
        >
          Detailed Map
        </button>

        <button
          type="button"
          onClick={() => setMapTheme("standard")}
          className={`px-3 py-1.5 text-xs font-bold transition-colors rounded ${
            mapTheme === "standard"
              ? "bg-[var(--nirvaan-blue)] text-white"
              : "text-slate-700 hover:bg-slate-100"
          }`}
        >
          Standard View
        </button>
      </div>

      {/* Map Legend Overlay (Bottom Left) */}
      <div className="absolute bottom-3 left-3 z-[1000] rounded bg-white/90 px-3 py-2 text-[11px] font-semibold text-slate-800 shadow-md backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-[#1769d2] border border-white" />
          <span>Partner Branch ({partners.length})</span>
        </div>
        {userLocation && (
          <div className="mt-1 flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full bg-blue-600 border border-white" />
            <span>Your Location</span>
          </div>
        )}
      </div>
    </div>
  );
}
