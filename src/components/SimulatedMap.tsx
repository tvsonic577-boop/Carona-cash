import React, { useEffect, useState, useRef } from 'react';
import { MapPin, Navigation, Car, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

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
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  
  // Dynamic Environment Check with safe type assertion for Vite's compiler
  const apiKey = (((import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY as string) || '').trim();
  
  // Detect if there's any key entered, and check if it matches a valid Google API Key format (starts with "AIzaSy")
  const hasKeyEntered = apiKey.length > 0 && apiKey !== 'YOUR_GOOGLE_MAPS_API_KEY' && !apiKey.includes('SUA_CHAVE_AQUI');
  const isKeyFormatValid = apiKey.startsWith('AIzaSy');
  
  const isGoogleMapsEnabled = hasKeyEntered && isKeyFormatValid;

  // Google Maps Instance States
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [googleLoadError, setGoogleLoadError] = useState<string | null>(null);
  const [googleAuthFailed, setGoogleAuthFailed] = useState(!isKeyFormatValid && hasKeyEntered);
  const [forceLocalSimulation, setForceLocalSimulation] = useState(false);

  // Active Map Condition: true if key exists, has not failed auth, and user hasn't toggled manual offline mode
  const isGoogleMapsActive = isGoogleMapsEnabled && !googleAuthFailed && !forceLocalSimulation;
  
  const mapInstanceRef = useRef<any>(null);
  const directionsServiceRef = useRef<any>(null);
  const directionsRendererRef = useRef<any>(null);
  
  // Custom marker instances
  const originMarkerRef = useRef<any>(null);
  const destinationMarkerRef = useRef<any>(null);
  const driverMarkerRef = useRef<any>(null);

  // Internal coordinate state for driver car transition (Fallback simulation)
  const [carCoords, setCarCoords] = useState<{ x: number; y: number } | null>(null);
  // Real-world dynamic GPS coordinates during driving simulation
  const [liveDriverCoords, setLiveDriverCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Helper: map geographical coordinates to canvas x/y (fallback mode)
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

  // Preset location points on the simulated canvas map (mock roads)
  const streets = [
    { x1: 50, y1: 50, x2: 450, y2: 50 },
    { x1: 50, y1: 150, x2: 450, y2: 150 },
    { x1: 50, y1: 250, x2: 450, y2: 250 },
    { x1: 50, y1: 350, x2: 450, y2: 350 },
    { x1: 50, y1: 50, x2: 50, y2: 350 },
    { x1: 150, y1: 50, x2: 150, y2: 350 },
    { x1: 250, y1: 50, x2: 250, y2: 350 },
    { x1: 350, y1: 50, x2: 350, y2: 350 },
    { x1: 450, y1: 50, x2: 450, y2: 350 },
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

  // ==========================================
  // LIGHTWEIGHT GOOGLE MAPS LOADER VIA DYNAMIC SCRIPT INJECTION (WITH AUTH DETECTION)
  // ==========================================
  useEffect(() => {
    // Intercept auth errors (InvalidKeyMapError, ApiTargetBlockedMapError, etc.) called by the Google Maps SDK
    (window as any).gm_authFailure = () => {
      console.warn("Google Maps has failed to authenticate the API Key (e.g. InvalidKeyMapError or ApiTargetBlockedMapError). Falling back to offline simulator.");
      setGoogleAuthFailed(true);
      setGoogleLoadError("Erro de Autenticação (ApiTargetBlockedMapError / InvalidKeyMapError). A Chave de API inserida é inválida, não possui a 'Maps JavaScript API' ativa ou está restrita no seu painel Google Cloud. O Carona Fácil automaticamente alternou para a Simulação Offline de alta precisão.");
    };

    if (!isGoogleMapsActive) return;

    // Safe dynamic script tag manager
    const scriptId = 'google-maps-realtime-loader';
    const existingScript = document.getElementById(scriptId);

    if (existingScript) {
      if ((window as any).google) {
        setGoogleMapsLoaded(true);
      }
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setGoogleMapsLoaded(true);
      setGoogleLoadError(null);
    };
    script.onerror = () => {
      setGoogleLoadError("Não foi possível carregar o widget do Google Maps. Por favor, cheque se a sua Chave de API inserida nos Segredos do AI Studio é válida e possui os acessos Maps Javascript API liberados.");
    };

    document.head.appendChild(script);

    return () => {
      // Clean up global function when component unmounts to prevent leaks
      try {
        delete (window as any).gm_authFailure;
      } catch (e) {}
    };
  }, [apiKey, isGoogleMapsActive]);

  // ==========================================
  // GOOGLE MAP INSTANCE CREATION
  // ==========================================
  useEffect(() => {
    if (!googleMapsLoaded || !mapContainerRef.current) return;

    try {
      const g = (window as any).google;
      if (!g) return;

      // Center of the map defaults to origin location
      const defaultCenter = origemCoords || { lat: -23.55, lng: -46.63 };

      const mapOptions = {
        zoom: 14,
        center: defaultCenter,
        mapId: 'DEMO_MAP_ID', // Requested map ID for dynamic elements
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      };

      const map = new g.maps.Map(mapContainerRef.current, mapOptions);
      mapInstanceRef.current = map;

      // Directions elements initialization
      directionsServiceRef.current = new g.maps.DirectionsService();
      directionsRendererRef.current = new g.maps.DirectionsRenderer({
        map,
        suppressMarkers: true, // Custom elements drawn below
        polylineOptions: {
          strokeColor: '#047857', // Carona premium emerald green brand color
          strokeOpacity: 0.85,
          strokeWeight: 6,
        }
      });
    } catch (e) {
      console.error("Erro na instância de inicialização do Maps:", e);
    }
  }, [googleMapsLoaded]);

  // ==========================================
  // GOOGLE MAP MARKERS & DIRECTIONS HANDLER
  // ==========================================
  useEffect(() => {
    if (!googleMapsLoaded || !mapInstanceRef.current) return;

    const g = (window as any).google;
    if (!g) return;

    const map = mapInstanceRef.current;

    // Reset previous pins
    if (originMarkerRef.current) originMarkerRef.current.map = null;
    if (destinationMarkerRef.current) destinationMarkerRef.current.map = null;
    if (driverMarkerRef.current) driverMarkerRef.current.map = null;

    const bounds = new g.maps.LatLngBounds();

    // 1. Origin Pin Design
    if (origemCoords) {
      try {
        if (g.maps.marker?.AdvancedMarkerElement) {
          const pinContainer = document.createElement('div');
          pinContainer.className = 'relative flex flex-col items-center select-none animate-fade-in';
          pinContainer.innerHTML = `
            <div class="bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-md mb-1 whitespace-nowrap border border-emerald-500">
              📍 ${origemNome}
            </div>
            <div class="w-3.5 h-3.5 bg-emerald-600 border border-white rounded-full shadow-lg"></div>
          `;

          originMarkerRef.current = new g.maps.marker.AdvancedMarkerElement({
            map,
            position: origemCoords,
            content: pinContainer,
          });
        } else {
          originMarkerRef.current = new g.maps.Marker({
            map,
            position: origemCoords,
            title: origemNome,
          });
        }
      } catch (err) {
        console.warn("Retrying with legacy marker for origin:", err);
        try {
          originMarkerRef.current = new g.maps.Marker({
            map,
            position: origemCoords,
            title: origemNome,
          });
        } catch (innerErr) {
          console.error("Failed creating origin marker:", innerErr);
        }
      }
      bounds.extend(origemCoords);
    }

    // 2. Destination Pin Design
    if (destinoCoords) {
      try {
        if (g.maps.marker?.AdvancedMarkerElement) {
          const pinContainer = document.createElement('div');
          pinContainer.className = 'relative flex flex-col items-center select-none animate-fade-in';
          pinContainer.innerHTML = `
            <div class="bg-rose-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-md mb-1 whitespace-nowrap border border-rose-500">
              🎯 ${destinoNome}
            </div>
            <div class="w-3.5 h-3.5 bg-rose-600 border border-white rounded-full shadow-lg"></div>
          `;

          destinationMarkerRef.current = new g.maps.marker.AdvancedMarkerElement({
            map,
            position: destinoCoords,
            content: pinContainer,
          });
        } else {
          destinationMarkerRef.current = new g.maps.Marker({
            map,
            position: destinoCoords,
            title: destinoNome,
          });
        }
      } catch (err) {
        console.warn("Retrying with legacy marker for destination:", err);
        try {
          destinationMarkerRef.current = new g.maps.Marker({
            map,
            position: destinoCoords,
            title: destinoNome,
          });
        } catch (innerErr) {
          console.error("Failed creating destination marker:", innerErr);
        }
      }
      bounds.extend(destinoCoords);
    }

    // 3. Driver Dynamic Car Badge
    const currentDriverPos = liveDriverCoords || driverCoords || origemCoords;
    if (currentDriverPos) {
      try {
        if (g.maps.marker?.AdvancedMarkerElement) {
          const carContainer = document.createElement('div');
          carContainer.className = 'relative flex flex-col items-center select-none';
          carContainer.innerHTML = `
            <div class="bg-amber-500 text-slate-950 text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow mb-1 whitespace-nowrap border border-white uppercase tracking-wider">
              Motorista
            </div>
            <div class="bg-amber-500 text-slate-930 p-1.5 rounded-full shadow-xl border border-white flex items-center justify-center animate-bounce">
              🚗
            </div>
          `;

          driverMarkerRef.current = new g.maps.marker.AdvancedMarkerElement({
            map,
            position: currentDriverPos,
            content: carContainer,
          });
        } else {
          driverMarkerRef.current = new g.maps.Marker({
            map,
            position: currentDriverPos,
            title: "Motorista",
            icon: {
              url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="%23f59e0b"><circle cx="12" cy="12" r="10" fill="%23f59e0b"/><text x="6" y="16" font-size="12">🚗</text></svg>',
              scaledSize: new g.maps.Size(32, 32)
            }
          });
        }
      } catch (err) {
        console.warn("Retrying with legacy marker for driver:", err);
        try {
          driverMarkerRef.current = new g.maps.Marker({
            map,
            position: currentDriverPos,
            title: "Motorista",
          });
        } catch (innerErr) {
          console.error("Failed creating driver marker:", innerErr);
        }
      }
      bounds.extend(currentDriverPos);
    }

    // Adapt layout bounds
    if (origemCoords || destinoCoords) {
      try {
        map.fitBounds(bounds);
      } catch (err) {
        console.warn("Could not fitBounds:", err);
      }
      
      // Load real route on roads
      if (origemCoords && destinoCoords && directionsServiceRef.current && directionsRendererRef.current) {
        directionsServiceRef.current.route({
          origin: origemCoords,
          destination: destinoCoords,
          travelMode: g.maps.TravelMode.DRIVING,
        }, (response: any, statusResult: any) => {
          if (statusResult === g.maps.DirectionsStatus.OK && response && directionsRendererRef.current) {
            directionsRendererRef.current.setDirections(response);
          } else {
            console.warn("Directions API failed loading routes:", statusResult);
          }
        });
      }
    }
  }, [googleMapsLoaded, origemCoords, destinoCoords, liveDriverCoords, driverCoords, origemNome, destinoNome]);

  // ==========================================
  // GPS VEHICLE ANIMATION SIMULATOR LOOP
  // ==========================================
  useEffect(() => {
    let animationId: number;
    let startTime: number | null = null;

    if (!origemCoords || !destinoCoords) {
      setCarCoords(null);
      setLiveDriverCoords(null);
      return;
    }

    const orig = mapCoordsToCanvas(origemCoords.lat, origemCoords.lng);
    const dest = mapCoordsToCanvas(destinoCoords.lat, destinoCoords.lng);

    let startPoint = { x: 50, y: 350 };
    let endPoint = orig;

    if (status === 'MOTORISTA_A_CAMINHO') {
      startPoint = { x: 250, y: 350 };
      endPoint = orig;
    } else if (status === 'EM_ANDAMENTO') {
      startPoint = orig;
      endPoint = dest;
    } else if (status === 'SOLICITADA') {
      setCarCoords({ x: 250, y: 350 });
      setLiveDriverCoords(driverCoords || null);
      return;
    } else {
      setCarCoords(dest);
      setLiveDriverCoords(destinoCoords);
      return;
    }

    const duration = 8000; // 8 seconds trip simulation

    const animateDriver = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      let currentX = startPoint.x;
      let currentY = startPoint.y;

      if (progress < 0.5) {
        const segmentProgress = progress * 2;
        currentX = startPoint.x + (endPoint.x - startPoint.x) * segmentProgress;
      } else {
        const segmentProgress = (progress - 0.5) * 2;
        currentX = endPoint.x;
        currentY = startPoint.y + (endPoint.y - startPoint.y) * segmentProgress;
      }

      setCarCoords({ x: currentX, y: currentY });

      // Convert Canvas bounds to dynamic Geo Latitude/Longitude coordinates
      const minLat = -23.60;
      const maxLat = -23.50;
      const minLng = -46.70;
      const maxLng = -46.60;

      let currentLng = minLng + (currentX / MAP_WIDTH) * (maxLng - minLng);
      let currentLat = minLat + ((MAP_HEIGHT - currentY) / MAP_HEIGHT) * (maxLat - minLat);

      if (origemCoords && destinoCoords) {
        const allCoords = [origemCoords, destinoCoords];
        const lats = allCoords.map(c => c.lat);
        const lngs = allCoords.map(c => c.lng);
        const maxL = Math.max(...lats);
        const minL = Math.min(...lats);
        const maxG = Math.max(...lngs);
        const minG = Math.min(...lngs);

        if (minL < -24 || maxL > -23 || minG < -47 || maxG > -46) {
          const latSpan = Math.abs(maxL - minL) || 0.05;
          const lngSpan = Math.abs(maxG - minG) || 0.05;
          const mapMinLat = minL - latSpan * 0.2;
          const mapMaxLat = maxL + latSpan * 0.2;
          const mapMinLng = minG - lngSpan * 0.2;
          const mapMaxLng = maxG + lngSpan * 0.2;

          currentLng = mapMinLng + (currentX / MAP_WIDTH) * (mapMaxLng - mapMinLng);
          currentLat = mapMinLat + ((MAP_HEIGHT - currentY) / MAP_HEIGHT) * (mapMaxLat - mapMinLat);
        }
      }

      const activeGeoCoords = { lat: currentLat, lng: currentLng };
      setLiveDriverCoords(activeGeoCoords);

      if (onSimulationUpdate) {
        onSimulationUpdate(activeGeoCoords);
      }

      if (progress < 1) {
        animationId = requestAnimationFrame(animateDriver);
      } else {
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

  // ==========================================
  // FALLBACK VECTOR MAP RENDERER
  // ==========================================
  useEffect(() => {
    if (isGoogleMapsActive && googleMapsLoaded && !googleLoadError) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

    ctx.fillStyle = '#e8f5e9';
    ctx.fillRect(80, 80, 120, 120);
    ctx.fillRect(280, 80, 140, 100);
    ctx.fillRect(80, 260, 160, 80);

    ctx.fillStyle = '#dcedc8';
    ctx.beginPath();
    ctx.arc(330, 290, 45, 0, 2 * Math.PI);
    ctx.fill();

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

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    streets.forEach(s => {
      ctx.beginPath();
      ctx.moveTo(s.x1, s.y1);
      ctx.lineTo(s.x2, s.y2);
      ctx.stroke();
    });

    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    streets.forEach(s => {
      ctx.beginPath();
      ctx.moveTo(s.x1, s.y1);
      ctx.lineTo(s.x2, s.y2);
      ctx.stroke();
    });

    if (origemCoords && destinoCoords) {
      const orig = mapCoordsToCanvas(origemCoords.lat, origemCoords.lng);
      const dest = mapCoordsToCanvas(destinoCoords.lat, destinoCoords.lng);

      ctx.strokeStyle = 'rgba(74, 222, 128, 0.35)';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(orig.x, orig.y);
      ctx.lineTo(orig.x, dest.y);
      ctx.lineTo(dest.x, dest.y);
      ctx.stroke();

      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 4;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(orig.x, orig.y);
      ctx.lineTo(orig.x, dest.y);
      ctx.lineTo(dest.x, dest.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [origemCoords, destinoCoords, isGoogleMapsActive, googleMapsLoaded, googleLoadError]);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-100" id="carona-map-wrapper">
      {/* Header bar */}
      <div className="flex items-center justify-between bg-zinc-950 px-4 py-3 text-xs text-white">
        <div className="flex items-center space-x-2.5">
          <div className={`h-2.5 w-2.5 rounded-full ${isGoogleMapsActive ? 'bg-emerald-400 animate-pulse' : googleAuthFailed ? 'bg-rose-500 animate-pulse' : 'bg-amber-400 animate-pulse'}`} />
          <span className="font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
            {isGoogleMapsActive ? (
              <>
                <Sparkles size={11} className="text-emerald-400" /> Google Maps Ativo
              </>
            ) : googleAuthFailed ? (
              <>
                <AlertCircle size={11} className="text-rose-400" /> Erro de Chave Google
              </>
            ) : (
              'Simulador GPS Carona'
            )}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {isGoogleMapsEnabled && !googleAuthFailed && (
            <button
              onClick={() => setForceLocalSimulation(!forceLocalSimulation)}
              className="bg-zinc-800 hover:bg-zinc-700 text-[10px] text-zinc-300 px-2 py-0.5 rounded font-semibold transition flex items-center gap-1 cursor-pointer border border-zinc-700"
            >
              <Navigation size={10} className={forceLocalSimulation ? '' : 'text-emerald-400'} />
              {forceLocalSimulation ? 'Ativar Maps Real' : 'Simulador Offline'}
            </button>
          )}
          <div className="font-mono text-[10px] text-zinc-400 tracking-tight hidden sm:block">
            Modo: {status === 'SOLICITADA' ? 'Buscando Motorista' : status === 'MOTORISTA_A_CAMINHO' ? 'Motorista a Caminho' : status === 'EM_ANDAMENTO' ? 'Em Viagem' : 'Mapa Online'}
          </div>
        </div>
      </div>

      {/* Main Canvas / Google map screen wrapper */}
      <div className="relative flex items-center justify-center bg-zinc-50 min-h-[400px]">
        {isGoogleMapsActive ? (
          <div className="w-full h-[400px] relative">
            {!googleMapsLoaded && !googleLoadError && (
              <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center gap-3 z-30 animate-fade-in">
                <RefreshCw className="text-emerald-600 animate-spin" size={28} />
                <p className="text-xs font-semibold text-slate-500">Renderizando mapa real do Google Maps...</p>
              </div>
            )}
            {googleLoadError && (
              <div className="absolute inset-0 bg-rose-50/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-30">
                <AlertCircle className="text-rose-500 mb-2" size={32} />
                <h4 className="text-sm font-bold text-rose-900">Falha ao Conectar com o Google</h4>
                <p className="text-xs text-rose-700 mt-1 max-w-sm">{googleLoadError}</p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setGoogleAuthFailed(true);
                      setForceLocalSimulation(true);
                    }} 
                    className="mt-3 text-xs bg-zinc-800 hover:bg-zinc-900 text-white font-bold py-1.5 px-3 rounded-lg shadow-sm transition"
                  >
                    Usar Simulador Offline
                  </button>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="mt-3 text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold py-1.5 px-3 rounded-lg shadow-sm transition"
                  >
                    Tentar Novamente
                  </button>
                </div>
              </div>
            )}
            <div ref={mapContainerRef} className="w-full h-full" id="google-map-element" />
          </div>
        ) : (
          <>
            <canvas
              ref={canvasRef}
              width={MAP_WIDTH}
              height={MAP_HEIGHT}
              className="max-w-full block h-[400px] object-cover shadow-inner"
              id="simulation-canvas"
            />

            {googleAuthFailed && (
              <div className="absolute top-3 left-3 right-3 bg-red-950/95 border border-red-500/50 backdrop-blur-md rounded-xl p-3 text-white shadow-xl z-25 flex gap-2.5 items-start">
                <AlertCircle className="text-red-400 shrink-0 mt-0.5 animate-pulse" size={16} />
                <div className="text-left font-sans">
                  <h5 className="font-bold text-[11px] text-red-100 uppercase tracking-wider">
                    {hasKeyEntered && !isKeyFormatValid 
                      ? "Aviso: ID de Projeto em vez de API Key" 
                      : "Aviso: Chave do Google Maps Bloqueada ou Inativa"}
                  </h5>
                  <p className="text-[10px] text-red-200/80 leading-normal mt-0.5">
                    {hasKeyEntered && !isKeyFormatValid ? (
                      <>
                        Você inseriu o valor <code className="bg-red-900/50 px-1 py-0.5 rounded text-red-200">{apiKey.substring(0, 15)}...</code> que parece ser um <strong>ID de Projeto do Google Cloud</strong>. Chaves de API do Google Maps <strong>obrigatoriamente começam com &quot;AIzaSy&quot;</strong>.
                      </>
                    ) : (
                      <>
                        Sua chave gerou o erro de permissão <code className="bg-red-800/40 px-1 rounded text-red-300">ApiTargetBlockedMapError</code> ou <code className="bg-red-800/40 px-1 rounded text-red-300">InvalidKeyMapError</code>. Isso significa que a <strong>Maps JavaScript API</strong> não foi ativada em seu painel Google Cloud ou possui restrições bloqueando seu uso.
                      </>
                    )}
                  </p>
                  <div className="mt-2 pt-2 border-t border-red-500/20 text-[10px] text-red-200/80 space-y-1">
                    <p className="font-bold text-red-100 text-[10px]">Como Corrigir no Google Cloud Console:</p>
                    <ol className="list-decimal list-inside pl-1 space-y-0.5 text-[9px] text-red-300">
                      <li>Acesse o <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="underline text-emerald-400 hover:text-emerald-300 font-bold font-sans">Google Cloud Console</a>.</li>
                      <li>Vá em <strong>APIs e Serviços</strong> &gt; <strong>Biblioteca</strong> no menu lateral.</li>
                      <li>Busque e Ative a <strong className="text-red-200">Maps JavaScript API</strong>.</li>
                      <li>Vá em <strong>Credenciais</strong> e configure/remova as restrições da sua chave de API para liberar o acesso.</li>
                    </ol>
                  </div>
                  <p className="text-[9px] text-emerald-400 font-semibold mt-2.5">
                    ✓ O aplicativo reverteu automaticamente para a simulação offline de alta precisão para manter o fluxo funcional!
                  </p>
                </div>
              </div>
            )}

            {/* Simulated Pin overlays */}
            {origemCoords && (
              <div
                className="absolute -translate-x-1/2 -translate-y-[85%] flex flex-col items-center pointer-events-none transition-all duration-300"
                style={{
                  left: `${(mapCoordsToCanvas(origemCoords.lat, origemCoords.lng).x / MAP_WIDTH) * 100}%`,
                  top: `${(mapCoordsToCanvas(origemCoords.lat, origemCoords.lng).y / MAP_HEIGHT) * 100}%`,
                }}
              >
                <div className="bg-emerald-950 text-white text-[9px] px-1.5 py-0.5 rounded shadow-lg font-bold border border-emerald-500 mb-0.5 max-w-[124px] truncate leading-tight">
                  {origemNome}
                </div>
                <MapPin className="text-emerald-600 drop-shadow fill-white" size={24} />
              </div>
            )}

            {destinoCoords && (
              <div
                className="absolute -translate-x-1/2 -translate-y-[85%] flex flex-col items-center pointer-events-none transition-all duration-300"
                style={{
                  left: `${(mapCoordsToCanvas(destinoCoords.lat, destinoCoords.lng).x / MAP_WIDTH) * 100}%`,
                  top: `${(mapCoordsToCanvas(destinoCoords.lat, destinoCoords.lng).y / MAP_HEIGHT) * 100}%`,
                }}
              >
                <div className="bg-rose-950 text-white text-[9px] px-1.5 py-0.5 rounded shadow-lg font-bold border border-rose-500 mb-0.5 max-w-[124px] truncate leading-tight">
                  {destinoNome}
                </div>
                <MapPin className="text-rose-600 drop-shadow fill-white" size={24} />
              </div>
            )}

            {carCoords && (
              <div
                className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center p-1 bg-white border border-emerald-600 rounded-full shadow-lg pointer-events-none transition-all duration-100"
                style={{
                  left: `${(carCoords.x / MAP_WIDTH) * 100}%`,
                  top: `${(carCoords.y / MAP_HEIGHT) * 100}%`,
                }}
              >
                <div className="bg-amber-500 p-1.5 rounded-full text-slate-900 border border-white">
                  <Car size={16} className="animate-pulse" />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Info bottom panel */}
      <div className="bg-white p-4 border-t border-slate-100 text-xs flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white shadow-xs" />
          <span className="text-slate-500">Partida:</span> 
          <span className="font-bold text-slate-800 truncate max-w-[180px]">{origemNome}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 border border-white shadow-xs" />
          <span className="text-slate-500">Destino:</span> 
          <span className="font-bold text-slate-800 truncate max-w-[180px]">{destinoNome}</span>
        </div>
        {isGoogleMapsActive ? (
          <div className="text-[10px] bg-slate-100 py-0.5 px-2 rounded-md font-bold text-slate-600 font-mono tracking-tight text-center sm:text-right">
            Real-Time GPS via Google Cloud SDK
          </div>
        ) : (
          <div className="text-[10px] bg-amber-50 py-0.5 px-2 rounded-md font-bold text-amber-700 font-mono tracking-tight text-center sm:text-right border border-amber-200">
            {googleAuthFailed ? 'Simulador Automático (Chave Inválida)' : 'Simulação Offline Ativa'}
          </div>
        )}
      </div>
    </div>
  );
}
