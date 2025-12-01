import React, { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Grid, GizmoHelper, GizmoViewport } from '@react-three/drei';
import { Room } from './Room';
import { ViewMode, Artwork } from '../types';
import * as THREE from 'three';

interface Viewer3DProps {
  viewMode: ViewMode;
  showDimensions: boolean;
  wallTransparency: boolean;
  artworks: Artwork[];
  selectedArtworkId: string | null;
  onSelectArtwork: (id: string | null) => void;
  focusedWall: 'back' | 'front';
}

export const Viewer3D: React.FC<Viewer3DProps> = ({ 
  viewMode, 
  showDimensions, 
  wallTransparency,
  artworks,
  selectedArtworkId,
  onSelectArtwork,
  focusedWall
}) => {
  const controlsRef = useRef<any>(null);

  // Handle View Mode changes by animating camera position
  useEffect(() => {
    if (controlsRef.current) {
      const controls = controlsRef.current;
      
      switch (viewMode) {
        case ViewMode.TOP:
          // Top down view
          controls.object.position.set(0, 12, 0);
          controls.target.set(0, 0, 0);
          break;
        case ViewMode.FRONT:
          // Front view (looking at Z)
          if (focusedWall === 'back') {
            controls.object.position.set(0, 2, 12);
          } else {
            controls.object.position.set(0, 2, -12); // Look from behind for Front wall
          }
          controls.target.set(0, 1.75, 0);
          break;
        case ViewMode.SIDE:
          // Side view (looking at X)
          controls.object.position.set(12, 2, 0);
          controls.target.set(0, 1.75, 0);
          break;
        case ViewMode.ISO:
        default:
          // Isometric-ish view
          if (focusedWall === 'back') {
             controls.object.position.set(10, 10, 10);
          } else {
             controls.object.position.set(-10, 10, -10); // Reverse iso for Front wall
          }
          controls.target.set(0, 0, 0);
          break;
      }
      controls.update();
    }
  }, [viewMode, focusedWall]);

  return (
    <Canvas shadows className="w-full h-full bg-white" onPointerMissed={() => onSelectArtwork(null)}>
      <PerspectiveCamera makeDefault position={[10, 10, 10]} fov={45} />
      
      <OrbitControls 
        ref={controlsRef} 
        makeDefault 
        minPolarAngle={0} 
        maxPolarAngle={Math.PI / 1.9} // Prevent going below floor
        enableDamping={true}
        dampingFactor={0.05}
      />

      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[5, 10, 5]} 
        intensity={1} 
        castShadow 
        shadow-mapSize={[2048, 2048]}
      >
        <orthographicCamera attach="shadow-camera" args={[-10, 10, 10, -10]} />
      </directionalLight>

      <group position={[0, -0.1, 0]}>
        {/* Helper Grid mimicking SketchUp/CAD software */}
        <Grid 
          infiniteGrid 
          fadeDistance={30} 
          sectionColor="#cbd5e1" 
          cellColor="#e2e8f0" 
          sectionSize={1} 
          cellSize={1} 
        />
      </group>

      <Room 
        showDimensions={showDimensions} 
        wallTransparency={wallTransparency} 
        artworks={artworks}
        selectedArtworkId={selectedArtworkId}
        onSelectArtwork={onSelectArtwork}
        focusedWall={focusedWall}
      />

      <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
        <GizmoViewport axisColors={['#ef4444', '#22c55e', '#3b82f6']} labelColor="black" />
      </GizmoHelper>

      <Environment preset="city" />
    </Canvas>
  );
};