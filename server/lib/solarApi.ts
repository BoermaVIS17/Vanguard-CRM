// server/lib/solarApi.ts

// 1. Define the Solar API Response Types
interface SolarData {
  name?: string;
  center?: {
    latitude: number;
    longitude: number;
  };
  imageryDate?: {
    year: number;
    month: number;
    day: number;
  };
  imageryQuality?: string;
  solarPotential?: {
    maxArrayPanelsCount: number;
    maxArrayAreaMeters2: number;
    wholeRoofStats: {
      areaMeters2: number;
      sunshineQuantiles: number[];
      groundAreaMeters2: number;
    };
    buildingStats: {
      areaMeters2: number;
      sunshineQuantiles: number[];
      groundAreaMeters2: number;
    };
    roofSegmentStats: {
      pitchDegrees: number;
      azimuthDegrees: number;
      stats: {
        areaMeters2: number;
        sunshineQuantiles: number[];
        groundAreaMeters2: number;
      };
      center: {
        latitude: number;
        longitude: number;
      };
      boundingBox: {
        sw: { latitude: number; longitude: number };
        ne: { latitude: number; longitude: number };
      };
      planeHeightAtCenterMeters: number;
    }[];
  };
  boundingBox?: {
    sw: { latitude: number; longitude: number };
    ne: { latitude: number; longitude: number };
  };
}

// 2. Validation helper
export function hasValidCoordinates(
  latitude: number | null | undefined,
  longitude: number | null | undefined
): boolean {
  if (latitude === null || latitude === undefined || longitude === null || longitude === undefined) {
    return false;
  }
  
  // Check if coordinates are within valid ranges
  // Latitude: -90 to 90, Longitude: -180 to 180
  return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
}

// 3. Fetch solar data using coordinates
export async function fetchSolarApiData(
  latitude: number,
  longitude: number
): Promise<{
  solarCoverage: boolean;
  buildingInsights?: SolarData;
  imageryUrl: string;
  roofAreaSqMeters?: number;
  latitude: number;
  longitude: number;
  [key: string]: any;
}> {
  // 1. Private Key for SERVER-SIDE Solar API data fetching
  const privateKey = process.env.GEMINI_API_KEY;
  
  // 2. Public Key for CLIENT-SIDE Static Maps image display
  const publicKey = process.env.VITE_GOOGLE_MAPS_KEY;
  
  if (!privateKey) {
    console.warn("[SolarAPI] Missing GEMINI_API_KEY - returning fallback");
    // Still provide a basic satellite image without API key (will show watermark)
    return {
      solarCoverage: false,
      latitude,
      longitude,
      imageryUrl: `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=19&size=600x600&maptype=satellite`,
      message: "Maps API key not configured - using fallback imagery",
    };
  }

  console.log(`[SolarAPI] Fetching data for coordinates: ${latitude}, ${longitude}`);

  try {
    // Call Google Solar API using private key
    const solarUrl = `https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=${latitude}&location.longitude=${longitude}&key=${privateKey}`;
    
    const solarRes = await fetch(solarUrl);
    
    if (!solarRes.ok) {
      if (solarRes.status === 404) {
        console.log("[SolarAPI] No solar coverage available (404) - providing fallback imagery");
        return { 
          solarCoverage: false, 
          latitude,
          longitude,
          imageryUrl: `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=19&size=600x600&maptype=satellite&key=${publicKey}`,
          message: "No solar data available for this location - use manual measurements"
        };
      }
      
      const errorText = await solarRes.text();
      console.error(`[SolarAPI] API Error (${solarRes.status}):`, errorText);
      throw new Error(`Solar API Error: ${solarRes.status} ${solarRes.statusText}`);
    }

    const buildingInsights: SolarData = await solarRes.json();
    
    console.log("[SolarAPI] Successfully fetched solar data");
    console.log("[SolarAPI] Building insights available:", !!buildingInsights.solarPotential);
    
    // Construct imagery URL from building center or use provided coordinates
    const imgLat = buildingInsights.center?.latitude || latitude;
    const imgLng = buildingInsights.center?.longitude || longitude;
    
    // Use Static Maps API for satellite imagery with PUBLIC key (for client-side display)
    const imageryUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${imgLat},${imgLng}&zoom=20&size=800x800&maptype=satellite&key=${publicKey}`;
    
    // Calculate roof area if available (in square meters)
    const roofAreaSqMeters = buildingInsights.solarPotential?.wholeRoofStats?.areaMeters2;
    
    return {
      solarCoverage: true,
      buildingInsights,
      imageryUrl,
      roofAreaSqMeters,
      latitude: imgLat,
      longitude: imgLng,
    };
  } catch (error) {
    console.error("[SolarAPI] Error fetching solar data:", error);
    return {
      solarCoverage: false,
      latitude,
      longitude,
      imageryUrl: `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=19&size=600x600&maptype=satellite&key=${publicKey}`,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// 4. Main Function to Fetch Data by Address (alternative method)
export async function getSolarData(address: string) {
  // Use GEMINI_API_KEY for Solar API and Geocoding (unrestricted key)
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  // A. Geocode the address to get Lat/Lng
  const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address
  )}&key=${apiKey}`;
  
  const geoRes = await fetch(geoUrl);
  const geoJson = await geoRes.json();

  if (!geoJson.results?.[0]?.geometry?.location) {
    throw new Error("Could not find coordinates for this address");
  }

  const { lat, lng } = geoJson.results[0].geometry.location;

  console.log(`[SolarAPI] Geocoded "${address}" to: ${lat}, ${lng}`);

  // B. Call Solar API using the fetched coordinates
  return await fetchSolarApiData(lat, lng);
}

// 5. Helper for Geometry Math
export function calculateRoofMetrics(buildingInsights: SolarData | undefined) {
  if (!buildingInsights?.solarPotential) {
    console.warn("[SolarAPI] No building insights available for roof metrics calculation");
    return {
      totalAreaSqFt: 0,
      predominantPitch: "N/A",
      eavesFt: 0,
      rakesFt: 0,
      ridgesFt: 0,
      valleysFt: 0
    };
  }

  // Basic conversion (Meters² to Sq Ft)
  const METERS_TO_SQFT = 10.764;
  const totalArea = Math.round(
    buildingInsights.solarPotential.wholeRoofStats.areaMeters2 * METERS_TO_SQFT
  );

  // Get roof segments for pitch calculation
  const segments = buildingInsights.solarPotential.roofSegmentStats || [];
  
  // Calculate predominant pitch (most common pitch in segments)
  let predominantPitch = "N/A";
  if (segments.length > 0) {
    // Find the segment with the largest area
    const largestSegment = segments.reduce((prev, current) => 
      current.stats.areaMeters2 > prev.stats.areaMeters2 ? current : prev
    );
    
    // Convert pitch degrees to rise/run format (e.g., "4/12")
    const pitchDegrees = largestSegment.pitchDegrees;
    const rise = Math.round(Math.tan(pitchDegrees * Math.PI / 180) * 12);
    predominantPitch = `${rise}/12`;
  }
  
  // Rough estimation for linear measurements
  // TODO: Improve with actual segment boundary calculations
  const estimatedPerimeter = Math.sqrt(totalArea) * 4; 
  
  return {
    totalAreaSqFt: totalArea,
    predominantPitch,
    eavesFt: Math.round(estimatedPerimeter * 0.5),
    rakesFt: Math.round(estimatedPerimeter * 0.3),
    ridgesFt: Math.round(estimatedPerimeter * 0.2),
    valleysFt: 0 // TODO: Calculate from segment intersections
  };
}
