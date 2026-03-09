import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei'; // Optional: adds camera controls
import './App.css';

function App() {
    return (
        <div className="App" style={{ height: '100vh', width: '100vw' }}>
            <Canvas camera={{ position: [0, 0, 5] }}> {/* Position the camera */}
                {/* Add lighting */}
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />

                {/* Add a 3D object (e.g., a simple cube) */}
                <mesh>
                    <boxGeometry args={[1, 1, 1]} /> {/* Box dimensions: 1x1x1 */}
                    <meshStandardMaterial color="hotpink" />
                </mesh>

                {/* Enable orbit controls for user interaction */}
                <OrbitControls enableDamping dampingFactor={0.05} />
            </Canvas>
        </div>
    );
}

export default App;
