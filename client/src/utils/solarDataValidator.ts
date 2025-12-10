/**
 * Solar API Data Validator
 * 
 * Validates solar API data structure to prevent crashes from API format changes.
 * Provides safe accessors and fallback values.
 */

export interface ValidatedSolarData {
  isValid: boolean;
  roofArea: number | null;
  panelCount: number | null;
  yearlyEnergyDcKwh: number | null;
  errors: string[];
}

/**
 * Validates and extracts solar data safely
 */
export function validateSolarData(solarApiData: any): ValidatedSolarData {
  const errors: string[] = [];
  let roofArea: number | null = null;
  let panelCount: number | null = null;
  let yearlyEnergyDcKwh: number | null = null;

  // Check if data exists
  if (!solarApiData) {
    errors.push('Solar API data is missing');
    return { isValid: false, roofArea, panelCount, yearlyEnergyDcKwh, errors };
  }

  // Validate building insights
  if (!solarApiData.buildingInsights) {
    errors.push('Building insights missing');
  } else {
    // Extract roof area
    try {
      const stats = solarApiData.buildingInsights.solarPotential?.wholeRoofStats;
      if (stats?.areaMeters2) {
        const areaMeters = parseFloat(stats.areaMeters2);
        if (!isNaN(areaMeters) && areaMeters > 0) {
          roofArea = areaMeters * 10.7639; // Convert to sq ft
        } else {
          errors.push('Invalid roof area value');
        }
      } else {
        errors.push('Roof area not found in solar data');
      }
    } catch (error) {
      errors.push(`Error extracting roof area: ${error}`);
    }

    // Extract panel count
    try {
      const maxArrayPanels = solarApiData.buildingInsights.solarPotential?.maxArrayPanelsCount;
      if (maxArrayPanels !== undefined && maxArrayPanels !== null) {
        const count = parseInt(String(maxArrayPanels));
        if (!isNaN(count) && count > 0) {
          panelCount = count;
        } else {
          errors.push('Invalid panel count value');
        }
      } else {
        errors.push('Panel count not found in solar data');
      }
    } catch (error) {
      errors.push(`Error extracting panel count: ${error}`);
    }

    // Extract yearly energy
    try {
      const configs = solarApiData.buildingInsights.solarPotential?.solarPanelConfigs;
      if (Array.isArray(configs) && configs.length > 0) {
        const maxConfig = configs[configs.length - 1];
        if (maxConfig?.yearlyEnergyDcKwh) {
          const energy = parseFloat(maxConfig.yearlyEnergyDcKwh);
          if (!isNaN(energy) && energy > 0) {
            yearlyEnergyDcKwh = energy;
          } else {
            errors.push('Invalid yearly energy value');
          }
        } else {
          errors.push('Yearly energy not found in solar configs');
        }
      } else {
        errors.push('Solar panel configs missing or empty');
      }
    } catch (error) {
      errors.push(`Error extracting yearly energy: ${error}`);
    }
  }

  const isValid = errors.length === 0 && roofArea !== null;

  return {
    isValid,
    roofArea,
    panelCount,
    yearlyEnergyDcKwh,
    errors,
  };
}

/**
 * Safe accessor for roof area with fallback
 */
export function getSafeRoofArea(solarApiData: any, fallback: number = 0): number {
  const validated = validateSolarData(solarApiData);
  return validated.roofArea ?? fallback;
}

/**
 * Safe accessor for panel count with fallback
 */
export function getSafePanelCount(solarApiData: any, fallback: number = 0): number {
  const validated = validateSolarData(solarApiData);
  return validated.panelCount ?? fallback;
}

/**
 * Safe accessor for yearly energy with fallback
 */
export function getSafeYearlyEnergy(solarApiData: any, fallback: number = 0): number {
  const validated = validateSolarData(solarApiData);
  return validated.yearlyEnergyDcKwh ?? fallback;
}

/**
 * Check if solar data has minimum required fields
 */
export function hasSolarData(solarApiData: any): boolean {
  if (!solarApiData) return false;
  const validated = validateSolarData(solarApiData);
  return validated.roofArea !== null;
}

/**
 * Log validation errors for monitoring
 */
export function logSolarDataErrors(solarApiData: any, jobId: number): void {
  const validated = validateSolarData(solarApiData);
  if (!validated.isValid) {
    console.error(`[Solar Data Validation] Job ${jobId} has invalid solar data:`, {
      errors: validated.errors,
      hasData: !!solarApiData,
      hasBuildingInsights: !!solarApiData?.buildingInsights,
    });
  }
}
