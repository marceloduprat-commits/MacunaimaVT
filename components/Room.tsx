import React, { useMemo } from 'react';
import { DEFAULT_ROOM, Artwork } from '../types';
import { Artwork3D } from './Artwork3D';
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

      {/* Right Wall (X = width/2) - With Door 2.10x0.80 center */}
      {showRightWall && (
        <group position={[width / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
           {/* Door Dimensions */}
           {/* Left Side (looking at wall from inside) */}
           <mesh position={[-1.45, 1.75, 0]} castShadow receiveShadow>
              <boxGeometry args={[2.1, 3.5, thickness]} />
              <primitive object={sideWallMaterial} />
           </mesh>

           {/* Right Side */}
           <mesh position={[1.45, 1.75, 0]} castShadow receiveShadow>
              <boxGeometry args={[2.1, 3.5, thickness]} />
              <primitive object={sideWallMaterial} />
           </mesh>

           {/* Header (Above Door) */}
           <mesh position={[0, 2.8, 0]} castShadow receiveShadow>
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

    </group>
  );
};