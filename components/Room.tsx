import React, { useMemo } from 'react';
import { DEFAULT_ROOM, Artwork } from '../types';
import { Artwork3D } from './Artwork3D';
import { HumanScale } from './HumanScale';
import * as THREE from 'three';

interface RoomProps {
  showDimensions: boolean;
  wallTransparency: boolean;
  artworks: Artwork[];
  selectedArtworkId: string | null;
  onSelectArtwork: (id: string) => void;
  focusedWall: 'back' | 'front' | 'right';
}

export const Room: React.FC<RoomProps> = ({ 
  showDimensions, 
  wallTransparency,
  artworks,
  selectedArtworkId,
  onSelectArtwork,
  focusedWall
}) => {
  const { width, depth, height } = DEFAULT_ROOM;
  
  // Standard White Material for Front/Back walls (The "Artwork" walls - Lighter)
  const wallMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#ffffff',
    side: THREE.DoubleSide,
    transparent: true,
    opacity: wallTransparency ? 0.3 : 1,
    roughness: 0.8,
    metalness: 0.1
  }), [wallTransparency]);

  // Darker material for Side walls (Door/Window walls - Darker)
  const sideWallMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#cccccc', // Significantly darker gray to ensure visible contrast
    side: THREE.DoubleSide,
    transparent: true,
    opacity: wallTransparency ? 0.3 : 1,
    roughness: 0.8,
    metalness: 0.1
  }), [wallTransparency]);

  const glassMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#a5f3fc',
    transparent: true,
    opacity: 0.3,
    roughness: 0.0,
    metalness: 0.9
  }), []);

  const floorMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#f1f5f9', // Slate-100
    side: THREE.FrontSide,
    roughness: 0.8
  }), []);

  // Wall Thickness
  const thickness = 0.2;

  // Visibility Logic
  // When looking at BACK wall, we must hide FRONT wall to see inside.
  // When looking at FRONT wall, we must hide BACK wall to see inside.
  // When looking at RIGHT wall (Door), we must hide LEFT wall (Window) to see inside.
  
  const showBackWall = focusedWall !== 'front';
  const showFrontWall = focusedWall !== 'back';
  const showLeftWall = focusedWall !== 'right';
  const showRightWall = true; // Always visible for now

  // Logic to position the Human Reference Scale
  const humanReference = useMemo(() => {
    // Only show if an artwork is selected (editing mode)
    if (!selectedArtworkId) return null;

    // Aumentado offset para 0.06 (6cm) para evitar z-fighting/clipping visual
    const offsetFromWall = thickness / 2 + 0.06;
    
    switch (focusedWall) {
      case 'back':
        return (
          <group position={[1.5, 0, -depth / 2 + offsetFromWall]}>
            <HumanScale />
          </group>
        );
      case 'front':
        return (
          <group position={[-1.5, 0, depth / 2 - offsetFromWall]} rotation={[0, Math.PI, 0]}>
            <HumanScale />
          </group>
        );
      case 'right':
         // For the 5m wall, position slightly off center
        return (
          <group position={[width / 2 - offsetFromWall, 0, 1.0]} rotation={[0, -Math.PI / 2, 0]}>
            <HumanScale />
          </group>
        );
      default:
        return null;
    }
  }, [selectedArtworkId, focusedWall, depth, width, thickness]);


  return (
    <group position={[0, 0, 0]}>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <primitive object={floorMaterial} />
      </mesh>
      
      {/* --- WALLS --- */}

      {/* Back Wall (Z = -depth/2) */}
      {showBackWall && (
        <group position={[0, height / 2, -depth / 2]}>
          <mesh position={[0, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[width, height, thickness]} />
            <primitive object={wallMaterial} />
          </mesh>
        </group>
      )}

      {/* Front Wall (Z = +depth/2) */}
      {showFrontWall && (
        <group position={[0, height / 2, depth / 2]}>
          <mesh position={[0, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[width, height, thickness]} />
            <primitive object={wallMaterial} />
          </mesh>
        </group>
      )}

      {/* Left Wall (X = -width/2) - With Window "Ponta a Ponta" */}
      {showLeftWall && (
        <group position={[-width / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
           {/* Window Geometry Construction */}
           {/* Bottom Wall (Sill) */}
           <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
              <boxGeometry args={[depth, 1.0, thickness]} />
              <primitive object={sideWallMaterial} />
           </mesh>

           {/* Top Wall (Header) */}
           <mesh position={[0, 3.0, 0]} castShadow receiveShadow>
              <boxGeometry args={[depth, 1.0, thickness]} />
              <primitive object={sideWallMaterial} />
           </mesh>

           {/* Glass Pane */}
           <mesh position={[0, 1.75, 0]}>
               <boxGeometry args={[depth, 1.5, 0.05]} />
               <primitive object={glassMaterial} />
           </mesh>
        </group>
      )}

      {/* Right Wall (X = width/2) - With Door shifted to Left */}
      {showRightWall && (
        <group position={[width / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
           {/* Wall Geometry: 5m total. 
               Desired: 2.6m on Left side (Back of room). 
               Door: 0.8m width.
               Remaining on Right side: 5 - 2.6 - 0.8 = 1.6m (Front of room).
           */}

           {/* Left Side Panel (2.6m wide) */}
           {/* Center is at start (-2.5) + half width (1.3) = -1.2 */}
           <mesh position={[-1.2, 1.75, 0]} castShadow receiveShadow>
              <boxGeometry args={[2.6, 3.5, thickness]} />
              <primitive object={sideWallMaterial} />
           </mesh>

           {/* Right Side Panel (1.6m wide) */}
           {/* Center is at end (2.5) - half width (0.8) = 1.7 */}
           <mesh position={[1.7, 1.75, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.6, 3.5, thickness]} />
              <primitive object={sideWallMaterial} />
           </mesh>

           {/* Header (Above Door, 0.8m wide) */}
           {/* Center is between -1.2 (left center) and 1.7 (right center) -> around 0.5 */}
           <mesh position={[0.5, 2.8, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.8, 1.4, thickness]} />
              <primitive object={sideWallMaterial} />
           </mesh>
        </group>
      )}

      {/* --- DYNAMIC ARTWORKS --- */}
      {artworks.map((art) => {
        // Visibility logic matching walls
        const isVisible = 
          (art.wall === 'left' && showLeftWall) ||
          (art.wall === 'right' && showRightWall) ||
          (art.wall === 'back' && showBackWall) ||
          (art.wall === 'front' && showFrontWall);

        return isVisible ? (
          <Artwork3D 
            key={art.id} 
            artwork={art} 
            isSelected={selectedArtworkId === art.id}
            onSelect={onSelectArtwork}
          />
        ) : null;
      })}

      {/* --- HUMAN SCALE REFERENCE --- */}
      {humanReference}

    </group>
  );
};
