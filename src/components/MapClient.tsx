"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import type { PartnerWithMeta } from "@/lib/types";
import PartnerMap from "@/components/PartnerMap";

import "mapbox-gl/dist/mapbox-gl.css";

interface MapClientProps {
  partners: PartnerWithMeta[];
  center: [number, number];
  zoom: number;
  selectedId: string | null;
  userLocation: {
    lat: number;
    lng: number;
  } | null;
  onSelect: (id: string | null) => void;
}

const INDIA_CENTER: [number, number] = [
  78.9629,
  20.5937,
];

function createMarkerElement(
  selected: boolean,
  color: string
) {
  const marker = document.createElement("button");

  marker.type = "button";
  marker.setAttribute(
    "aria-label",
    selected ? "Selected partner" : "Partner location"
  );

  marker.style.width = selected ? "22px" : "16px";
  marker.style.height = selected ? "22px" : "16px";
  marker.style.padding = "0";
  marker.style.border = "2px solid #FFFFFF";
  marker.style.background = color;
  marker.style.borderRadius = "50%";
  marker.style.boxSizing = "border-box";
  marker.style.cursor = "pointer";
  marker.style.boxShadow = selected
    ? "0 0 0 3px rgba(0,119,204,0.28), 0 2px 8px rgba(0,0,0,0.35)"
    : "0 2px 7px rgba(0,0,0,0.35)";

  marker.style.setProperty(
    "border-radius",
    "50%",
    "important"
  );

  return marker;
}

function getPartnerColor(
  partner: PartnerWithMeta
) {
  if (partner.healthStatus === "red") {
    return "#C62828";
  }

  if (partner.healthStatus === "yellow") {
    return "#D97706";
  }

  return "#0077CC";
}

export default function MapClient({
  partners,
  center,
  zoom,
  selectedId,
  userLocation,
  onSelect,
}: MapClientProps) {
  const mapContainerRef =
    useRef<HTMLDivElement | null>(null);

  const mapRef = useRef<mapboxgl.Map | null>(null);

  const markersRef = useRef<
    Record<string, mapboxgl.Marker>
  >({});

  const userMarkerRef =
    useRef<mapboxgl.Marker | null>(null);

  const popupRef =
    useRef<mapboxgl.Popup | null>(null);

  const onSelectRef =
    useRef(onSelect);

  const initialCenterRef =
    useRef<[number, number]>(
      center?.length === 2
        ? [center[1], center[0]]
        : INDIA_CENTER
    );

  const initialZoomRef = useRef(
    typeof zoom === "number" ? zoom : 5
  );

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    const token =
      process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

    if (!token || !mapContainerRef.current) {
      return;
    }

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center: initialCenterRef.current,
      zoom: initialZoomRef.current,
      minZoom: 3,
      maxZoom: 18,
      attributionControl: true,
      cooperativeGestures: true,
    });

    mapRef.current = map;

    map.addControl(
      new mapboxgl.NavigationControl({
        showCompass: true,
        showZoom: true,
        visualizePitch: false,
      }),
      "top-right"
    );

    map.addControl(
      new mapboxgl.FullscreenControl(),
      "top-right"
    );

    map.on("load", () => {
      map.resize();
    });

    return () => {
      popupRef.current?.remove();
      popupRef.current = null;

      Object.values(markersRef.current).forEach(
        (marker) => marker.remove()
      );

      markersRef.current = {};

      userMarkerRef.current?.remove();
      userMarkerRef.current = null;

      map.remove();
      mapRef.current = null;
    };
  }, []);
    useEffect(() => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    const targetCenter: [number, number] =
      center?.length === 2
        ? [center[1], center[0]]
        : INDIA_CENTER;

    const targetZoom =
      typeof zoom === "number" ? zoom : 5;

    map.flyTo({
      center: targetCenter,
      zoom: targetZoom,
      duration: 900,
      essential: true,
    });
  }, [center, zoom]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    Object.entries(markersRef.current).forEach(
      ([id, marker]) => {
        if (id !== selectedId) {
          marker
            .getElement()
            .style.setProperty(
              "width",
              "16px",
              "important"
            );

          marker
            .getElement()
            .style.setProperty(
              "height",
              "16px",
              "important"
            );

          marker
            .getElement()
            .style.setProperty(
              "box-shadow",
              "0 2px 7px rgba(0,0,0,0.35)",
              "important"
            );
        }
      }
    );

    if (selectedId) {
      const selectedMarker =
        markersRef.current[selectedId];

      if (selectedMarker) {
        const element = selectedMarker.getElement();

        element.style.setProperty(
          "width",
          "22px",
          "important"
        );

        element.style.setProperty(
          "height",
          "22px",
          "important"
        );

        element.style.setProperty(
          "box-shadow",
          "0 0 0 3px rgba(0,119,204,0.28), 0 2px 8px rgba(0,0,0,0.35)",
          "important"
        );
      }
    }
  }, [selectedId]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    Object.values(markersRef.current).forEach(
      (marker) => marker.remove()
    );

    markersRef.current = {};

    popupRef.current?.remove();
    popupRef.current = null;

    partners.forEach((partner) => {
      if (
        typeof partner.lat !== "number" ||
        typeof partner.lng !== "number" ||
        !Number.isFinite(partner.lat) ||
        !Number.isFinite(partner.lng)
      ) {
        return;
      }

      const isSelected =
        partner.id === selectedId;

      const markerElement =
        createMarkerElement(
          isSelected,
          getPartnerColor(partner)
        );

      const marker = new mapboxgl.Marker({
        element: markerElement,
        anchor: "center",
      })
        .setLngLat([
          partner.lng,
          partner.lat,
        ])
        .addTo(map);

      markerElement.addEventListener(
        "click",
        (event) => {
          event.stopPropagation();

          onSelectRef.current(partner.id);
        }
      );

      markerElement.addEventListener(
        "mouseenter",
        () => {
          markerElement.style.setProperty(
            "transform",
            "scale(1.15)",
            "important"
          );
        }
      );

      markerElement.addEventListener(
        "mouseleave",
        () => {
          markerElement.style.setProperty(
            "transform",
            "scale(1)",
            "important"
          );
        }
      );

      markersRef.current[partner.id] =
        marker;
    });

    return () => {
      Object.values(markersRef.current).forEach(
        (marker) => marker.remove()
      );

      markersRef.current = {};
    };
  }, [partners, selectedId]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    userMarkerRef.current?.remove();
    userMarkerRef.current = null;

    if (
      !userLocation ||
      !Number.isFinite(userLocation.lat) ||
      !Number.isFinite(userLocation.lng)
    ) {
      return;
    }

    const element =
      document.createElement("div");

    element.style.width = "18px";
    element.style.height = "18px";
    element.style.border = "3px solid #FFFFFF";
    element.style.background = "#111827";
    element.style.borderRadius = "50%";
    element.style.boxShadow =
      "0 0 0 4px rgba(17,24,39,0.22), 0 2px 8px rgba(0,0,0,0.35)";
    element.style.setProperty(
      "border-radius",
      "50%",
      "important"
    );

    userMarkerRef.current =
      new mapboxgl.Marker({
        element,
        anchor: "center",
      })
        .setLngLat([
          userLocation.lng,
          userLocation.lat,
        ])
        .setPopup(
          new mapboxgl.Popup({
            offset: 12,
            closeButton: false,
          }).setText("Your location")
        )
        .addTo(map);
  }, [userLocation]);

  if (!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) {
    return (
      <PartnerMap
        partners={partners}
        selectedId={selectedId}
        userLocation={userLocation}
        onSelectPartner={(p) => onSelect(p.id)}
      />
    );
  }

  return (
    <div
      ref={mapContainerRef}
      className="h-full min-h-[480px] w-full bg-[#E5E7EB]"
      aria-label="India partner network satellite map"
    />
  );
      }
