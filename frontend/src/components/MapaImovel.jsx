import { useEffect } from "react";
import { MapContainer, TileLayer, Circle, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Corrige ícones do Leaflet com Vite (bundler não copia automaticamente)
import L from "leaflet";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Componente auxiliar para forçar resize após render (necessário dentro de modais/layouts)
function FitBounds({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 15);
    setTimeout(() => map.invalidateSize(), 100);
  }, [lat, lng]);
  return null;
}

export default function MapaImovel({ latitude, longitude, titulo }) {
  if (!latitude || !longitude) return null;

  const lat = Number(latitude);
  const lng = Number(longitude);

  return (
    <div style={{ borderRadius: 16, overflow: "hidden", border: "1.5px solid #e0e0e0", boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
      {/* Cabeçalho */}
      <div style={{ padding: "12px 16px", background: "#fff", borderBottom: "1.5px solid #e0e0e0", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: "1rem" }}>📍</span>
        <span className="fw-semibold" style={{ fontSize: "0.9rem" }}>Localização aproximada</span>
        <span className="text-muted ms-auto" style={{ fontSize: "0.75rem" }}>O ponto exato pode variar ligeiramente</span>
      </div>

      {/* Mapa */}
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        scrollWheelZoom={false}
        style={{ height: 300, width: "100%" }}
        attributionControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        {/* Círculo de zona aproximada (~200 m de raio) em vez de pin exato */}
        <Circle
          center={[lat, lng]}
          radius={200}
          pathOptions={{ color: "#FFC300", fillColor: "#FFC300", fillOpacity: 0.25, weight: 2 }}
        >
          <Tooltip permanent direction="top" offset={[0, -10]}>
            <span style={{ fontSize: "0.78rem", fontWeight: 600 }}>{titulo}</span>
          </Tooltip>
        </Circle>
        <FitBounds lat={lat} lng={lng} />
      </MapContainer>
    </div>
  );
}
