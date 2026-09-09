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

  const [mapStyle, setMapStyle] = useState<"standard" | "satellite">("standard");
  const hasMapboxToken = Boolean(process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Default center: Central India
    const map = L.map(mapContainerRef.current, {
      center: [20.5937, 78.9629],
      zoom: 5,
      scrollWheelZoom: true,
      attributionControl: true,
    });

    mapRef.current = map;

    // Default OSM tile layer (100% Free, no API key required)
    const standardLayer = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }
    );

    standardLayer.addTo(map);
    tileLayerRef.current = standardLayer;

    // Fix tile layout once container renders
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 300);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Handle Map Style Toggle (Standard OSM vs Mapbox Satellite if key present)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    if (mapStyle === "satellite" && process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) {
      const satelliteLayer = L.tileLayer(
        `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/tiles/{z}/{x}/{y}?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`,
        {
          tileSize: 512,
          zoomOffset: -1,
          maxZoom: 19,
          attribution:
            '&copy; <a href="https://www.mapbox.com/">Mapbox</a> &copy; OpenStreetMap',
        }
      );
      satelliteLayer.addTo(map);
      tileLayerRef.current = satelliteLayer;
    } else {
      const standardLayer = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          maxZoom: 19,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }
      );
      standardLayer.addTo(map);
      tileLayerRef.current = standardLayer;
    }
  }, [mapStyle]);

  // Update Markers for Partners
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old markers
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
          <div style="position: relative; width: ${pinSize}px; height: ${pinSize}px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            ${
              isSelected
                ? `<span style="position: absolute; inset: -4px; border-radius: 50%; background: rgba(242, 140, 40, 0.45); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>`
                : ""
            }
            <div style="width: ${pinSize}px; height: ${pinSize}px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); background: ${pinColor}; border: 2px solid #FFFFFF; box-shadow: 0 3px 8px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center;">
              <span style="transform: rotate(45deg); color: #ffffff; font-size: ${isSelected ? 15 : 12}px;">🏛</span>
            </div>
          </div>
        `,
      });

      const marker = L.marker([p.lat, p.lng], { icon: customIcon }).addTo(map);

      // Popup Content
      const popupHtml = `
        <div style="font-family: inherit; min-width: 210px; padding: 2px 4px; color: #0f172a;">
          <div style="display: inline-block; background: #e0f2fe; color: #0284c7; font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 2px 6px; border-radius: 3px; letter-spacing: 0.5px;">
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
          <div style="margin-top: 10px; display: flex; gap: 6px;">
            <a href="https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}" target="_blank" rel="noopener noreferrer" style="flex: 1; text-align: center; background: #1769d2; color: #ffffff; padding: 6px 10px; font-size: 11px; font-weight: 700; text-decoration: none; border-radius: 4px;">
              Get Directions ↗
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

  // Handle Selected Partner Focus
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedId) return;

    const partner = partners.find((p) => p.id === selectedId);
    if (partner && typeof partner.lat === "number" && typeof partner.lng === "number") {
      map.flyTo([partner.lat, partner.lng], 13, { duration: 1 });
      const marker = markersRef.current[selectedId];
      if (marker) {
        marker.openPopup();
      }
    }
  }, [selectedId, partners]);

  // Handle User Live Location Marker
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
        iconSize: [22, 22],
        iconAnchor: [11, 11],
        html: `
          <div style="position: relative; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center;">
            <span style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background: rgba(37, 99, 235, 0.4); animation: ping 1.5s infinite;"></span>
            <div style="width: 14px; height: 14px; border-radius: 50%; background: #2563eb; border: 2.5px solid #ffffff; box-shadow: 0 0 8px rgba(37,99,235,0.8);"></div>
          </div>
        `,
      });

      const uMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup("<b>Your Current Location</b>");

      userMarkerRef.current = uMarker;
      map.flyTo([userLocation.lat, userLocation.lng], 12, { duration: 1.2 });
    }
  }, [userLocation]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-md border border-[var(--nirvaan-border)] bg-[var(--nirvaan-surface-2)] shadow-sm">
      <div ref={mapContainerRef} className="h-full min-h-[460px] w-full" />

      {/* Map Style Switcher (Top Right) */}
      <div className="absolute right-3 top-3 z-[1000] flex gap-1 rounded bg-white/95 p-1 shadow-md backdrop-blur">
        <button
          type="button"
          onClick={() => setMapStyle("standard")}
          className={`px-3 py-1.5 text-xs font-bold transition-colors ${
            mapStyle === "standard"
              ? "bg-[var(--nirvaan-blue)] text-white"
              : "text-slate-700 hover:bg-slate-100"
          } rounded`}
        >
          Standard
        </button>

        <button
          type="button"
          onClick={() => {
            if (!hasMapboxToken) {
              alert(
                "To enable Satellite view, add your Mapbox Access Token to NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN in .env.local"
              );
              return;
            }
            setMapStyle("satellite");
          }}
          className={`px-3 py-1.5 text-xs font-bold transition-colors ${
            mapStyle === "satellite"
              ? "bg-[var(--nirvaan-blue)] text-white"
              : "text-slate-700 hover:bg-slate-100"
          } rounded`}
          title={!hasMapboxToken ? "Configure Mapbox API token in .env.local to enable Satellite view" : "Switch to Satellite"}
        >
          Satellite
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
