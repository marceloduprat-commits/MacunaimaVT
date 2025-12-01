import React from 'react';

export enum ViewMode {
  ISO = 'ISO',
  TOP = 'TOP',
  FRONT = 'FRONT',
  SIDE = 'SIDE'
}

export interface RoomDimensions {
  width: number; // x
  depth: number; // z
  height: number; // y
}

export const DEFAULT_ROOM: RoomDimensions = {
  width: 8,
  depth: 5,
  height: 3.5
};

// Added 'front' wall type
export type WallType = 'back' | 'left' | 'right' | 'front';

export interface Artwork {
  id: string;
  title: string;
  imageUrl: string; // Blob URL
  wall: WallType;
  position: [number, number]; // [horizontal offset, vertical height] relative to wall center/floor
  dimensions: [number, number]; // [width, height]
}

// Global declaration to fix "Property does not exist on type JSX.IntrinsicElements" errors
declare global {
  namespace JSX {
    interface IntrinsicElements {
      ambientLight: any;
      pointLight: any;
      directionalLight: any;
      spotLight: any;
      hemisphereLight: any;
      orthographicCamera: any;
      perspectiveCamera: any;
      mesh: any;
      group: any;
      position: any;
      rotation: any;
      scale: any;
      boxGeometry: any;
      planeGeometry: any;
      sphereGeometry: any;
      cylinderGeometry: any;
      capsuleGeometry: any;
      circleGeometry: any;
      meshStandardMaterial: any;
      meshBasicMaterial: any;
      meshPhongMaterial: any;
      primitive: any;
      color: any;
      // Catch-all for any other elements
      [elemName: string]: any;
    }
  }
}

// Also augment 'react' module specifically for React 18+ / newer TS resolutions
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      ambientLight: any;
      pointLight: any;
      directionalLight: any;
      spotLight: any;
      hemisphereLight: any;
      orthographicCamera: any;
      perspectiveCamera: any;
      mesh: any;
      group: any;
      position: any;
      rotation: any;
      scale: any;
      boxGeometry: any;
      planeGeometry: any;
      sphereGeometry: any;
      cylinderGeometry: any;
      capsuleGeometry: any;
      circleGeometry: any;
      meshStandardMaterial: any;
      meshBasicMaterial: any;
      meshPhongMaterial: any;
      primitive: any;
      color: any;
      [elemName: string]: any;
    }
  }
}
