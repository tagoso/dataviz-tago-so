'use client';

import { Canvas } from '@react-three/fiber';
import * as d3 from 'd3';

export default function Page() {
  const rawData = [
    { x: 10, y: 20, category: 'A' },
    { x: 80, y: 60, category: 'B' },
    { x: 50, y: 90, category: 'C' },
  ];

  const xScale = d3.scaleLinear().domain([0, 100]).range([-5, 5]);
  const yScale = d3.scaleLinear().domain([0, 100]).range([-3, 3]);
  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />

        {rawData.map((d, i) => (
          <mesh key={i} position={[xScale(d.x), yScale(d.y), 0]}>
            <sphereGeometry args={[0.3, 32, 32]} />
            <meshStandardMaterial color={colorScale(d.category)} />
          </mesh>
        ))}
      </Canvas>
    </div>
  );
}
