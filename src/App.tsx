import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { EventBrowser } from './pages/EventBrowser';
import { EventDetail } from './pages/EventDetail';
import { Layout } from './components/Layout';
import { ThemeProvider } from './contexts/ThemeContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <HashRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<EventBrowser />} />
              <Route path="/event/:eventKey" element={<EventDetail />} />
            </Routes>
          </Layout>
        </HashRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
