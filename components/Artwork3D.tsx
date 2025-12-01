import React, { useMemo, Suspense } from 'react';
import { useTexture, Edges } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { Artwork, DEFAULT_ROOM } from '../types';
import * as THREE from 'three';

interface Artwork3DProps {
  artwork: Artwork;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

// Sub-component for texture loading to handle Suspense
const ArtworkImage: React.FC<{ url: string; dimensions: [number, number] }> = ({ url, dimensions }) => {
  const texture = useTexture(url);
  const gl = useThree(state => state.gl);

  useMemo(() => {
    // Improve texture quality
    texture.anisotropy = gl.capabilities.getMaxAnisotropy();
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = true;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
  }, [texture, gl]);
  
  return (
    <mesh position={[0, 0, 0.026]}>
       <planeGeometry args={[dimensions[0] - 0.1, dimensions[1] - 0.1]} />
       <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
};

export const Artwork3D: React.FC<Artwork3DProps> = ({ artwork, isSelected, onSelect }) => {
  
  // Calculate position and rotation based on wall selection
  const { position, rotation } = useMemo(() => {
    const { width, depth } = DEFAULT_ROOM;
    const [hOffset, vHeight] = artwork.position;
    
    // Wall configuration matching Room.tsx geometry
    const wallThickness = 0.2;
    const halfWallThickness = wallThickness / 2;
    const gap = 0.01; // Small gap to prevent z-fighting
    const wallOffset = halfWallThickness + gap; 

    let pos: [number, number, number] = [0, 0, 0];
    let rot: [number, number, number] = [0, 0, 0];

    switch (artwork.wall) {
      case 'back':
        // Back wall at Z = -depth/2
        // Inner face is at -depth/2 + halfThickness
        pos = [hOffset, vHeight, -depth / 2 + wallOffset];
        rot = [0, 0, 0];
        break;
      case 'front':
        // Front wall at Z = depth/2
        // Inner face is at depth/2 - halfThickness
        // Rotation: PI (180deg) to face inwards
        pos = [-hOffset, vHeight, depth / 2 - wallOffset];
        rot = [0, Math.PI, 0];
        break;
      case 'left':
        // Left wall at X = -width/2
        // Inner face is at -width/2 + halfThickness
        pos = [-width / 2 + wallOffset, vHeight, hOffset];
        rot = [0, Math.PI / 2, 0];
        break;
      case 'right':
        // Right wall at X = width/2
        // Inner face is at width/2 - halfThickness
        pos = [width / 2 - wallOffset, vHeight, hOffset];
        rot = [0, -Math.PI / 2, 0];
        break;
    }
    return { position: pos, rotation: rot };
  }, [artwork.wall, artwork.position]);

  return (
    <group position={position} rotation={rotation as any}>
      {/* Selection Highlight */}
      {isSelected && (
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[artwork.dimensions[0] + 0.1, artwork.dimensions[1] + 0.1]} />
          <meshBasicMaterial color="#3b82f6" side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* The Artwork Canvas/Frame */}
      <mesh 
        onClick={(e) => {
          e.stopPropagation();
          onSelect(artwork.id);
        }}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[artwork.dimensions[0], artwork.dimensions[1], 0.05]} />
        <meshStandardMaterial color="#fff" roughness={0.2} />
        <Edges color={isSelected ? "#2563eb" : "#e5e7eb"} />
      </mesh>

      {/* Image Content */}
      <Suspense fallback={
        <mesh position={[0, 0, 0.026]}>
           <planeGeometry args={[artwork.dimensions[0] - 0.1, artwork.dimensions[1] - 0.1]} />
           <meshStandardMaterial color="#f3f4f6" />
        </mesh>
      }>
        <ArtworkImage url={artwork.imageUrl} dimensions={artwork.dimensions} />
      </Suspense>
    </group>
  );
};