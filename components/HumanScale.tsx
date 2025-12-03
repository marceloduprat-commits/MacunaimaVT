import React from 'react';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

export const HumanScale: React.FC = () => {
  return (
    <group>
      {/* Cabeça */}
      <mesh position={[0, 1.65, 0]}>
        <circleGeometry args={[0.11, 32]} />
        <meshBasicMaterial 
          color="#000000" 
          transparent 
          opacity={0.15} 
          side={THREE.DoubleSide} 
          depthWrite={false} // CRUCIAL: Impede que a parede "engula" a sombra
        />
      </mesh>

      {/* Tronco */}
      <mesh position={[0, 1.15, 0]}>
        <planeGeometry args={[0.45, 0.7]} />
        <meshBasicMaterial 
          color="#000000" 
          transparent 
          opacity={0.15} 
          side={THREE.DoubleSide} 
          depthWrite={false} 
        />
      </mesh>
      
      {/* Perna Esquerda */}
      <mesh position={[-0.11, 0.4, 0]}>
         <planeGeometry args={[0.13, 0.8]} />
         <meshBasicMaterial 
          color="#000000" 
          transparent 
          opacity={0.15} 
          side={THREE.DoubleSide} 
          depthWrite={false} 
        />
      </mesh>

      {/* Perna Direita */}
      <mesh position={[0.11, 0.4, 0]}>
         <planeGeometry args={[0.13, 0.8]} />
         <meshBasicMaterial 
          color="#000000" 
          transparent 
          opacity={0.15} 
          side={THREE.DoubleSide} 
          depthWrite={false} 
        />
      </mesh>

      {/* Linha dos Olhos (1.60m) - Referência Vermelha */}
      <Line
        points={[[-0.8, 1.6, 0.01], [0.8, 1.6, 0.01]]}
        color="#ef4444" 
        opacity={0.5}
        transparent
        lineWidth={1.5}
        dashed={true}
        dashSize={0.05}
        gapSize={0.05}
      />
    </group>
  );
};