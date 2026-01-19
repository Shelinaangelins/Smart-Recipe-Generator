import './globals.css';

export const metadata = {
  title: 'Smart Recipe Analyzer - ML Powered',
  description: 'AI-powered recipe analysis with cuisine prediction and health insights',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}