# SPZ Viewer

A modern web-based viewer for SPZ (Gaussian Splatting) files, built with React, TypeScript, Three.js, and Spark.js.

## Features

- 📁 **Multiple Loading Options**: Load SPZ files via URL or local file upload
- 🎮 **Interactive 3D Controls**: Rotate, pan, and zoom with intuitive mouse controls
- 🎨 **Modern UI**: Clean, responsive interface that works on all devices
- ⚡ **High Performance**: Optimized rendering with Three.js and WebGL
- 🔄 **Real-time Preview**: Instant feedback with loading states and error handling
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

## What are SPZ Files?

SPZ is the native file format for 3D Gaussian Splats used by Spark.js. Gaussian splatting is a cutting-edge 3D rendering technique that represents scenes as collections of 3D Gaussian distributions, enabling photorealistic rendering from captured real-world scenes.

## Tech Stack

- **React 18**: Modern UI framework
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **Three.js**: 3D graphics library
- **Spark.js**: Gaussian splatting renderer
- **CSS Modules**: Scoped styling

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/25StanfordXR/Frontend.git
   cd Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The optimized production build will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Usage

### Loading Files

**From URL:**
1. Enter the URL of an SPZ file in the input field
2. Click "Load from URL"
3. The viewer will load and display the 3D scene

**From Local File:**
1. Click "Choose SPZ File"
2. Select an SPZ file from your computer
3. The viewer will load and display the 3D scene

### Controls

- **Left Click + Drag**: Rotate the camera around the scene
- **Right Click + Drag**: Pan the camera
- **Mouse Wheel**: Zoom in/out
- **Reset Camera Button**: Return to the default camera position

## Project Structure

```
Frontend/
├── src/
│   ├── components/
│   │   ├── SPZViewer/        # Core 3D viewer component
│   │   ├── FileUpload/       # File/URL input component
│   │   ├── Controls/         # Camera control UI
│   │   └── LoadingSpinner/   # Loading state component
│   ├── types/
│   │   └── index.ts          # TypeScript type definitions
│   ├── App.tsx               # Main application component
│   ├── App.css               # Global styles
│   ├── main.tsx              # Application entry point
│   └── index.css             # Base styles
├── public/                   # Static assets
├── index.html                # HTML template
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite configuration
└── README.md                 # This file
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Quality

The project uses:
- **TypeScript** for type safety
- **ESLint** for code linting
- **Strict mode** for better error detection

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

WebGL 2.0 support is required for 3D rendering.

## Known Issues

### Browser Extensions (Error 431)
Some browser extensions (password managers, ad blockers) may cause "431 Request Header Fields Too Large" errors. If you encounter this:
- Use incognito/private mode
- Temporarily disable browser extensions
- Use a different browser

### WebAssembly Warnings
You may see console warnings about WASM MIME types. These are harmless and don't affect functionality. The application will automatically fall back to slower initialization if needed.

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed solutions to common issues.

## Future Enhancements

Potential features for future versions:
- Backend integration for file storage
- User authentication and file management
- Splat editing capabilities (color/position)
- Advanced rendering options
- Performance statistics display
- Screenshot/export functionality
- Multiple file comparison view

## Resources

- [Spark.js Documentation](https://sparkjs.dev/docs/)
- [Three.js Documentation](https://threejs.org/docs/)
- [Gaussian Splatting Overview](https://repo-sam.inria.fr/fungraph/3d-gaussian-splatting/)

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
