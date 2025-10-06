import React, { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { MapPin } from 'lucide-react';

interface Store {
  id: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
}

const stores: Store[] = [
  {
    id: '1',
    name: 'Tunis Center',
    address: 'Avenue Habib Bourguiba, Tunis',
    coordinates: { lat: 36.8065, lng: 10.1815 }
  },
  {
    id: '2',
    name: 'Sfax Branch',
    address: 'Rue de la République, Sfax',
    coordinates: { lat: 34.7406, lng: 10.7603 }
  }
];

const StoreLocator = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [showInput, setShowInput] = useState<boolean>(true);
  const mapRef = useRef<google.maps.Map | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const loadGoogleMapsScript = (key: string) => {
    if (scriptLoaded) return;
    
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&callback=initMap`;
    script.async = true;
    script.defer = true;
    
    (window as any).initMap = initializeMap;
    
    script.onload = () => setScriptLoaded(true);
    document.head.appendChild(script);
  };

  const initializeMap = () => {
    if (!mapContainer.current || !window.google) return;

    const map = new google.maps.Map(mapContainer.current, {
      center: { lat: 34.5, lng: 9.5 },
      zoom: 6,
      styles: [
        {
          featureType: 'all',
          elementType: 'geometry',
          stylers: [{ color: '#1a1a1a' }]
        },
        {
          featureType: 'all',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#ffffff' }]
        },
        {
          featureType: 'all',
          elementType: 'labels.text.stroke',
          stylers: [{ color: '#000000' }]
        },
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{ color: '#0a0a0a' }]
        }
      ],
      restriction: {
        latLngBounds: {
          north: 37.54,
          south: 30.24,
          west: 7.52,
          east: 11.60
        }
      }
    });

    mapRef.current = map;

    stores.forEach((store) => {
      const marker = new google.maps.Marker({
        position: store.coordinates,
        map: map,
        title: store.name,
        animation: google.maps.Animation.DROP
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 12px; font-family: var(--font-sans);">
            <h4 style="font-family: var(--font-display); font-size: 16px; font-weight: 600; margin: 0 0 8px 0; color: #1a1a1a;">
              ${store.name}
            </h4>
            <p style="font-size: 14px; color: #666; margin: 0;">
              ${store.address}
            </p>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      setShowInput(false);
      loadGoogleMapsScript(apiKey);
    }
  };

  return (
    <section className="w-full py-24 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-4">
            <MapPin className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            Find Us In Tunisia
          </h2>
          <div className="w-24 h-px bg-gradient-primary mx-auto"></div>
        </div>

        {showInput ? (
          <div className="max-w-md mx-auto mb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Enter your Google Maps API key to view store locations
                </p>
                <a
                  href="https://developers.google.com/maps/documentation/javascript/get-api-key"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  Get your API key here
                </a>
              </div>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter Google Maps API key"
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <Button type="submit" className="w-full">
                Load Map
              </Button>
            </form>
          </div>
        ) : null}

        <div className="relative">
          <div
            ref={mapContainer}
            className="w-full h-[500px] rounded-lg shadow-xl border border-border"
          />
        </div>

        <div className="text-center mt-12">
          <Button
            variant="outline"
            size="lg"
            className="px-8 py-3 border-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
          >
            View All Locations
          </Button>
        </div>
      </div>
    </section>
  );
};

export default StoreLocator;
