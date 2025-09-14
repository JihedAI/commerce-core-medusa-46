import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from './ui/button';

interface Store {
  id: string;
  name: string;
  address: string;
  coordinates: [number, number];
}

const stores: Store[] = [
  {
    id: '1',
    name: 'New York Flagship',
    address: '123 Fifth Avenue, New York, NY 10001',
    coordinates: [-73.9857, 40.7484]
  },
  {
    id: '2',
    name: 'London Boutique',
    address: '45 Bond Street, London W1S 4QT, UK',
    coordinates: [-0.1419, 51.5074]
  },
  {
    id: '3',
    name: 'Paris Atelier',
    address: '25 Rue Saint-Honoré, 75001 Paris, France',
    coordinates: [2.3364, 48.8606]
  },
  {
    id: '4',
    name: 'Tokyo Gallery',
    address: '1-1-1 Ginza, Chuo City, Tokyo 104-0061, Japan',
    coordinates: [139.7640, 35.6762]
  },
  {
    id: '5',
    name: 'Los Angeles Studio',
    address: '9600 Wilshire Blvd, Beverly Hills, CA 90212',
    coordinates: [-118.4048, 34.0669]
  }
];

const StoreLocator = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [accessToken, setAccessToken] = useState<string>('');

  useEffect(() => {
    if (!mapContainer.current || !accessToken) return;

    // Initialize map with dark theme
    mapboxgl.accessToken = accessToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      zoom: 1.5,
      center: [0, 20],
      pitch: 0,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: false,
      }),
      'top-right'
    );

    // Wait for map to load before adding markers
    map.current.on('load', () => {
      stores.forEach((store) => {
        // Create custom marker element
        const markerElement = document.createElement('div');
        markerElement.className = 'store-marker';
        markerElement.innerHTML = `
          <div class="marker-dot"></div>
          <div class="marker-glow"></div>
        `;

        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'store-tooltip';
        tooltip.innerHTML = `
          <div class="tooltip-content">
            <h4>${store.name}</h4>
            <p>${store.address}</p>
          </div>
        `;
        document.body.appendChild(tooltip);

        // Create marker
        const marker = new mapboxgl.Marker({
          element: markerElement,
          anchor: 'center'
        })
          .setLngLat(store.coordinates)
          .addTo(map.current!);

        // Add hover interactions
        markerElement.addEventListener('mouseenter', (e) => {
          markerElement.classList.add('hovered');
          
          // Position tooltip
          const rect = markerElement.getBoundingClientRect();
          tooltip.style.left = `${rect.left + rect.width / 2}px`;
          tooltip.style.top = `${rect.top - 10}px`;
          tooltip.classList.add('visible');
        });

        markerElement.addEventListener('mouseleave', () => {
          markerElement.classList.remove('hovered');
          tooltip.classList.remove('visible');
        });

        markers.current.push(marker);
      });
    });

    // Cleanup
    return () => {
      markers.current.forEach(marker => marker.remove());
      markers.current = [];
      map.current?.remove();
    };
  }, [accessToken]);

  return (
    <section className="w-full py-24 bg-background">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            Find Us In Stores
          </h2>
          <div className="w-24 h-px bg-primary mx-auto"></div>
        </div>

        {/* Map Container */}
        <div className="relative">
          {!accessToken && (
            <div className="bg-card border border-border rounded-lg p-8 text-center mb-8">
              <h3 className="text-xl font-semibold text-card-foreground mb-4">
                Enter Mapbox Access Token
              </h3>
              <p className="text-muted-foreground mb-6">
                Please enter your Mapbox public token to display the store locator map.
                You can find your token at{' '}
                <a 
                  href="https://mapbox.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  mapbox.com
                </a>
              </p>
              <div className="flex gap-4 max-w-md mx-auto">
                <input
                  type="text"
                  placeholder="pk.eyJ1..."
                  className="flex-1 px-4 py-2 bg-input border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                />
                <Button 
                  onClick={() => {}} 
                  disabled={!accessToken}
                  className="px-6"
                >
                  Load Map
                </Button>
              </div>
            </div>
          )}
          
          <div 
            ref={mapContainer} 
            className={`w-full h-[500px] rounded-lg shadow-xl ${!accessToken ? 'opacity-50' : ''}`}
            style={{ background: 'hsl(0 0% 7%)' }}
          />
        </div>

        {/* CTA Button */}
        <div className="text-center mt-12">
          <Button 
            variant="outline" 
            size="lg"
            className="px-8 py-3 border-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 hover:shadow-glow"
          >
            View All Locations
          </Button>
        </div>
      </div>

      <style>{`
        .store-marker {
          position: relative;
          width: 20px;
          height: 20px;
          cursor: pointer;
          transition: transform 0.3s ease;
        }

        .store-marker:hover,
        .store-marker.hovered {
          transform: scale(1.3);
        }

        .marker-dot {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 12px;
          height: 12px;
          background: hsl(var(--primary));
          border-radius: 50%;
          z-index: 2;
        }

        .marker-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 20px;
          height: 20px;
          background: hsl(var(--primary) / 0.3);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .store-marker:hover .marker-glow,
        .store-marker.hovered .marker-glow {
          background: hsl(var(--primary) / 0.5);
          animation: ripple 0.6s ease-out;
        }

        .store-tooltip {
          position: fixed;
          z-index: 1000;
          pointer-events: none;
          opacity: 0;
          transform: translate(-50%, -100%) translateY(-10px);
          transition: all 0.3s ease;
        }

        .store-tooltip.visible {
          opacity: 1;
          transform: translate(-50%, -100%) translateY(0);
        }

        .tooltip-content {
          background: hsl(var(--card));
          border: 1px solid hsl(var(--border));
          border-radius: 8px;
          padding: 12px 16px;
          box-shadow: var(--shadow-lg);
          backdrop-filter: blur(var(--glass-blur));
        }

        .tooltip-content h4 {
          font-family: var(--font-display);
          font-size: 14px;
          font-weight: 600;
          color: hsl(var(--card-foreground));
          margin: 0 0 4px 0;
          white-space: nowrap;
        }

        .tooltip-content p {
          font-size: 12px;
          color: hsl(var(--muted-foreground));
          margin: 0;
          white-space: nowrap;
          max-width: 250px;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        @keyframes pulse {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.3;
          }
          70% {
            transform: translate(-50%, -50%) scale(1.4);
            opacity: 0;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.4);
            opacity: 0;
          }
        }

        @keyframes ripple {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.5;
          }
          100% {
            transform: translate(-50%, -50%) scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </section>
  );
};

export default StoreLocator;