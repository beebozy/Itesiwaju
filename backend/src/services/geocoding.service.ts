import { env } from "../config/env.js";

interface GeoapifyFeature {
  properties: {
    formatted?: string;
    address_line1?: string;
    address_line2?: string;
    street?: string;
    district?: string;
    suburb?: string;
    city?: string;
    county?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
}

interface GeoapifyResponse {
  features: GeoapifyFeature[];
}

export interface ReverseGeocodedLocation {
  address: string | null;
  street: string | null;
  ward: string | null;
  lga: string | null;
}

export async function reverseGeocode(
  latitude: string,
  longitude: string,
): Promise<ReverseGeocodedLocation> {
  if (!env.GEOAPIFY_API_KEY) {
    throw new Error("GEOAPIFY_API_KEY is not configured.");
  }

  const url = new URL(
    "https://api.geoapify.com/v1/geocode/reverse",
  );

  url.searchParams.set("lat", latitude);
  url.searchParams.set("lon", longitude);
  url.searchParams.set("apiKey", env.GEOAPIFY_API_KEY);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Geoapify request failed with status ${response.status}`,
    );
  }

  const data =
    (await response.json()) as GeoapifyResponse;

  if (data.features.length === 0) {
    return {
      address: null,
      street: null,
      ward: null,
      lga: null,
    };
  }

  const properties = data.features[0].properties;

  return {
    address: properties.formatted ?? null,
    street: properties.street ?? null,

    // We will map these properly after seeing
    // the actual Lagos response.
    ward: properties.suburb ?? null,
    lga: properties.county ?? null,
  };
}