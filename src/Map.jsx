import { useEffect, useRef } from "react";
import L from "leaflet";
import { Plus, Minus, Maximize2 } from "lucide-react";
import "leaflet/dist/leaflet.css";
const colors = [
  "#f3edcb",
  "#e2e9d2",
  "#f3ded7",
  "#e6dfed",
  "#f6ebd7",
  "#dbe8dd",
];
export default function Map({
  geo,
  boroughs,
  selected,
  onSelect,
  onReset,
  expanded,
}) {
  const node = useRef(),
    map = useRef(),
    layers = useRef({}),
    selectRef = useRef(onSelect);
  selectRef.current = onSelect;
  function fit(zip, animate = true) {
    const m = map.current;
    if (!m) return;
    const mobile = window.innerWidth < 760;
    const bounds =
      zip && layers.current[zip]
        ? layers.current[zip].getBounds()
        : L.latLngBounds([40.495, -74.26], [40.917, -73.7]);
    m.flyToBounds(bounds, {
      paddingTopLeft: mobile ? [24, 65] : [365, 60],
      paddingBottomRight: mobile
        ? [24, zip ? (expanded ? 515 : 405) : 305]
        : [40, 65],
      maxZoom: zip ? 14 : 11,
      animate:
        animate && !matchMedia("(prefers-reduced-motion: reduce)").matches,
      duration: 0.8,
    });
  }
  useEffect(() => {
    if (!geo || !boroughs) return;
    const m = L.map(node.current, {
      zoomControl: false,
      zoomAnimation: !matchMedia("(prefers-reduced-motion: reduce)").matches,
      fadeAnimation: !matchMedia("(prefers-reduced-motion: reduce)").matches,
      scrollWheelZoom: false,
      minZoom: 9,
      maxZoom: 16,
      attributionControl: false,
      zoomSnap: 0.25,
    });
    map.current = m;
    L.geoJSON(boroughs, {
      interactive: false,
      style: {
        fillColor: "#f9f3df",
        fillOpacity: 1,
        color: "#b4c4b5",
        weight: 1,
      },
    }).addTo(m);
    L.geoJSON(geo, {
      style: (f) => ({
        color: "#b9bfa8",
        weight: 1,
        fillColor: colors[Number(f.properties.zip) % colors.length],
        fillOpacity: 0.85,
      }),
      onEachFeature: (f, l) => {
        const z = f.properties.zip;
        layers.current[z] = l;
        l.bindTooltip(`<b>${z}</b><br>${f.properties.borough}`, {
          direction: "top",
          className: "zip-tooltip",
          sticky: true,
        });
        l.on("click", () => selectRef.current(z));
        l.on("mouseover", () => {
          if (l !== layers.current[m._pupZip])
            l.setStyle({ weight: 2, color: "#827761", fillOpacity: 1 });
        });
        l.on("mouseout", () => {
          if (l !== layers.current[m._pupZip])
            l.setStyle({ weight: 1, color: "#b9bfa8", fillOpacity: 0.85 });
        });
        l.on("add", () => {
          const el = l.getElement();
          if (!el) return;
          el.setAttribute("tabindex", "0");
          el.setAttribute("role", "button");
          el.setAttribute(
            "aria-label",
            `Explore ZIP ${z}, ${f.properties.borough}`,
          );
          el.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              selectRef.current(z);
            }
          });
        });
      },
    }).addTo(m);
    [
      ["MANHATTAN", 40.786, -73.982],
      ["BROOKLYN", 40.646, -73.955],
      ["QUEENS", 40.742, -73.819],
      ["THE BRONX", 40.861, -73.863],
      ["STATEN ISLAND", 40.583, -74.15],
    ].forEach(([n, lat, lng]) =>
      L.marker([lat, lng], {
        interactive: false,
        icon: L.divIcon({
          className: "borough-label",
          html: `<span>${n}</span>`,
          iconSize: [120, 20],
          iconAnchor: [60, 10],
        }),
      }).addTo(m),
    );
    L.marker([40.655, -74.07], {
      interactive: false,
      icon: L.divIcon({
        className: "water-label",
        html: "NEW YORK<br>HARBOR",
        iconSize: [95, 40],
      }),
    }).addTo(m);
    fit(null, false);
    const ro = new ResizeObserver(() => {
      m.invalidateSize();
      fit(m._pupZip, false);
    });
    ro.observe(node.current);
    return () => {
      ro.disconnect();
      m.remove();
      map.current = null;
      layers.current = {};
    };
  }, [geo, boroughs]);
  useEffect(() => {
    if (!map.current) return;
    map.current._pupZip = selected;
    Object.entries(layers.current).forEach(([z, l]) => {
      l.setStyle({
        color: z === selected ? "#9472a1" : "#b9bfa8",
        weight: z === selected ? 3 : 1,
        fillColor:
          z === selected ? "#d6bfe6" : colors[Number(z) % colors.length],
        fillOpacity: z === selected ? 1 : 0.85,
      });
      l.getElement()?.setAttribute("aria-pressed", String(z === selected));
      if (z === selected) l.bringToFront();
    });
    fit(selected);
  }, [selected, geo, expanded]);
  return (
    <>
      <div
        ref={node}
        className="map-canvas"
        aria-label="Interactive map of New York City ZIP-code areas"
      />
      <div className="zoom-controls">
        <button aria-label="Zoom in" onClick={() => map.current?.zoomIn()}>
          <Plus size={19} />
        </button>
        <button aria-label="Zoom out" onClick={() => map.current?.zoomOut()}>
          <Minus size={19} />
        </button>
        <button aria-label="Reset map to all NYC" onClick={onReset}>
          <Maximize2 size={17} />
        </button>
      </div>
      <div className="map-attribution">© NYC Planning · Census ZCTAs</div>
    </>
  );
}
