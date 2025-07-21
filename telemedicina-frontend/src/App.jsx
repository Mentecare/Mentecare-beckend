import { useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth.jsx';
import Layout from './components/Layout.jsx';
import LoginForm from './components/LoginForm.jsx';
import HomePage from './components/HomePage.jsx';
import SearchProfessionals from './components/SearchProfessionals.jsx';
import VideoCall from './components/VideoCall.jsx';
import './App.css';

// Componente para gerenciar a navegação baseada na autenticação
function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [showRegister, setShowRegister] = useState(false);
  const [videoCallData, setVideoCallData] = useState(null);

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não estiver autenticado, mostrar login
  if (!isAuthenticated) {
    return (
      <LoginForm 
        onSwitchToRegister={() => setShowRegister(true)}
      />
    );
  }

  // Se estiver em videochamada, mostrar componente de videochamada
  if (videoCallData) {
    return (
      <VideoCall
        appointmentId={videoCallData.appointmentId}
        isHost={videoCallData.isHost}
        participantName={videoCallData.participantName}
        onEndCall={() => setVideoCallData(null)}
      />
    );
  }

  // Função para navegar entre páginas
  const navigate = (page, data = null) => {
    if (page === 'video-call') {
      setVideoCallData(data);
    } else {
      setCurrentPage(page);
    }
  };

  // Renderizar página atual
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'search':
        return <SearchProfessionals onNavigate={navigate} />;
      case 'appointments':
        return <div className="p-8 text-center">Página de Consultas em desenvolvimento</div>;
      case 'profile':
        return <div className="p-8 text-center">Página de Perfil em desenvolvimento</div>;
      default:
        return <HomePage onNavigate={navigate} />;
    }
  };

  // Se estiver autenticado, mostrar aplicação principal
  return (
    <Layout onNavigate={navigate} currentPage={currentPage}>
      {renderCurrentPage()}
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

