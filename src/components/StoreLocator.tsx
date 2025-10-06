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

// Example stores – update with Tunisia-specific ones later
const stores: Store[] = [
  {
    id: '1',
    name: 'Tunis Center',
    address: 'Avenue Habib Bourguiba, Tunis',
    coordinates: [10.1815, 36.8065]
  },
  {
    id: '2',
    name: 'Sfax Branch',
    address: 'Rue de la République, Sfax',
    coordinates: [10.7603, 34.7406]
  }
];

const StoreLocator = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Correct Tunisia bounding box
    const tunisiaBounds: [[number, number], [number, number]] = [
      [7.52, 30.24],  // Southwest corner
      [11.60, 37.54]  // Northeast corner
    ];

    mapboxgl.accessToken =
      'pk.eyJ1IjoiamloZWRjaCIsImEiOiJjbWZrMHg0MjQxOHVwMmlxcTFzNzBoenYyIn0.pNIB0Etu0zDd_pcaAdDtpg';

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [9.5375, 33.8869], // Tunisia center
      zoom: 5,
      pitch: 0
    });

    // Lock map to Tunisia only
    map.current.setMaxBounds(tunisiaBounds);

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: false
      }),
      'top-right'
    );

    // Add markers after map load
    map.current.on('load', () => {
      stores.forEach((store) => {
        const markerElement = document.createElement('div');
        markerElement.className = 'store-marker';
        markerElement.innerHTML = `
          <div class="marker-dot"></div>
          <div class="marker-glow"></div>
        `;

        const tooltip = document.createElement('div');
        tooltip.className = 'store-tooltip';
        tooltip.innerHTML = `
          <div class="tooltip-content">
            <h4>${store.name}</h4>
            <p>${store.address}</p>
          </div>
        `;
        document.body.appendChild(tooltip);

        const marker = new mapboxgl.Marker({
          element: markerElement,
          anchor: 'center'
        })
          .setLngLat(store.coordinates)
          .addTo(map.current!);

        markerElement.addEventListener('mouseenter', () => {
          markerElement.classList.add('hovered');
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

      // Fit map to Tunisia bounds on load
      map.current!.fitBounds(tunisiaBounds, { padding: 40 });
    });

    // Cleanup on unmount
    return () => {
      markers.current.forEach((marker) => marker.remove());
      markers.current = [];
      map.current?.remove();
    };
  }, []);

  return (
    <section className="w-full py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            Find Us In Tunisia
          </h2>
          <div className="w-24 h-px bg-primary mx-auto"></div>
        </div>

        <div className="relative">
          <div
            ref={mapContainer}
            className="w-full h-[500px] rounded-lg shadow-xl"
            style={{ background: 'hsl(0 0% 7%)' }}
          />
        </div>

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
