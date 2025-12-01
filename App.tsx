import React, { useState } from 'react';
import { Viewer3D } from './components/Viewer3D';
import { Overlay } from './components/Overlay';
import { ViewMode, Artwork, WallType } from './types';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.ISO);
  // 'back' shows the default view (hides front wall). 'front' hides back wall to see the front.
  const [focusedWall, setFocusedWall] = useState<'back' | 'front'>('back');
  
  // State for Artworks
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [selectedArtworkId, setSelectedArtworkId] = useState<string | null>(null);

  const handleAddArtwork = (file: File) => {
    const url = URL.createObjectURL(file);
    const newArtwork: Artwork = {
      id: crypto.randomUUID(),
      title: 'Nova Obra',
      imageUrl: url,
      // Default to the currently focused wall
      wall: focusedWall,
      position: [0, 1.75], // Centered, eye level
      dimensions: [1.5, 1.0]
    };
    setArtworks([...artworks, newArtwork]);
    setSelectedArtworkId(newArtwork.id);
  };

  const handleUpdateArtwork = (id: string, updates: Partial<Artwork>) => {
    setArtworks(prev => prev.map(art => 
      art.id === id ? { ...art, ...updates } : art
    ));
  };

  const handleDeleteArtwork = (id: string) => {
    setArtworks(prev => prev.filter(art => art.id !== id));
    if (selectedArtworkId === id) setSelectedArtworkId(null);
  };

  return (
    <div className="relative w-full h-screen bg-gray-50 flex flex-col">
      {/* Main 3D Viewport */}
      <div className="flex-grow relative z-0">
        <Viewer3D 
          viewMode={viewMode} 
          showDimensions={true}
          wallTransparency={false}
          artworks={artworks}
          selectedArtworkId={selectedArtworkId}
          onSelectArtwork={setSelectedArtworkId}
          focusedWall={focusedWall}
        />
      </div>

      {/* Floating UI Overlay */}
      <Overlay 
        viewMode={viewMode} 
        setViewMode={setViewMode}
        focusedWall={focusedWall}
        setFocusedWall={setFocusedWall}
        artworks={artworks}
        selectedArtworkId={selectedArtworkId}
        onAddArtwork={handleAddArtwork}
        onUpdateArtwork={handleUpdateArtwork}
        onDeleteArtwork={handleDeleteArtwork}
        onSelectArtwork={setSelectedArtworkId}
      />
    </div>
  );
};

export default App;