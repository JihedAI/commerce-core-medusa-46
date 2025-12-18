import React, { createContext, useContext, useEffect, useState } from "react";
import { medusa } from "@/lib/medusa";

interface Region {
  id: string;
  name: string;
  currency_code: string;
  countries: Array<{
    iso_2: string;
    iso_3: string;
    name: string;
    display_name: string;
  }>;
}

interface RegionContextType {
  regions: Region[];
  currentRegion: Region | null;
  isLoading: boolean;
  setCurrentRegion: (region: Region) => void;
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

export function RegionProvider({ children }: { children: React.ReactNode }) {
  const [regions, setRegions] = useState<Region[]>([]);
  const [currentRegion, setCurrentRegion] = useState<Region | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(() => ({
    regions,
    currentRegion,
    isLoading,
    setCurrentRegion
  }), [regions, currentRegion, isLoading]);

  // Memoize the fetch function
  const fetchRegions = React.useCallback(async () => {
    try {
      const { regions: fetchedRegions } = await medusa.regions.list();
      setRegions(fetchedRegions);
      
      // Try to find Tunisia region, otherwise use the first available region
      const tunisiaRegion = fetchedRegions.find((r: Region) => 
        r.countries?.some(c => c.iso_2.toLowerCase() === 'tn')
      );
      
      setCurrentRegion(tunisiaRegion || fetchedRegions[0]);
    } catch (error) {
      console.error("Failed to fetch regions:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRegions();
  }, [fetchRegions]);

  return (
    <RegionContext.Provider value={contextValue}>
      {children}
    </RegionContext.Provider>
  );
}

export function useRegion() {
  const context = useContext(RegionContext);
  if (!context) {
    throw new Error("useRegion must be used within a RegionProvider");
  }
  return context;
}