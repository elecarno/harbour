// Create map with a "simple" coordinate system
const map = L.map('map', {
  crs: L.CRS.Simple,
  minZoom: -3.19,
  maxZoom: 4.5,
  zoomSnap: 0.1,
  maxBoundsViscosity: 1.0
});

// Image dimensions in pixels
const width = 9922, height = 7016;

// Define the image bounds (top-left, bottom-right)
const bounds = [[0, 0], [height, width]];

// Add your static image
const image = L.imageOverlay('emg2_base2.png', bounds).addTo(map);
map.fitBounds(bounds);

// Optional: make map wrap horizontally
map.setMaxBounds([[0, -width], [height, width * 2]]);

// Load label data from JSON
fetch('labels.json')
  .then(res => res.json())
  .then(labels => {
    const groups = {}; // will hold L.layerGroup per type

    labels.forEach(label => {
      if (!groups[label.type]) groups[label.type] = L.layerGroup();

      let layer;
      if (label.type === "city") {
        // Cities: normal marker with tooltip
        layer = L.marker([height - label.y, label.x])
                 .bindTooltip(label.name, { permanent: true, direction: 'top' });
      } else {
        // Other labels: floating text using divIcon
        layer = L.marker([height - label.y, label.x], {
          icon: L.divIcon({
            className: `map-label ${label.type}`, // allows category-specific styling
            html: label.name,
            iconSize: null // let CSS handle size
          }),
          interactive: false
        });
      }

      groups[label.type].addLayer(layer);
    });

    // Add all groups to map
    Object.values(groups).forEach(g => g.addTo(map));

    // Add layer toggle control
    L.control.layers(null, groups, { collapsed: false }).addTo(map);
  });
