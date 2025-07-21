import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  Menu, 
  X, 
  Home, 
  Search, 
  Calendar, 
  User, 
  LogOut,
  Stethoscope
} from 'lucide-react';

export default function Layout({ children, onNavigate, currentPage }) {
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Início', page: 'home', icon: Home },
    { name: 'Buscar Profissionais', page: 'search', icon: Search },
    { name: 'Minhas Consultas', page: 'appointments', icon: Calendar },
    { name: 'Perfil', page: 'profile', icon: User },
  ];

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  const handleNavigation = (page) => {
    if (onNavigate) {
      onNavigate(page);
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
                <Heart className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">MenteCare</h1>
                <p className="text-xs text-muted-foreground">Saúde Mental</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            {isAuthenticated && (
              <nav className="hidden md:flex space-x-8">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.page;
                  return (
                    <button
                      key={item.name}
                      onClick={() => handleNavigation(item.page)}
                      className={`flex items-center space-x-2 transition-colors ${
                        isActive 
                          ? 'text-primary font-medium' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </nav>
            )}

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <div className="hidden md:flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        {user?.full_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user?.user_type === 'patient' ? 'Paciente' : 'Profissional'}
                      </p>
                    </div>
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-primary-foreground" />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="hidden md:flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sair</span>
                  </Button>
                </>
              ) : (
                <div className="hidden md:flex space-x-2">
                  <Button variant="ghost" size="sm">
                    <a href="/login">Entrar</a>
                  </Button>
                  <Button size="sm">
                    <a href="/register">Cadastrar</a>
                  </Button>
                </div>
              )}

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-white">
            <div className="px-4 py-3 space-y-3">
              {isAuthenticated ? (
                <>
                  {/* User info */}
                  <div className="flex items-center space-x-3 pb-3 border-b border-border">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {user?.full_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {user?.user_type === 'patient' ? 'Paciente' : 'Profissional'}
                      </p>
                    </div>
                  </div>

                  {/* Navigation items */}
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.page;
                    return (
                      <button
                        key={item.name}
                        onClick={() => handleNavigation(item.page)}
                        className={`flex items-center space-x-3 py-2 transition-colors w-full text-left ${
                          isActive 
                            ? 'text-primary font-medium' 
                            : 'text-foreground hover:text-primary'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </button>
                    );
                  })}

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 py-2 text-foreground hover:text-destructive transition-colors w-full"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Sair</span>
                  </button>
                </>
              ) : (
                <div className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start">
                    <a href="/login">Entrar</a>
                  </Button>
                  <Button className="w-full">
                    <a href="/register">Cadastrar</a>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-muted border-t border-border mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="w-6 h-6 text-primary" />
                <span className="font-bold text-lg">MenteCare</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Conectando você aos melhores profissionais de saúde mental através da telemedicina.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Serviços</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Consultas Online</li>
                <li>Psicologia Clínica</li>
                <li>Psiquiatria</li>
                <li>Terapia de Casal</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Contato</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>contato@mentecare.com.br</li>
                <li>(11) 9999-9999</li>
                <li>Disponível 24/7</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 MenteCare. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

