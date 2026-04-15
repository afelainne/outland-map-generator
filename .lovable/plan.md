

## OUTLAND MAP — Retro-Futuristic Topographic Map Generator

### Overview
A web app that procedurally generates retro-futuristic topographic maps with contour lines, scattered dots, grid overlays, and location markers. Users can manually add markers and download maps in SVG, PNG, and JPG formats.

### Design
- **Aesthetic**: Retro-futuristic cartography inspired by the reference images — contour lines flowing organically, scattered dots of varying sizes, grid overlay, numbered locations
- **Color palettes**: Multiple themes matching the references — Green/dark, Purple/orange, Blue/cream, and more
- **Font**: Monospace throughout (e.g., JetBrains Mono or Space Mono from Google Fonts)
- **Logo**: The provided OUTLAND SVG logo displayed in the header

### Map Generation
- **Contour lines**: Procedurally generated using noise algorithms (simplex/perlin), creating flowing topographic contour lines
- **Grid overlay**: Subtle grid lines across the entire map canvas
- **Dots/circles**: Randomly scattered dots of varying sizes representing locations/features
- **Numbered markers**: Auto-numbered location points with small labels
- **Location names**: Pulled from the provided list (Department of Imagination, The Experimental Lab, etc.) — randomly assigned to markers
- **Colored rectangle**: A colored block element in one corner (as seen in references)

### Interactive Features
- **Generate new map**: Button to regenerate a completely random map
- **Add markers manually**: Click on the map to place markers (choose shape: circle, square, triangle, diamond)
- **Edit markers**: Click existing markers to rename or delete them
- **Color theme selector**: Switch between the reference color palettes
- **Zoom/pan**: Navigate large maps

### Export
- **SVG download**: Vector export of the full map
- **PNG download**: Rasterized high-res export
- **JPG download**: Compressed raster export
- Resolution selector for raster exports

### Layout
- Top bar with OUTLAND logo + app name + theme selector
- Large central canvas area for the map
- Side toolbar for marker tools and generation controls
- Bottom bar with export buttons

### Location Names (from reference)
All 30 names from image 4 will be included as the pool of random location names assigned to map markers.

