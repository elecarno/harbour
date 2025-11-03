// --- Map setup ---
const map = L.map('map', {
  crs: L.CRS.Simple,
  minZoom: -3.19,
  maxZoom: 4.5,
  zoomSnap: 0.1,
  maxBoundsViscosity: 0.0 // free panning
});

// Image dimensions
const width = 9922, height = 7016;
const originalBounds = [[0, 0], [height, width]];

// --- Helper: Add repeated images for horizontal scrolling ---
function addRepeatedImage(url, copies = 3, opacity = 1.0) {
  const group = L.layerGroup();
  for (let i = -1; i <= 1; i++) {
    const offsetBounds = [[0, i * width], [height, (i + 1) * width]];
    group.addLayer(L.imageOverlay(url, offsetBounds, { opacity }));
  }
  return group;
}

// --- Add base map and overlay ---
const baseImages = addRepeatedImage('emg4_base.png', 3, 1.0).addTo(map);
const overlayCountries = addRepeatedImage('emg4_countries.png', 3, 1.0).addTo(map);
const overlayRegions = addRepeatedImage('emg4_regions.png', 3, 1.0);
const overlayStates = addRepeatedImage('emg4_states.png', 3, 1.0);

// Fit map to original bounds
map.fitBounds(originalBounds);
map.setZoom(-1.5);

// Layer control for overlay
const overlayMaps = { 
  "Show Countries": overlayCountries,
  "Show Regions": overlayRegions,
  "Show Sub-Regions": overlayStates
};
L.control.layers(null, overlayMaps, { collapsed: false }).addTo(map);

// --- Helper: Add repeated labels for infinite scrolling ---
function addRepeatedLabels(labels, copies = 3) {
  const groups = {};
  labels.forEach(label => {
    if (!groups[label.type]) groups[label.type] = L.layerGroup();

    for (let i = -1; i <= 1; i++) {
      let xPos = label.x + i * width;
      let layer;

      if (label.type === "city") {
        layer = L.marker([height - label.y, xPos])
                 .bindTooltip(label.name, { permanent: true, direction: 'top' });
      } else {
        layer = L.marker([height - label.y, xPos], {
          icon: L.divIcon({
            className: `map-label ${label.type}`,
            html: label.name,
            iconSize: null
          }),
          interactive: false
        });
      }

      groups[label.type].addLayer(layer);
    }
  });

  // Add all groups to map
  Object.values(groups).forEach(g => g.addTo(map));
  return groups;
}

// --- Load labels and add to map ---
fetch('labels.json')
  .then(res => res.json())
  .then(labels => {
    const labelGroups = addRepeatedLabels(labels, 3);
    // Layer toggle control for labels
    L.control.layers(null, labelGroups, { collapsed: false }).addTo(map);
  });
