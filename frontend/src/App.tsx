import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import SignUpPage from './pages/SignUpPage';
import SignInPage from './pages/SignInPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProfilePage from './pages/ProfilePage';
import TransactionsPage from './pages/TransactionsPage';
import DashboardPage from './pages/DashboardPage';
import BudgetPage from './pages/BudgetPage';
import SavingsGoalsPage from './pages/SavingsGoalsPage';
import ReportsPage from './pages/ReportsPage';
import AIInsightsPage from './pages/AIInsightsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ForumPage from './pages/ForumPage';
import ForumPostDetailPage from './pages/ForumPostDetailPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#201b1bff',
      background: 'radial-gradient(circle at center, #1a1a1a 0%, #000000 70%)',
      margin: 0,
      padding: 0
    }}>
      <Navbar />
      <main style={{ 
        minHeight: '100vh', 
        backgroundColor: '#000000',
        background: 'radial-gradient(circle at center, #1a1a1a 0%, #000000 70%)'
      }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/budget" element={<BudgetPage />} />
          <Route path="/savings-goals" element={<SavingsGoalsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/ai-insights" element={<AIInsightsPage />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminDashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/forum" element={<ForumPage />} />
          <Route path="/forum/:id" element={<ForumPostDetailPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

