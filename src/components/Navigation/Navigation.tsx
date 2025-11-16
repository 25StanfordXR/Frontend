import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

function Navigation() {
  const location = useLocation();

  return (
    <nav className="navigation">
      <div className="navigation-container">
        <div className="navigation-brand">
          <span className="navigation-logo">25XR</span>
          <span className="navigation-divider">|</span>
          <span className="navigation-tagline">Unity Gaussian Splatting Showcase</span>
        </div>

        <div className="navigation-links">
          <Link
            to="/"
            className={`navigation-link ${location.pathname === '/' ? 'navigation-link--active' : ''}`}
          >
            Home
          </Link>
          <Link
            to="/viewer"
            className={`navigation-link ${location.pathname === '/viewer' ? 'navigation-link--active' : ''}`}
          >
            3D Viewer
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
