import '@/styles/globals.css';
import type { AppProps } from 'next/app';

import Layout from '@/components/layout';
export default function App({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <div className="bg-[#d6d3d1]">
        <Component {...pageProps} />
      </div>
    </Layout>
  );
}
