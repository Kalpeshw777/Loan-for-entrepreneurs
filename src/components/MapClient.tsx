"use client";

import type { PartnerWithMeta } from "@/lib/types";
import PartnerMap from "@/components/PartnerMap";

interface MapClientProps {
  partners: PartnerWithMeta[];
  center?: [number, number];
  zoom?: number;
  selectedId: string | null;
  userLocation: {
    lat: number;
    lng: number;
  } | null;
  onSelect: (id: string | null) => void;
}

export default function MapClient({
  partners,
  selectedId,
  userLocation,
  onSelect,
}: MapClientProps) {
  return (
    <PartnerMap
      partners={partners}
      selectedId={selectedId}
      userLocation={userLocation}
      onSelectPartner={(p) => onSelect(p.id)}
    />
  );
}
