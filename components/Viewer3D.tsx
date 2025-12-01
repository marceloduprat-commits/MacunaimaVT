import React, { useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
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
  viewMode, 
  showDimensions, 
  wallTransparency,
  artworks,
  selectedArtworkId,
  onSelectArtwork,
  focusedWall,
  screenshotHandle
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
          // Front view logic depends on focused wall
          if (focusedWall === 'back') {
            controls.object.position.set(0, 2, 12); // Look at back wall (Z-)
          } else if (focusedWall === 'front') {
            controls.object.position.set(0, 2, -12); // Look at front wall (Z+)
          } else if (focusedWall === 'right') {
            controls.object.position.set(-12, 2, 0); // Look at right wall (X+) from left
          }
          controls.target.set(0, 1.75, 0);
          break;
        case ViewMode.SIDE:
          // Side view (looking at X) - Legacy, mostly handled by 'right' focus now but kept for compatibility
          controls.object.position.set(12, 2, 0);
          controls.target.set(0, 1.75, 0);
          break;
        case ViewMode.ISO:
        default:
          // Isometric-ish view
          if (focusedWall === 'back') {
             controls.object.position.set(10, 10, 10);
          } else if (focusedWall === 'front') {
             controls.object.position.set(-10, 10, -10); 
          } else if (focusedWall === 'right') {
             controls.object.position.set(-10, 10, 10); // View from Front-Left
          }
          controls.target.set(0, 0, 0);
          break;
      }
      controls.update();
    }
  }, [viewMode, focusedWall]);

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