import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import api from '../lib/api.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  Video, 
  MessageCircle, 
  BookOpen, 
  Star,
  ArrowRight,
  Heart,
  Shield,
  Users,
  Stethoscope,
  Search
} from 'lucide-react';

export default function HomePage({ onNavigate }) {
  const { user } = useAuth();
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUpcomingAppointments();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadUpcomingAppointments = async () => {
    try {
      const response = await api.getMyAppointments('scheduled', 1);
      setUpcomingAppointments(response.appointments.slice(0, 3)); // Mostrar apenas as próximas 3
    } catch (error) {
      console.error('Erro ao carregar consultas:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Página para usuários não autenticados
  if (!user) {
    return (
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
                Cuidado com sua{' '}
                <span className="text-primary">saúde mental</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                Conecte-se com psicólogos e psiquiatras qualificados através de consultas online seguras e acessíveis.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-lg px-8">
                  <a href="/register">Começar Agora</a>
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8">
                  <a href="/search">Encontrar Profissionais</a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Por que escolher o MenteCare?
              </h2>
              <p className="text-lg text-muted-foreground">
                Oferecemos uma plataforma completa para seus cuidados de saúde mental
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Video className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Consultas Online</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Realize consultas por videochamada no conforto da sua casa, com total privacidade e segurança.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Profissionais Verificados</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Todos os nossos profissionais são verificados e possuem registro nos conselhos competentes.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Preços Acessíveis</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Oferecemos consultas com preços justos, tornando o cuidado mental acessível para todos.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-primary-foreground mb-4">
              Pronto para cuidar da sua saúde mental?
            </h2>
            <p className="text-xl text-primary-foreground/80 mb-8">
              Cadastre-se agora e encontre o profissional ideal para você
            </p>
            <Button size="lg" variant="secondary" className="text-lg px-8">
              <a href="/register">Criar Conta Gratuita</a>
            </Button>
          </div>
        </section>
      </div>
    );
  }

  // Página para usuários autenticados
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Olá, {user.full_name}! 👋
          </h1>
          <p className="text-muted-foreground">
            {user.user_type === 'patient' 
              ? 'Como você está se sentindo hoje?' 
              : 'Pronto para ajudar seus pacientes hoje?'
            }
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
                <CardDescription>
                  Acesse rapidamente as principais funcionalidades
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {user.user_type === 'patient' ? (
                    <>
                      <Button 
                        variant="outline" 
                        className="h-20 flex-col space-y-2"
                        onClick={() => onNavigate && onNavigate('search')}
                      >
                        <Search className="w-6 h-6" />
                        <span className="text-sm">Buscar Profissionais</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-20 flex-col space-y-2"
                        onClick={() => onNavigate && onNavigate('appointments')}
                      >
                        <Calendar className="w-6 h-6" />
                        <span className="text-sm">Agendar Consulta</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-20 flex-col space-y-2"
                        onClick={() => onNavigate && onNavigate('video-call', {
                          appointmentId: 1,
                          isHost: false,
                          participantName: 'Dr. Ana Costa'
                        })}
                      >
                        <Video className="w-6 h-6" />
                        <span className="text-sm">Entrar em Consulta</span>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        variant="outline" 
                        className="h-20 flex-col space-y-2"
                        onClick={() => onNavigate && onNavigate('appointments')}
                      >
                        <Calendar className="w-6 h-6" />
                        <span className="text-sm">Minha Agenda</span>
                      </Button>
                      <Button variant="outline" className="h-20 flex-col space-y-2">
                        <Users className="w-6 h-6" />
                        <span className="text-sm">Meus Pacientes</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-20 flex-col space-y-2"
                        onClick={() => onNavigate && onNavigate('profile')}
                      >
                        <Stethoscope className="w-6 h-6" />
                        <span className="text-sm">Perfil Profissional</span>
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Appointments */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Próximas Consultas</CardTitle>
                  <CardDescription>
                    Suas consultas agendadas para os próximos dias
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm">
                  <a href="/appointments" className="flex items-center space-x-2">
                    <span>Ver todas</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : upcomingAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {user.user_type === 'patient' 
                                ? appointment.professional?.user?.full_name 
                                : appointment.patient?.full_name
                              }
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span>{formatDate(appointment.appointment_date)}</span>
                              <span>{formatTime(appointment.appointment_date)}</span>
                              <Badge variant="secondary">
                                {appointment.duration_minutes} min
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Button size="sm">
                          <Video className="w-4 h-4 mr-2" />
                          Entrar
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Nenhuma consulta agendada
                    </p>
                    {user.user_type === 'patient' && (
                      <Button className="mt-4">
                        <a href="/search">Agendar Consulta</a>
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Meu Perfil</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground font-semibold">
                      {user.full_name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{user.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {user.user_type === 'patient' ? 'Paciente' : 'Profissional'}
                    </p>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  <a href="/profile">Editar Perfil</a>
                </Button>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5" />
                  <span>Dica do Dia</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Pratique a respiração profunda por 5 minutos hoje. Isso pode ajudar a reduzir o estresse e melhorar seu bem-estar mental.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Mais Dicas
                </Button>
              </CardContent>
            </Card>

            {/* Support Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5" />
                  <span>Precisa de Ajuda?</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Nossa equipe de suporte está disponível 24/7 para ajudar você.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Falar com Suporte
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

