# SPZ Viewer - Project Overview

## 🎯 Project Summary

A modern web application for online preview of SPZ (Gaussian Splatting) 3D files. This project is built with React + TypeScript + Vite, integrating Spark.js and Three.js to achieve high-performance 3D rendering.

## ✨ Core Features

### Implemented Features
- ✅ Load SPZ files via URL
- ✅ Upload local SPZ files
- ✅ Interactive 3D viewer (rotate, zoom, pan)
- ✅ Camera controls and reset functionality
- ✅ Loading status and error handling
- ✅ Fully responsive design
- ✅ TypeScript type safety
- ✅ Modern UI interface

### Technical Features
- ⚡ Vite build tool - Lightning-fast development experience
- 🎨 CSS Modules - Scoped styles
- 🔒 TypeScript - Type safety guarantee
- 🎮 Three.js - 3D graphics rendering
- ✨ Spark.js - Gaussian Splatting support
- 📱 Responsive design - Supports all devices

## 📁 Project Structure

```
Frontend/
├── src/
│   ├── components/              # React components
│   │   ├── SPZViewer/          # Core 3D viewer
│   │   │   ├── SPZViewer.tsx   # Main component logic
│   │   │   ├── SPZViewer.css   # Styles
│   │   │   └── index.ts        # Export
│   │   ├── FileUpload/         # File upload component
│   │   ├── Controls/           # Control panel
│   │   └── LoadingSpinner/     # Loading animation
│   ├── types/                  # TypeScript type definitions
│   ├── App.tsx                 # Main application component
│   ├── App.css                 # Global styles
│   ├── main.tsx                # Application entry
│   └── index.css               # Base styles
├── public/
│   └── samples/                # Sample files directory
├── .vscode/                    # VS Code configuration
├── package.json                # Dependency configuration
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite configuration
├── README.md                   # Complete documentation
├── QUICKSTART.md               # Quick start guide
└── PROJECT_OVERVIEW.md         # This file
```

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open browser and visit
# http://localhost:3000

# 4. Build production version
npm run build

# 5. Preview production version
npm run preview
```

## 🛠️ Technology Stack Details

### Core Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| React | ^18.2.0 | UI framework |
| React DOM | ^18.2.0 | React renderer |
| Three.js | ^0.178.0 | 3D graphics library |
| @sparkjsdev/spark | ^0.1.10 | Gaussian Splatting rendering |

### Development Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| TypeScript | ^5.2.2 | Type system |
| Vite | ^5.2.0 | Build tool |
| @vitejs/plugin-react | ^4.2.1 | React plugin |
| ESLint | ^8.57.0 | Code linting |

## 🎨 Architecture Design

### Component Hierarchy
```
App (Main application)
├── FileUpload (File upload interface)
│   ├── URL input form
│   └── Local file selection
├── SPZViewer (3D viewer)
│   ├── Three.js Scene
│   ├── Camera
│   ├── Renderer
│   ├── OrbitControls
│   └── SplatMesh
├── Controls (Control panel)
│   ├── Reset button
│   └── Operation instructions
└── LoadingSpinner (Loading animation)
```

### Data Flow
1. User selects SPZ file (URL or local file)
2. App component updates `viewerState`
3. SPZViewer receives file source and loads
4. Three.js scene initializes
5. SplatMesh loads SPZ data
6. Render loop begins
7. OrbitControls handles user interaction

## 🔧 Core Implementation

### SPZViewer Component
- Uses React hooks to manage Three.js lifecycle
- `useEffect` handles scene initialization
- `useRef` maintains Three.js object references
- Automatically handles window resizing
- Memory cleanup and resource release

### File Loading
- URL direct loading
- Local files converted via `URL.createObjectURL()`
- File format validation (.spz extension)
- Loading timeout handling (30 seconds)
- Error boundaries and user feedback

### 3D Interaction
- OrbitControls provides standard camera controls
- Damping effect for smooth interaction
- Zoom distance limits (1-100)
- Camera reset functionality

## 📊 Performance Optimization

- Vite's fast HMR (Hot Module Replacement)
- Three.js WebGL rendering optimization
- Component lazy loading (on demand)
- CSS modularization reduces style conflicts
- TypeScript compilation optimization
- Production build code splitting

## 🔮 Future Extensions

### Planned Features
- [ ] Backend integration (file storage, user management)
- [ ] SPZ file editing functionality (color, position)
- [ ] Performance statistics panel (FPS, memory)
- [ ] Screenshot and export functionality
- [ ] Fullscreen mode
- [ ] Multi-file comparison view
- [ ] File format conversion
- [ ] Advanced rendering options

### Architecture Extension Points
- API layer interfaces reserved
- Component design makes adding features easy
- TypeScript interfaces support extensions
- Configurable rendering parameters

## 🌐 Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ⚠️ WebGL 2.0 support required

## 📚 Related Resources

- [Spark.js Official Documentation](https://sparkjs.dev/docs/)
- [Three.js Official Documentation](https://threejs.org/docs/)
- [3D Gaussian Splatting Paper](https://repo-sam.inria.fr/fungraph/3d-gaussian-splatting/)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)

## 📝 Development Standards

### Code Style
- ESLint rules checking
- TypeScript strict mode
- Components use functional approach
- CSS Modules scoped styles

### Naming Conventions
- Components: PascalCase (e.g., `SPZViewer`)
- Files: Match component names
- Variables: camelCase
- Constants: UPPER_SNAKE_CASE
- CSS classes: kebab-case

### Git Workflow
- main branch is production branch
- Feature development uses feature branches
- Merge after code review

## 🤝 Contributing Guidelines

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

ISC License

## 👥 Authors

25XR Team

---

**Project Status**: ✅ Production Ready

**Last Updated**: 2025-11-14
