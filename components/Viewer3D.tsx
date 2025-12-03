import React, { useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Grid, GizmoHelper, GizmoViewport } from '@react-three/drei';
import { Room } from './Room';
import { Artwork } from '../types';
import * as THREE from 'three';

interface Viewer3DProps {
  showDimensions: boolean;
  wallTransparency: boolean;
  artworks: Artwork[];
  selectedArtworkId: string | null;
  onSelectArtwork: (id: string | null) => void;
  focusedWall: 'back' | 'front' | 'right';
  screenshotHandle: React.MutableRefObject<(() => void) | null>;
}

// Helper component to access GL context and expose screenshot function
const ScreenshotManager = ({ handle }: { handle: React.MutableRefObject<(() => void) | null> }) => {
  const { gl, scene, camera } = useThree();

  useEffect(() => {
    handle.current = () => {
      // Render immediately to ensure latest state
      gl.render(scene, camera);
      const dataUrl = gl.domElement.toDataURL('image/png');
      
      const link = document.createElement('a');
      link.setAttribute('download', 'exposicao-virtual.png');
      link.setAttribute('href', dataUrl.replace('image/png', 'image/octet-stream'));
      link.click();
    };
    return () => {
      handle.current = null;
    };
  }, [gl, scene, camera, handle]);

  return null;
};

export const Viewer3D: React.FC<Viewer3DProps> = ({ 
  showDimensions, 
  wallTransparency,
  artworks,
  selectedArtworkId,
  onSelectArtwork,
  focusedWall,
  screenshotHandle
}) => {
  const controlsRef = useRef<any>(null);

  // Handle Wall Focus changes by animating camera to position
  useEffect(() => {
    if (controlsRef.current) {
      const controls = controlsRef.current;
      
      // Default behavior: When wall changes, snap to "Front View" of that wall
      // The user can then orbit (ISO) freely from there.
      
      if (focusedWall === 'back') {
        // Look at Back Wall (Z-)
        controls.object.position.set(0, 2, 12); 
      } else if (focusedWall === 'front') {
        // Look at Front Wall (Z+)
        controls.object.position.set(0, 2, -12); 
      } else if (focusedWall === 'right') {
        // Look at Right Wall (X+) from Left
        controls.object.position.set(-12, 2, 0); 
      }
      
      controls.target.set(0, 1.75, 0);
      controls.update();
    }
  }, [focusedWall]);

  return (
    <Canvas 
      shadows 
      className="w-full h-full bg-white" 
      onPointerMissed={() => onSelectArtwork(null)}
      gl={{ preserveDrawingBuffer: true }} // Important for screenshots
    >
      <ScreenshotManager handle={screenshotHandle} />
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