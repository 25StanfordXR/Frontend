import { useEffect, useRef } from 'react';
import './HomePage.css';

function HomePage() {
  const sectionsRef = useRef<(HTMLElement | null)[]>([]);
  const statsAnimatedRef = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('section-visible');

            // Trigger stat counter animation once
            if (entry.target.classList.contains('hero-section') && !statsAnimatedRef.current) {
              statsAnimatedRef.current = true;
              animateStats();
            }
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    );

    sectionsRef.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  const animateStats = () => {
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach((stat) => {
      const target = parseInt(stat.getAttribute('data-target') || '0');
      const duration = 2000;
      const start = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(easeOutQuart * target);

        stat.textContent = current.toString();

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          stat.textContent = target.toString();
        }
      };

      requestAnimationFrame(animate);
    });
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section" ref={(el) => (sectionsRef.current[0] = el)}>
        <div className="hero-content">
          <div className="hero-badge">Unity Gaussian Splatting Optimization</div>
          <h1 className="hero-title">
            Advanced PLY Rendering
            <br />
            for VR & Real-time 3D
          </h1>
          <p className="hero-description">
            Production-ready Octree spatial partitioning, dual-layer LOD system, and K-Means compression
            <br />
            achieving 10:1 file size reduction while maintaining visual quality
          </p>
          <div className="hero-actions">
            <a
              href="https://github.com/aras-p/UnityGaussianSplatting"
              target="_blank"
              rel="noopener noreferrer"
              className="hero-button hero-button--primary"
            >
              View Plugin Repository
            </a>
            <a
              href="https://developer.oculus.com/documentation/unity/"
              target="_blank"
              rel="noopener noreferrer"
              className="hero-button hero-button--secondary"
            >
              Meta XR Documentation
            </a>
          </div>
        </div>

        <div className="hero-stats">
          <div className="stat-item">
            <div className="stat-number" data-target="24">0</div>
            <div className="stat-label">Octree Chunks</div>
          </div>
          <div className="stat-item">
            <div className="stat-number" data-target="10">0</div>
            <div className="stat-label">10:1 Compression</div>
          </div>
          <div className="stat-item">
            <div className="stat-number" data-target="147">0</div>
            <div className="stat-label">FPS on RTX 3080 Ti</div>
          </div>
        </div>
      </section>

      {/* Unity PLY Optimization Section */}
      <section className="tech-section" ref={(el) => (sectionsRef.current[1] = el)}>
        <div className="section-header">
          <h2 className="section-title">Unity PLY Rendering Optimization</h2>
          <p className="section-subtitle">
            Custom enhancements over UnityGaussianSplatting v1.1.1 plugin
          </p>
        </div>

        <div className="tech-grid">
          {/* Octree Partitioning */}
          <div className="tech-card">
            <div className="tech-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 12h18M12 3v18" />
                <path d="M7.5 7.5L12 12M16.5 7.5L12 12M7.5 16.5L12 12M16.5 16.5L12 12" opacity="0.5" />
              </svg>
            </div>
            <h3 className="tech-card-title">Octree Spatial Partitioning</h3>
            <p className="tech-card-description">
              Adaptive 8-way subdivision algorithm automatically divides point clouds into 24 balanced chunks
              based on density distribution
            </p>
            <div className="tech-card-features">
              <div className="feature-item">
                <strong>Algorithm:</strong> Iterative octree refinement
              </div>
              <div className="feature-item">
                <strong>Target:</strong> 24 chunks, 2000+ points each
              </div>
              <div className="feature-item">
                <strong>Benefit:</strong> Dense areas get more chunks
              </div>
            </div>
            <div className="tech-card-code">
              <div className="code-header">GaussianSplatAssetCreator.cs:946-982</div>
              <pre className="code-block">
{`List<OctreeNode> BuildOctreeNodes(
  splats, boundsMin, boundsMax,
  targetChunks: 24,
  minSplats: 2000
) {
  // Iteratively split largest node
  while (nodes.Count < targetChunks) {
    var largest = FindLargest(nodes);
    if (largest.count < minSplats) break;
    SplitOctreeNode(largest); // 8-way
  }
  return nodes;
}`}
              </pre>
            </div>
          </div>

          {/* LOD System */}
          <div className="tech-card">
            <div className="tech-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <circle cx="12" cy="12" r="7" opacity="0.5" />
                <circle cx="12" cy="12" r="10" opacity="0.25" />
              </svg>
            </div>
            <h3 className="tech-card-title">Dual-Layer LOD System</h3>
            <p className="tech-card-description">
              Distance-based quality switching with hysteresis to prevent flickering, dynamically calculated
              per chunk size
            </p>
            <div className="tech-card-features">
              <div className="feature-item">
                <strong>Near LOD:</strong> Norm11 position + Float16 SH (0-4m)
              </div>
              <div className="feature-item">
                <strong>Far LOD:</strong> Norm6 position + Cluster8k SH (4-12m)
              </div>
              <div className="feature-item">
                <strong>None:</strong> Disabled beyond 12m (saves GPU)
              </div>
            </div>
            <div className="tech-card-code">
              <div className="code-header">GaussianSplatChunkLodManager.cs</div>
              <pre className="code-block">
{`// Distance thresholds with hysteresis
nearToFar = chunkSize.magnitude * 0.6;
farDisable = chunkSize.magnitude * 1.2;
hysteresis = 0.5f; // prevent flicker

if (distance <= nearToFar - hysteresis)
  → Near LOD (high quality)
else if (distance <= farDisable - hysteresis)
  → Far LOD (compressed)
else
  → None (disabled)`}
              </pre>
            </div>
          </div>

          {/* K-Means Compression */}
          <div className="tech-card">
            <div className="tech-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="7.5 4.21 12 6.81 16.5 4.21" opacity="0.5" />
                <polyline points="7.5 19.79 7.5 14.6 3 12" opacity="0.5" />
                <polyline points="21 12 16.5 14.6 16.5 19.79" opacity="0.5" />
                <polyline points="3 12 7.5 9.4" opacity="0.25" />
                <polyline points="21 12 16.5 9.4" opacity="0.25" />
              </svg>
            </div>
            <h3 className="tech-card-title">K-Means SH Compression</h3>
            <p className="tech-card-description">
              Spherical harmonics coefficients clustered into 8192 centroids using Mini-Batch K-Means with
              SIMD acceleration
            </p>
            <div className="tech-card-features">
              <div className="feature-item">
                <strong>Algorithm:</strong> K-Means++ initialization
              </div>
              <div className="feature-item">
                <strong>Centroids:</strong> 8192 quality vs 16384 high
              </div>
              <div className="feature-item">
                <strong>Acceleration:</strong> Burst + AVX/NEON SIMD
              </div>
            </div>
            <div className="tech-card-code">
              <div className="code-header">Data Compression Results</div>
              <pre className="code-block">
{`// File size breakdown (ceramic 2M splats)
Uncompressed: ~1000 MB (theory)
Compressed:    ~100 MB (actual)

Breakdown:
- Position: Norm11 (4B) → 8 MB
- Color: BC7 block → 2 MB
- SH: Cluster8k → 15 MB
- Metadata: ChunkInfo → 122 KB

Compression ratio: 10:1`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Unity VR Integration Section */}
      <section className="vr-section" ref={(el) => (sectionsRef.current[2] = el)}>
        <div className="section-header">
          <h2 className="section-title">Unity VR Game Integration</h2>
          <p className="section-subtitle">
            Production deployment on Meta Quest 3/Pro with XR optimization
          </p>
        </div>

        <div className="vr-grid">
          <div className="vr-card">
            <h3 className="vr-card-title">Deployed Scenes</h3>
            <div className="scene-list">
              <div className="scene-item">
                <div className="scene-name">Autumnal City Park Panorama</div>
                <div className="scene-meta">
                  <span className="scene-points">2M points</span>
                  <span className="scene-size">32.3 MB</span>
                </div>
                <div className="scene-use">Full 360° panoramic background</div>
              </div>
              <div className="scene-item">
                <div className="scene-name">ceramic_500k</div>
                <div className="scene-meta">
                  <span className="scene-points">500K points</span>
                  <span className="scene-size">22.9 MB</span>
                </div>
                <div className="scene-use">Medium complexity objects</div>
              </div>
              <div className="scene-item">
                <div className="scene-name">e5f16d3c_ceramic</div>
                <div className="scene-meta">
                  <span className="scene-points">2M points</span>
                  <span className="scene-size">99.6 MB</span>
                </div>
                <div className="scene-use">High-fidelity showcase pieces</div>
              </div>
            </div>
          </div>

          <div className="vr-card">
            <h3 className="vr-card-title">VR Optimizations</h3>
            <div className="optimization-list">
              <div className="optimization-item">
                <div className="optimization-icon">✓</div>
                <div className="optimization-content">
                  <strong>XR Stereo Rendering</strong>
                  <p>Automatic eye texture resolution detection (Quest 3: 1832x1920 per eye)</p>
                </div>
              </div>
              <div className="optimization-item">
                <div className="optimization-icon">✓</div>
                <div className="optimization-content">
                  <strong>Meta XR SDK Integration</strong>
                  <p>Hand tracking, controller input, spatial audio, voice recognition</p>
                </div>
              </div>
              <div className="optimization-item">
                <div className="optimization-icon">✓</div>
                <div className="optimization-content">
                  <strong>LOD Reduces 40-60% Load</strong>
                  <p>Chunk-based culling maintains 72 FPS target on mobile GPU</p>
                </div>
              </div>
            </div>
          </div>

          <div className="vr-card vr-card--full">
            <h3 className="vr-card-title">Performance Benchmarks</h3>
            <div className="benchmark-table">
              <div className="benchmark-header">
                <div>Platform</div>
                <div>Scene</div>
                <div>Resolution</div>
                <div>FPS</div>
                <div>Frame Time</div>
              </div>
              <div className="benchmark-row">
                <div>NVIDIA RTX 3080 Ti</div>
                <div>6.1M points</div>
                <div>1200×797</div>
                <div className="benchmark-fps">147 FPS</div>
                <div>6.8 ms</div>
              </div>
              <div className="benchmark-row">
                <div>Apple M1 Max</div>
                <div>6.1M points</div>
                <div>1200×797</div>
                <div className="benchmark-fps">46 FPS</div>
                <div>21.5 ms</div>
              </div>
              <div className="benchmark-row">
                <div>Meta Quest 3 (Est.)</div>
                <div>2M points + LOD</div>
                <div>1832×1920×2</div>
                <div className="benchmark-fps">72 FPS</div>
                <div>13.9 ms</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section className="architecture-section" ref={(el) => (sectionsRef.current[3] = el)}>
        <div className="section-header">
          <h2 className="section-title">Unity Project Architecture</h2>
          <p className="section-subtitle">
            Core technology stack and runtime pipeline
          </p>
        </div>

        <div className="architecture-diagram">
          <div className="arch-layer">
            <div className="arch-layer-title">Unity Engine Core</div>
            <div className="arch-boxes">
              <div className="arch-box">Unity 2022.3+</div>
              <div className="arch-box">Burst Compiler</div>
              <div className="arch-box">Job System</div>
            </div>
          </div>
          <div className="arch-arrow">↓</div>
          <div className="arch-layer">
            <div className="arch-layer-title">Gaussian Splatting Pipeline</div>
            <div className="arch-boxes">
              <div className="arch-box">UnityGaussianSplatting v1.1.1</div>
              <div className="arch-box">Custom Octree Partitioner</div>
              <div className="arch-box">LOD Manager</div>
            </div>
          </div>
          <div className="arch-arrow">↓</div>
          <div className="arch-layer">
            <div className="arch-layer-title">VR Runtime</div>
            <div className="arch-boxes">
              <div className="arch-box">Meta XR SDK</div>
              <div className="arch-box">OpenXR</div>
              <div className="arch-box">XR Interaction Toolkit</div>
            </div>
          </div>
        </div>

        <div className="arch-features">
          <div className="arch-feature">
            <strong>Rendering:</strong> Compute Shader GPU sorting + Burst CPU optimization for real-time point cloud rendering
          </div>
          <div className="arch-feature">
            <strong>Data Pipeline:</strong> PLY/SPZ import → Octree partitioning → K-Means compression → Runtime LOD streaming
          </div>
          <div className="arch-feature">
            <strong>VR Platform:</strong> Meta Quest 3/Pro deployment with hand tracking, spatial audio, and voice input
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Resources</h4>
            <div className="footer-links">
              <a href="https://github.com/aras-p/UnityGaussianSplatting" target="_blank" rel="noopener noreferrer">
                Plugin Repository
              </a>
              <a href="https://repo-url.github.io/gaussian-splatting" target="_blank" rel="noopener noreferrer">
                3DGS Paper
              </a>
            </div>
          </div>
          <div className="footer-section">
            <h4>Unity Documentation</h4>
            <div className="footer-links">
              <a href="https://developer.oculus.com/documentation/unity/" target="_blank" rel="noopener noreferrer">
                Meta XR SDK Docs
              </a>
              <a href="https://docs.unity3d.com/Packages/com.unity.burst@latest" target="_blank" rel="noopener noreferrer">
                Burst Compiler
              </a>
            </div>
          </div>
          <div className="footer-section">
            <h4>Credits</h4>
            <div className="footer-text">
              UnityGaussianSplatting by Aras Pranckevicius
              <br />
              25XR World Matching Agent
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>Unity 2022.3+ with Meta XR SDK · Production-ready Gaussian Splatting for VR</p>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
