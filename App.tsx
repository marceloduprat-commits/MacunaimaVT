import React, { useState, useRef } from 'react';
import { Viewer3D } from './components/Viewer3D';
import { Overlay } from './components/Overlay';
import { Artwork, WallType } from './types';

const App: React.FC = () => {
  // 'back' shows the default view (hides front wall). 'front' hides back wall. 'right' hides left wall.
  const [focusedWall, setFocusedWall] = useState<'back' | 'front' | 'right'>('back');
  
  // State for Artworks
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [selectedArtworkId, setSelectedArtworkId] = useState<string | null>(null);

  // Reference for screenshot function
  const screenshotHandleRef = useRef<(() => void) | null>(null);

  const handleAddArtwork = (file: File) => {
    const url = URL.createObjectURL(file);
    const newArtwork: Artwork = {
      id: crypto.randomUUID(),
      title: 'Nova Obra',
      imageUrl: url,
      // Default to the currently focused wall, or 'back' if it's 'left' (which isn't selectable yet)
      wall: focusedWall as WallType, 
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

  const handleTakeScreenshot = () => {
    if (screenshotHandleRef.current) {
      screenshotHandleRef.current();
    }
  };

  // --- PROJECT MANAGEMENT (SAVE/LOAD) ---

  // Helper to convert Blob URL to Base64 string for saving
  const blobUrlToBase64 = async (url: string): Promise<string> => {
    // If it's already base64 (from a loaded project), return it
    if (url.startsWith('data:')) return url;

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.error("Error converting image:", e);
      return url;
    }
  };

  const handleSaveProject = async () => {
    try {
      // Convert all artwork images to Base64
      const serializedArtworks = await Promise.all(
        artworks.map(async (art) => ({
          ...art,
          imageUrl: await blobUrlToBase64(art.imageUrl)
        }))
      );

      const projectData = {
        version: 1,
        timestamp: new Date().toISOString(),
        artworks: serializedArtworks,
        roomSettings: {
          focusedWall
        }
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(projectData));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "projeto_exposicao.json");
      document.body.appendChild(downloadAnchorNode); // required for firefox
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    } catch (error) {
      console.error("Failed to save project:", error);
      alert("Erro ao salvar o projeto. Verifique o console.");
    }
  };

  const handleLoadProject = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        
        if (json.artworks && Array.isArray(json.artworks)) {
          // Verify basic integrity and update state
          setArtworks(json.artworks);
          if (json.roomSettings?.focusedWall) {
            setFocusedWall(json.roomSettings.focusedWall);
          }
          setSelectedArtworkId(null);
        } else {
          alert("Arquivo de projeto inválido.");
        }
      } catch (error) {
        console.error("Error parsing JSON:", error);
        alert("Erro ao ler o arquivo de projeto.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="relative w-full h-screen bg-gray-50 flex flex-col">
      {/* Main 3D Viewport */}
      <div className="flex-grow relative z-0">
        <Viewer3D 
          showDimensions={true}
          wallTransparency={false}
          artworks={artworks}
          selectedArtworkId={selectedArtworkId}
          onSelectArtwork={setSelectedArtworkId}
          focusedWall={focusedWall}
          screenshotHandle={screenshotHandleRef}
        />
      </div>

      {/* Floating UI Overlay */}
      <Overlay 
        focusedWall={focusedWall}
        setFocusedWall={setFocusedWall}
        artworks={artworks}
        selectedArtworkId={selectedArtworkId}
        onAddArtwork={handleAddArtwork}
        onUpdateArtwork={handleUpdateArtwork}
        onDeleteArtwork={handleDeleteArtwork}
        onSelectArtwork={setSelectedArtworkId}
        onTakeScreenshot={handleTakeScreenshot}
        onSaveProject={handleSaveProject}
        onLoadProject={handleLoadProject}
      />
    </div>
  );
};

export default App;