# World Map Matcher UI

Prompt-driven frontend for the `/maps/match` backend. Users describe the world they need, the agent returns the best existing scene together with SPZ/PLY download URLs, and we stream the SPZ file via Spark.js.

## Features

- 💬 **Single Prompt Dialog**：输入世界描述即可触发后端词法+LLM 匹配
- 🔗 **直接对接 `/maps/match`**：自动读取响应中的静态下载地址
- ✨ **Spark.js 实时渲染**：匹配到的 SPZ/PLZ 文件直接进入 3D 预览
- 🧭 **匹配洞察面板**：显示 map id、描述、置信度、LLM 推理及资源列表
- 🎮 **交互控制保持**：完整保留复位、WASD 行走和 VR 模式入口
- 🛠️ **错误隔离**：API、渲染错误分别提示，不会互相影响

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

3. 配置后端地址：
   ```bash
   cp .env.example .env
   # 编辑 .env 并确认 VITE_AGENT_API_BASE_URL 指向 FastAPI 服务
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

1. 在左侧对话框输入世界描述（环境、材质、光照等越具体越好）。
2. 提交后端会调用 `/maps/match`：词法筛选 + OpenRouter LLM 打分。
3. 相应的 `files` 字段包含 `/assets` 下的 SPZ/PLZ 与 PLY 下载地址。
4. 前端自动挑选 SPZ/PLZ 资源交给 Spark.js 渲染，其余文件提供下载链接。
5. 右侧预览窗口可使用鼠标、WASD 或 Reset Camera 控制；点击 VR 按钮进入 WebXR。

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
│   │   ├── SPZViewer/        # Spark.js + Three.js 渲染器
│   │   ├── PromptDialog/     # 世界描述输入与快速示例
│   │   ├── MatchDetails/     # 匹配结果、置信度、资源列表
│   │   ├── Controls/         # 摄像机控制 UI
│   │   └── LoadingSpinner/   # Loading 状态组件
│   ├── api/
│   │   └── client.ts         # `/maps/match` 请求封装与 URL 拼接
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
- 在 UI 中展示 Top-K 候选对比/切换
- 增加 `ply` 云点或缩略图预览
- 提供请求历史与快速重放
- 将 VR 控制、曝光等高级渲染参数开放为 UI 选项

## Resources

- [Spark.js Documentation](https://sparkjs.dev/docs/)
- [Three.js Documentation](https://threejs.org/docs/)
- [Gaussian Splatting Overview](https://repo-sam.inria.fr/fungraph/3d-gaussian-splatting/)

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
