import React, { useMemo } from 'react';
import { Edges, Html, Text } from '@react-three/drei';
import { DEFAULT_ROOM, Artwork } from '../types';
import { Artwork3D } from './Artwork3D';
import * as THREE from 'three';

interface RoomProps {
  showDimensions: boolean;
  wallTransparency: boolean;
  artworks: Artwork[];
  selectedArtworkId: string | null;
  onSelectArtwork: (id: string) => void;
  focusedWall: 'back' | 'front';
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
  
  // SketchUp style material
  const wallMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#ffffff',
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
  // If focused on BACK: Hide FRONT wall
  // If focused on FRONT: Hide BACK wall
  const showBackWall = focusedWall === 'back';
  const showFrontWall = focusedWall === 'front';

  return (
    <group position={[0, 0, 0]}>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <primitive object={floorMaterial} />
        <Edges color="#94a3b8" />
      </mesh>

      {/* --- WALLS --- */}

      {/* Back Wall (Z = -depth/2) - Only visible if focused on back */}
      {showBackWall && (
        <group position={[0, height / 2, -depth / 2]}>
          <mesh position={[0, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[width, height, thickness]} />
            <primitive object={wallMaterial} />
            <Edges color="#334155" threshold={15} />
          </mesh>
        </group>
      )}

      {/* Front Wall (Z = +depth/2) - Only visible if focused on front */}
      {showFrontWall && (
        <group position={[0, height / 2, depth / 2]}>
          <mesh position={[0, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[width, height, thickness]} />
            <primitive object={wallMaterial} />
            <Edges color="#334155" threshold={15} />
          </mesh>
        </group>
      )}

      {/* Left Wall (X = -width/2) - With Window "Ponta a Ponta" */}
      <group position={[-width / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
         {/* Window Geometry Construction */}
         {/* Sill Height: 1m, Window Height: 1.5m, Header: 1m */}
         
         {/* Bottom Wall (Sill) */}
         <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
            <boxGeometry args={[depth, 1.0, thickness]} />
            <primitive object={wallMaterial} />
            <Edges color="#334155" />
         </mesh>

         {/* Top Wall (Header) */}
         <mesh position={[0, 3.0, 0]} castShadow receiveShadow>
            <boxGeometry args={[depth, 1.0, thickness]} />
            <primitive object={wallMaterial} />
            <Edges color="#334155" />
         </mesh>

         {/* Glass Pane */}
         <mesh position={[0, 1.75, 0]}>
             <boxGeometry args={[depth, 1.5, 0.05]} />
             <primitive object={glassMaterial} />
         </mesh>
      </group>

      {/* Right Wall (X = width/2) - With Door 2.10x0.80 center */}
      <group position={[width / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
         {/* Door Dimensions */}
         {/* Total Width (Depth of room): 5m */}
         {/* Door Width: 0.8m */}
         {/* Door Height: 2.1m */}
         {/* Side pieces width: (5 - 0.8) / 2 = 2.1m */}

         {/* Left Side (looking at wall from inside) */}
         <mesh position={[-1.45, 1.75, 0]} castShadow receiveShadow>
            <boxGeometry args={[2.1, 3.5, thickness]} />
            <primitive object={wallMaterial} />
            <Edges color="#334155" />
         </mesh>

         {/* Right Side */}
         <mesh position={[1.45, 1.75, 0]} castShadow receiveShadow>
            <boxGeometry args={[2.1, 3.5, thickness]} />
            <primitive object={wallMaterial} />
            <Edges color="#334155" />
         </mesh>

         {/* Header (Above Door) */}
         {/* Height remaining: 3.5 - 2.1 = 1.4m */}
         {/* Center Y: 2.1 + (1.4/2) = 2.8m */}
         <mesh position={[0, 2.8, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.8, 1.4, thickness]} />
            <primitive object={wallMaterial} />
            <Edges color="#334155" />
         </mesh>
      </group>

      {/* --- DYNAMIC ARTWORKS --- */}
      {artworks.map((art) => {
        // Only show artworks for the current visible main wall
        // Always show artworks on side walls
        const isVisible = 
          (art.wall === 'left' || art.wall === 'right') ||
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