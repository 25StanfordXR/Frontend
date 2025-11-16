# World Map Matcher UI

Prompt-driven frontend for the `/maps/match` backend. Users describe the world they need, the agent returns the best existing scene together with SPZ/PLY download URLs, and we stream the SPZ file via Spark.js.

## Features

- 💬 **Single Prompt Dialog**: Input world description to trigger backend lexical + LLM matching
- 🔗 **Direct `/maps/match` Integration**: Automatically reads static resources from response
- ✨ **Spark.js Real-time Rendering**: Matched SPZ/PLZ files directly enter 3D preview
- 🧭 **Match Insights Panel**: Displays map id, description, confidence, LLM reasoning and resource list
- 🎮 **Interaction Controls Preserved**: Fully retains reset, WASD movement and VR mode entry
- 🛠️ **Error Isolation**: API and rendering errors are prompted separately, won't affect each other

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

3. Configure backend address:
   ```bash
   cp .env.example .env
   # Default points to Modal deployment:
   # VITE_AGENT_API_BASE_URL=https://ybpang-1--world-map-matcher-fastapi-app.modal.run
   # If you need to connect to local FastAPI, modify here.
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

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

1. Enter world description in left dialog (more specific environment, material, lighting details are better).
2. After submission, backend calls `/maps/match`: lexical filtering + OpenRouter LLM scoring.
3. The corresponding `files` field contains SPZ/PLZ and PLY resources under `/assets`.
4. Frontend automatically selects SPZ/PLZ resources for Spark.js rendering, no manual download entry provided.
5. Right preview window can use mouse, WASD or Reset Camera control; click VR button to enter WebXR.

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
│   │   ├── SPZViewer/        # Spark.js + Three.js renderer
│   │   ├── PromptDialog/     # World description input and quick examples
│   │   ├── MatchDetails/     # Match results, confidence, resource list
│   │   ├── Controls/         # Camera control UI
│   │   └── LoadingSpinner/   # Loading state component
│   ├── api/
│   │   └── client.ts         # `/maps/match` request wrapper and URL assembly
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

Potential improvements now that the backend is wired up:
- Display Top-K candidate comparison/switching in UI
- Add `ply` point cloud or thumbnail preview
- Provide request history and quick replay
- Expose advanced rendering parameters like VR controls, exposure as UI options

## Resources

- [Spark.js Documentation](https://sparkjs.dev/docs/)
- [Three.js Documentation](https://threejs.org/docs/)
- [Gaussian Splatting Overview](https://repo-sam.inria.fr/fungraph/3d-gaussian-splatting/)

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
