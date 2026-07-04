import { Link } from 'react-router'

function getOAuthUrl() {
  const kimiAuthUrl = import.meta.env.VITE_KIMI_AUTH_URL;
  const appID = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${kimiAuthUrl}/api/oauth/authorize`);
  url.searchParams.set("client_id", appID);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "profile");
  url.searchParams.set("state", state);

  return url.toString();
}

export default function Login() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--deep-navy)' }}
    >
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{
                background: 'var(--accent-coral)',
                animation: 'pulse-dot 2s ease-in-out infinite',
              }}
            />
            <span className="text-2xl font-bold" style={{ color: 'var(--warm-ivory)' }}>
              KreditPulsa
            </span>
          </div>
          <p className="text-base" style={{ color: 'var(--warm-ivory)', opacity: 0.6 }}>
            Platform Paylater untuk Konter Pulsa
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: 'var(--surface-dark)',
            border: '1px solid rgba(253,240,213,0.08)',
          }}
        >
          <h2 className="text-xl font-semibold text-center mb-2" style={{ color: 'var(--warm-ivory)' }}>
            Masuk
          </h2>
          <p className="text-sm text-center mb-6" style={{ color: 'var(--warm-ivory)', opacity: 0.5 }}>
            Masuk ke dasbor KreditPulsa Anda
          </p>

          <button
            onClick={() => { window.location.href = getOAuthUrl(); }}
            className="w-full h-12 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] hover:shadow-lg flex items-center justify-center gap-2"
            style={{ background: 'var(--warm-ivory)', color: 'var(--deep-navy)' }}
          >
            Masuk dengan Kimi
          </button>

          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-sm transition-opacity hover:opacity-80"
              style={{ color: 'var(--accent-blue)' }}
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs mt-8" style={{ color: 'var(--warm-ivory)', opacity: 0.3 }}>
          2025 KreditPulsa. Semua hak dilindungi.
        </p>
      </div>
    </div>
  );
}
