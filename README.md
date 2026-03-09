# 🚀 Project Setup: React + Vite + Three.js

This repository is configured for 3D development using **React Three Fiber (R3F)** and **Vite**. Follow these steps to sync your local environment with the team.

## 🛠 Prerequisites
Ensure you have the following installed:
- **Node.js** (v18.0.0 or higher)
- **npm**

## 📥 Installation

1. **Clone the repository:**
   git clone <your-repo-url>
   cd <project-directory>

2. **Install dependencies:**
   npm install

   (This installs: three, @react-three/fiber, and @react-three/drei)

3. **Run the development server:**
   npm run dev

## 📂 Project Structure
- `src/components/`: Reusable 3D components and meshes.
- `public/`: Place 3D assets (.glb, .gltf, textures) here.
- `App.tsx`: The main entry point containing the <Canvas /> component.

## 💡 Team Conventions
- **Performance:** Use `useFrame` for animations instead of standard React state.
- **Assets:** Always use compressed .glb files for models to ensure fast load times.
- **Styles:** Ensure the #root and body have 100% width/height in CSS to prevent canvas clipping.

## 🚀 Build for Production
npm run build