import React, { useEffect, useState, useRef } from 'react';
import { MapPin, Navigation, Car } from 'lucide-react';

interface SimulatedMapProps {
  origemCoords?: { lat: number; lng: number };
  destinoCoords?: { lat: number; lng: number };
  origemNome?: string;
  destinoNome?: string;
  driverCoords?: { lat: number; lng: number };
  status?: string;
  onSimulationUpdate?: (currentCoords: { lat: number; lng: number }) => void;
  onArrivedAtOrigin?: () => void;
  onArrivedAtDestination?: () => void;
}

// Fixed dimensions for canvas
const MAP_WIDTH = 500;
const MAP_HEIGHT = 400;

export default function SimulatedMap({
  origemCoords,
  destinoCoords,
  origemNome = "Origem",
  destinoNome = "Destino",
  driverCoords,
  status,
  onSimulationUpdate,
  onArrivedAtOrigin,
  onArrivedAtDestination,
}: SimulatedMapProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Internal coordinate state for driver car transition
  const [carCoords, setCarCoords] = useState<{ x: number; y: number } | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Helper: map geographical coordinates to canvas x/y (using dynamic bounding box support)
  const mapCoordsToCanvas = (lat: number, lng: number) => {
    let minLat = -23.60;
    let maxLat = -23.50;
    let minLng = -46.70;
    let maxLng = -46.60;

    // Check if coordinates belong to another city (out of SP bounds)
    if (origemCoords && destinoCoords) {
      const allCoords = [origemCoords, destinoCoords];
      if (driverCoords) allCoords.push(driverCoords);

      const lats = allCoords.map(c => c.lat);
      const lngs = allCoords.map(c => c.lng);

      const maxL = Math.max(...lats);
      const minL = Math.min(...lats);
      const maxG = Math.max(...lngs);
      const minG = Math.min(...lngs);

      // If out of standard SP bounds, recalculate bounding box dynamically
      if (minL < -24 || maxL > -23 || minG < -47 || maxG > -46) {
        const latSpan = Math.abs(maxL - minL) || 0.05;
        const lngSpan = Math.abs(maxG - minG) || 0.05;

        // Apply 20% defensive padding so markers fit cleanly on the stage
        minLat = minL - latSpan * 0.2;
        maxLat = maxL + latSpan * 0.2;
        minLng = minG - lngSpan * 0.2;
        maxLng = maxG + lngSpan * 0.2;
      }
    }

    const x = ((lng - minLng) / (maxLng - minLng)) * MAP_WIDTH;
    const y = MAP_HEIGHT - ((lat - minLat) / (maxLat - minLat)) * MAP_HEIGHT; // invert y

    return { x, y };
  };

  // Preset location points on the simulated map
  const streets = [
    // Grid lines for decorative roads
    { x1: 50, y1: 50, x2: 450, y2: 50 },
    { x1: 50, y1: 150, x2: 450, y2: 150 },
    { x1: 50, y1: 250, x2: 450, y2: 250 },
    { x1: 50, y1: 350, x2: 450, y2: 350 },
    
    { x1: 50, y1: 50, x2: 50, y2: 350 },
    { x1: 150, y1: 50, x2: 150, y2: 350 },
    { x1: 250, y1: 50, x2: 250, y2: 350 },
    { x1: 350, y1: 50, x2: 350, y2: 350 },
    { x1: 450, y1: 50, x2: 450, y2: 350 },

    // Diagonals representing highways
    { x1: 50, y1: 50, x2: 450, y2: 350 },
    { x1: 50, y1: 350, x2: 450, y2: 50 },
  ];

  const riverPath = [
    { x: 0, y: 120 },
    { x: 120, y: 130 },
    { x: 200, y: 180 },
    { x: 280, y: 200 },
    { x: 380, y: 290 },
    { x: 500, y: 310 },
  ];

  // Draw simulated map background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear background
    ctx.fillStyle = '#f3f4f6'; // Light grey/white
    ctx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

    // Draw background grid pattern/squares
    ctx.fillStyle = '#e8f5e9'; // Very light mint green for parks
    ctx.fillRect(80, 80, 120, 120);
    ctx.fillRect(280, 80, 140, 100);
    ctx.fillRect(80, 260, 160, 80);

    ctx.fillStyle = '#dcedc8'; // Accent green parks
    ctx.beginPath();
    ctx.arc(330, 290, 45, 0, 2 * Math.PI);
    ctx.fill();

    // Draw River (agua) - blueish tint
    ctx.strokeStyle = '#bbdefb';
    ctx.lineWidth = 24;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(riverPath[0].x, riverPath[0].y);
    for (let i = 1; i < riverPath.length; i++) {
      ctx.lineTo(riverPath[i].x, riverPath[i].y);
    }
    ctx.stroke();

    // Draw Streets
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    streets.forEach(s => {
      ctx.beginPath();
      ctx.moveTo(s.x1, s.y1);
      ctx.lineTo(s.x2, s.y2);
      ctx.stroke();
    });

    // Street outline borders
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    streets.forEach(s => {
      ctx.beginPath();
      ctx.moveTo(s.x1, s.y1);
      ctx.lineTo(s.x2, s.y2);
      ctx.stroke();
    });

    // If we have origins and destinations, render route path
    if (origemCoords && destinoCoords) {
      const orig = mapCoordsToCanvas(origemCoords.lat, origemCoords.lng);
      const dest = mapCoordsToCanvas(destinoCoords.lat, destinoCoords.lng);

      // Route shadow or glowing underline
      ctx.strokeStyle = 'rgba(74, 222, 128, 0.3)'; // semi transparent cool green
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(orig.x, orig.y);
      ctx.lineTo(orig.x, dest.y); // Corner routing simulation
      ctx.lineTo(dest.x, dest.y);
      ctx.stroke();

      // Core route path
      ctx.strokeStyle = '#15803d'; // dark green
      ctx.lineWidth = 4;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(orig.x, orig.y);
      ctx.lineTo(orig.x, dest.y);
      ctx.lineTo(dest.x, dest.y);
      ctx.stroke();
      ctx.setLineDash([]); // clear dash
    }
  }, [origemCoords, destinoCoords]);

  // Car Animation Effect
  useEffect(() => {
    let animationId: number;
    let startTime: number | null = null;

    if (!origemCoords || !destinoCoords) {
      setCarCoords(null);
      return;
    }

    const orig = mapCoordsToCanvas(origemCoords.lat, origemCoords.lng);
    const dest = mapCoordsToCanvas(destinoCoords.lat, destinoCoords.lng);

    // We can simulate driver's start point.
    // In MOTORISTA_A_CAMINHO: driver moves from some initial spot toward original client coordinate.
    // In EM_ANDAMENTO: driver moves from original client coordinate toward destination client coordinate.
    let startPoint = { x: 50, y: 350 }; // Default initial taxi spawn point
    let endPoint = orig;

    if (status === 'MOTORISTA_A_CAMINHO') {
      startPoint = { x: 250, y: 350 };
      endPoint = orig;
    } else if (status === 'EM_ANDAMENTO') {
      startPoint = orig;
      endPoint = dest;
    } else if (status === 'SOLICITADA') {
      // Car is just parked waiting
      setCarCoords({ x: 250, y: 350 });
      return;
    } else {
      // Completed, car parked at destination
      setCarCoords(dest);
      return;
    }

    const duration = 8000; // 8 seconds to drive

    const animateDriver = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Simple interpolation with corner logic:
      // First x-axis or y-axis movement to simulate grid streets instead of flying over buildings
      let currentX = startPoint.x;
      let currentY = startPoint.y;

      if (progress < 0.5) {
        // First half: move vertically/horizontally
        const segmentProgress = progress * 2;
        currentX = startPoint.x + (endPoint.x - startPoint.x) * segmentProgress;
      } else {
        // Second half
        const segmentProgress = (progress - 0.5) * 2;
        currentX = endPoint.x;
        currentY = startPoint.y + (endPoint.y - startPoint.y) * segmentProgress;
      }

      setCarCoords({ x: currentX, y: currentY });

      // Convert canvas X/Y back to geo coords for database simulation updates
      const minLat = -23.60;
      const maxLat = -23.50;
      const minLng = -46.70;
      const maxLng = -46.60;

      const currentLng = minLng + (currentX / MAP_WIDTH) * (maxLng - minLng);
      const currentLat = minLat + ((MAP_HEIGHT - currentY) / MAP_HEIGHT) * (maxLat - minLat);

      if (onSimulationUpdate) {
        onSimulationUpdate({ lat: currentLat, lng: currentLng });
      }

      if (progress < 1) {
        animationId = requestAnimationFrame(animateDriver);
      } else {
        // Completed this segment
        if (status === 'MOTORISTA_A_CAMINHO' && onArrivedAtOrigin) {
          onArrivedAtOrigin();
        } else if (status === 'EM_ANDAMENTO' && onArrivedAtDestination) {
          onArrivedAtDestination();
        }
      }
    };

    animationId = requestAnimationFrame(animateDriver);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [origemCoords, destinoCoords, status]);

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-gray-200 bg-white" id="carona-map-wrapper">
      {/* Header bar */}
      <div className="flex items-center justify-between bg-zinc-900 px-4 py-2 text-xs text-white">
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 animate-ping rounded-full bg-emerald-500"></div>
          <span className="font-mono font-medium tracking-wider">CARONA CASH GPS SIMULATOR</span>
        </div>
        <div className="font-mono text-zinc-400">
          Modo: {status === 'SOLICITADA' ? 'Buscando Motorista' : status === 'MOTORISTA_A_CAMINHO' ? 'Motorista a Caminho' : status === 'EM_ANDAMENTO' ? 'Em Viagem' : 'Mapa Online'}
        </div>
      </div>

      {/* Canvas */}
      <div className="relative flex items-center justify-center bg-gray-100">
        <canvas
          ref={canvasRef}
          width={MAP_WIDTH}
          height={MAP_HEIGHT}
          className="max-w-full block h-auto object-contain shadow-inner"
          id="simulation-canvas"
        />

        {/* Pin markers overlaid using absolute coordinates computed */}
        {origemCoords && (
          <div
            className="absolute -translate-x-1/2 -translate-y-full flex flex-col items-center pointer-events-none transition-all duration-300"
            style={{
              left: `${(mapCoordsToCanvas(origemCoords.lat, origemCoords.lng).x / MAP_WIDTH) * 100}%`,
              top: `${(mapCoordsToCanvas(origemCoords.lat, origemCoords.lng).y / MAP_HEIGHT) * 100}%`,
            }}
          >
            <div className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded shadow-md font-semibold mb-1 max-w-[124px] truncate">
              {origemNome}
            </div>
            <MapPin className="text-emerald-600 drop-shadow fill-white" size={24} />
          </div>
        )}

        {destinoCoords && (
          <div
            className="absolute -translate-x-1/2 -translate-y-full flex flex-col items-center pointer-events-none transition-all duration-300"
            style={{
              left: `${(mapCoordsToCanvas(destinoCoords.lat, destinoCoords.lng).x / MAP_WIDTH) * 100}%`,
              top: `${(mapCoordsToCanvas(destinoCoords.lat, destinoCoords.lng).y / MAP_HEIGHT) * 100}%`,
            }}
          >
            <div className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded shadow-md font-semibold mb-1 max-w-[124px] truncate">
              {destinoNome}
            </div>
            <MapPin className="text-rose-600 drop-shadow fill-white" size={24} />
          </div>
        )}

        {/* Floating animated car marker */}
        {carCoords && (
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center p-1 bg-white border border-emerald-600 rounded-full shadow-lg pointer-events-none transition-all duration-100"
            style={{
              left: `${(carCoords.x / MAP_WIDTH) * 100}%`,
              top: `${(carCoords.y / MAP_HEIGHT) * 100}%`,
            }}
          >
            <div className="bg-emerald-600 p-1 rounded-full text-white">
              <Car size={16} className="animate-pulse" />
            </div>
          </div>
        )}
      </div>

      {/* Info bottom panel */}
      <div className="bg-white p-3 border-t border-gray-100 text-xs flex justify-between items-center">
        <div>
          <span className="font-semibold text-gray-700">Partida:</span> {origemNome}
        </div>
        <div>
          <span className="font-semibold text-gray-700">Destino:</span> {destinoNome}
        </div>
      </div>
    </div>
  );
}
