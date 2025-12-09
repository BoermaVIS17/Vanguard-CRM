import { useState, useRef, useEffect } from 'react';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';

interface AddressAutocompleteProps {
  onPlaceSelected: (data: {
    address: string;
    city: string;
    state: string;
    zip: string;
    latitude: number;
    longitude: number;
  }) => void;
  placeholder?: string;
  className?: string;
}

export function AddressAutocomplete({ 
  onPlaceSelected, 
  placeholder = "Start typing address...",
  className = ""
}: AddressAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      componentRestrictions: { country: 'us' },
      types: ['address'],
    },
    debounce: 300,
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    setIsOpen(true);
  };

  const handleSelect = async (description: string) => {
    console.log('[AddressAutocomplete] Selected:', description);
    setValue(description, false);
    clearSuggestions();
    setIsOpen(false);

    try {
      // Get geocode results
      const results = await getGeocode({ address: description });
      console.log('[AddressAutocomplete] Geocode results:', results);

      if (!results || results.length === 0) {
        console.error('[AddressAutocomplete] No geocode results');
        return;
      }

      // Get lat/lng
      const { lat, lng } = await getLatLng(results[0]);
      console.log('[AddressAutocomplete] Coordinates:', { lat, lng });

      // Parse address components
      const addressComponents = results[0].address_components || [];
      let streetNumber = '';
      let route = '';
      let city = '';
      let state = '';
      let zip = '';

      addressComponents.forEach((component: any) => {
        const types = component.types;
        if (types.includes('street_number')) {
          streetNumber = component.long_name;
        }
        if (types.includes('route')) {
          route = component.long_name;
        }
        if (types.includes('locality')) {
          city = component.long_name;
        }
        if (types.includes('administrative_area_level_1')) {
          state = component.short_name;
        }
        if (types.includes('postal_code')) {
          zip = component.long_name;
        }
      });

      const streetAddress = `${streetNumber} ${route}`.trim();

      console.log('[AddressAutocomplete] Parsed data:', {
        address: streetAddress,
        city,
        state,
        zip,
        latitude: lat,
        longitude: lng,
      });

      // Call parent handler
      onPlaceSelected({
        address: streetAddress,
        city,
        state,
        zip,
        latitude: lat,
        longitude: lng,
      });
    } catch (error) {
      console.error('[AddressAutocomplete] Error:', error);
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={handleInput}
        disabled={!ready}
        placeholder={placeholder}
        className={className}
        onFocus={() => setIsOpen(true)}
      />

      {/* Custom Dropdown */}
      {isOpen && status === 'OK' && data.length > 0 && (
        <ul className="absolute z-[100005] w-full mt-1 bg-slate-800 border border-slate-600 rounded-md shadow-lg max-h-60 overflow-auto">
          {data.map((suggestion) => {
            const {
              place_id,
              structured_formatting: { main_text, secondary_text },
            } = suggestion;

            return (
              <li
                key={place_id}
                onClick={() => handleSelect(suggestion.description)}
                className="px-4 py-3 cursor-pointer hover:bg-slate-700 transition-colors border-b border-slate-700 last:border-b-0"
              >
                <div className="flex flex-col">
                  <span className="text-[#00d4aa] font-semibold text-sm">
                    {main_text}
                  </span>
                  <span className="text-slate-400 text-xs mt-0.5">
                    {secondary_text}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* No Results / Loading */}
      {isOpen && value && status !== 'OK' && (
        <div className="absolute z-[100005] w-full mt-1 bg-slate-800 border border-slate-600 rounded-md shadow-lg px-4 py-3">
          <span className="text-slate-400 text-sm">
            {status === 'ZERO_RESULTS' ? 'No results found' : 'Searching...'}
          </span>
        </div>
      )}
    </div>
  );
}
