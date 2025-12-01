import React, { useRef, useState } from 'react';
import { ViewMode, Artwork, WallType, DEFAULT_ROOM } from '../types';
import { 
  Box, 
  Layers, 
  Rotate3d, 
  ArrowUpFromLine,
  LayoutTemplate,
  Plus,
  Image as ImageIcon,
  Trash2,
  Move,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface OverlayProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  focusedWall: 'back' | 'front';
  setFocusedWall: (wall: 'back' | 'front') => void;
  artworks: Artwork[];
  selectedArtworkId: string | null;
  onAddArtwork: (file: File) => void;
  onUpdateArtwork: (id: string, updates: Partial<Artwork>) => void;
  onDeleteArtwork: (id: string) => void;
  onSelectArtwork: (id: string | null) => void;
}

export const Overlay: React.FC<OverlayProps> = ({ 
  viewMode, 
  setViewMode,
  focusedWall,
  setFocusedWall,
  artworks,
  selectedArtworkId,
  onAddArtwork,
  onUpdateArtwork,
  onDeleteArtwork,
  onSelectArtwork
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCameraMenuOpen, setIsCameraMenuOpen] = useState(true);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onAddArtwork(e.target.files[0]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const selectedArtwork = artworks.find(a => a.id === selectedArtworkId);

  return (
    <>
      {/* Top Right Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-4 z-10 pointer-events-none">
        
        {/* Wall Toggle (Primary Navigation) */}
        <div className="bg-white p-2 rounded-xl shadow-lg border border-gray-100 pointer-events-auto flex items-center gap-2">
           <span className="text-xs font-bold text-gray-500 uppercase px-2">Parede:</span>
           <div className="flex bg-gray-100 p-1 rounded-lg">
             <button
                onClick={() => setFocusedWall('back')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                  focusedWall === 'back' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
             >
               Fundo (8m)
             </button>
             <button
                onClick={() => setFocusedWall('front')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                  focusedWall === 'front' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
             >
               Frente (8m)
             </button>
           </div>
        </div>

        {/* View Controls Panel (Collapsible) */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 pointer-events-auto w-64 overflow-hidden transition-all">
          <button 
            onClick={() => setIsCameraMenuOpen(!isCameraMenuOpen)}
            className="w-full p-4 flex justify-between items-center bg-white hover:bg-gray-50 transition-colors"
          >
             <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Rotate3d className="w-4 h-4" />
              Modo de Câmera
            </h3>
            {isCameraMenuOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </button>
          
          {isCameraMenuOpen && (
            <div className="p-4 pt-0 grid grid-cols-2 gap-2">
              <button 
                onClick={() => setViewMode(ViewMode.ISO)}
                className={`flex items-center justify-center gap-2 p-2 rounded-lg text-sm transition-colors ${
                  viewMode === ViewMode.ISO 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Box className="w-4 h-4" />
                Isométrico
              </button>
              
              <button 
                onClick={() => setViewMode(ViewMode.TOP)}
                className={`flex items-center justify-center gap-2 p-2 rounded-lg text-sm transition-colors ${
                  viewMode === ViewMode.TOP 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <LayoutTemplate className="w-4 h-4" />
                Topo
              </button>

              <button 
                onClick={() => setViewMode(ViewMode.FRONT)}
                className={`flex items-center justify-center gap-2 p-2 rounded-lg text-sm transition-colors ${
                  viewMode === ViewMode.FRONT 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <ArrowUpFromLine className="w-4 h-4" />
                Frente
              </button>

              <button 
                onClick={() => setViewMode(ViewMode.SIDE)}
                className={`flex items-center justify-center gap-2 p-2 rounded-lg text-sm transition-colors ${
                  viewMode === ViewMode.SIDE 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Layers className="w-4 h-4" />
                Lado
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Top Left - Add Artwork Button */}
      <div className="absolute top-4 left-4 z-10 pointer-events-auto">
         <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 bg-black text-white px-4 py-3 rounded-xl shadow-lg hover:bg-gray-800 transition-colors font-medium"
         >
           <Plus className="w-5 h-5" />
           Adicionar Obra
         </button>
         <input 
            ref={fileInputRef}
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileChange}
         />
      </div>

      {/* Left Sidebar - Editor Panel */}
      {selectedArtwork && (
        <div className="absolute top-20 left-4 bottom-4 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-10 pointer-events-auto overflow-y-auto flex flex-col">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 sticky top-0 rounded-t-xl z-20">
             <h2 className="font-bold text-gray-800 flex items-center gap-2">
               <ImageIcon className="w-5 h-5 text-blue-600" />
               Editar Obra
             </h2>
             <button 
               onClick={() => onDeleteArtwork(selectedArtwork.id)}
               className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
               title="Excluir"
             >
               <Trash2 className="w-5 h-5" />
             </button>
          </div>

          <div className="p-4 space-y-6 flex-grow">
             {/* Thumbnail */}
             <div className="aspect-video w-full bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
               <img src={selectedArtwork.imageUrl} alt="Preview" className="w-full h-full object-contain" />
             </div>

             {/* Location Section */}
             <div className="space-y-3">
               <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 pb-1 border-b border-gray-100">
                 <Move className="w-4 h-4" />
                 Posição e Tamanho
               </h3>
               
               <div>
                 <div className="flex justify-between text-xs text-gray-500 mb-1">
                   <span>Horizontal</span>
                   <span>{selectedArtwork.position[0].toFixed(2)}m</span>
                 </div>
                 <input 
                   type="range" 
                   min={
                     (selectedArtwork.wall === 'back' || selectedArtwork.wall === 'front')
                     ? -DEFAULT_ROOM.width/2 + 0.5 
                     : -DEFAULT_ROOM.depth/2 + 0.5
                   } 
                   max={
                     (selectedArtwork.wall === 'back' || selectedArtwork.wall === 'front')
                     ? DEFAULT_ROOM.width/2 - 0.5 
                     : DEFAULT_ROOM.depth/2 - 0.5
                   } 
                   step={0.01}
                   value={selectedArtwork.position[0]}
                   onChange={(e) => onUpdateArtwork(selectedArtwork.id, { position: [parseFloat(e.target.value), selectedArtwork.position[1]] })}
                   className="w-full accent-blue-600"
                 />
               </div>

               <div>
                 <div className="flex justify-between text-xs text-gray-500 mb-1">
                   <span>Vertical (Altura)</span>
                   <span>{selectedArtwork.position[1].toFixed(2)}m</span>
                 </div>
                 <input 
                   type="range" 
                   min={0.5} 
                   max={3} 
                   step={0.01}
                   value={selectedArtwork.position[1]}
                   onChange={(e) => onUpdateArtwork(selectedArtwork.id, { position: [selectedArtwork.position[0], parseFloat(e.target.value)] })}
                   className="w-full accent-blue-600"
                 />
               </div>

               <div>
                 <div className="flex justify-between text-xs text-gray-500 mb-1">
                   <span>Largura</span>
                   <span>{selectedArtwork.dimensions[0].toFixed(2)}m</span>
                 </div>
                 <input 
                   type="range" 
                   min={0.3} 
                   max={3} 
                   step={0.01}
                   value={selectedArtwork.dimensions[0]}
                   onChange={(e) => onUpdateArtwork(selectedArtwork.id, { dimensions: [parseFloat(e.target.value), selectedArtwork.dimensions[1]] })}
                   className="w-full accent-blue-600"
                 />
               </div>

               <div>
                 <div className="flex justify-between text-xs text-gray-500 mb-1">
                   <span>Altura</span>
                   <span>{selectedArtwork.dimensions[1].toFixed(2)}m</span>
                 </div>
                 <input 
                   type="range" 
                   min={0.3} 
                   max={3} 
                   step={0.01}
                   value={selectedArtwork.dimensions[1]}
                   onChange={(e) => onUpdateArtwork(selectedArtwork.id, { dimensions: [selectedArtwork.dimensions[0], parseFloat(e.target.value)] })}
                   className="w-full accent-blue-600"
                 />
               </div>

             </div>
          </div>
          
          <div className="p-4 border-t border-gray-100 bg-gray-50 sticky bottom-0 rounded-b-xl z-20">
            <button
              onClick={() => onSelectArtwork(null)}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-bold shadow-md"
            >
              <Check className="w-5 h-5" />
              Fixar na Parede
            </button>
          </div>
        </div>
      )}

    </>
  );
};