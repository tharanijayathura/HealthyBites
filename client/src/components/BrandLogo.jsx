import { Link } from 'react-router-dom';

export default function BrandLogo({ className = '' }) {
  return (
    <Link to="/" className={`brand-logo ${className}`.trim()} aria-label="Healthy Bite Home">
      <span className="brand-icon-box">
        <img src="/images/logo.png" alt="" className="brand-logo-image" />
      </span>
      <span className="brand-wordmark">Healthy Bites</span>
    </Link>
  );
}
