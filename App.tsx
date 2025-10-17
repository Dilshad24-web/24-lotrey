import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch } from 'wouter';
import ChatPage from './ChatPage';
import AuthProvider from './AuthContext';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Switch>
          <Route path="/" component={ChatPage} />
        </Switch>
      </AuthProvider>
    </QueryClientProvider>
  );
}
