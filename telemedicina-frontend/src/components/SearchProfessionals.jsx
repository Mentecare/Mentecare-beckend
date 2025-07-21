import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import api from '../lib/api.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Star, 
  MapPin, 
  Clock, 
  DollarSign,
  Video,
  Calendar,
  User,
  Stethoscope,
  Heart
} from 'lucide-react';

export default function SearchProfessionals() {
  const { user } = useAuth();
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const specialties = [
    'Psicologia Clínica',
    'Psiquiatria',
    'Terapia de Casal',
    'Psicologia Infantil',
    'Neuropsicologia',
    'Terapia Cognitivo-Comportamental'
  ];

  const priceRanges = [
    { label: 'Até R$ 100', value: '0-100' },
    { label: 'R$ 100 - R$ 200', value: '100-200' },
    { label: 'R$ 200 - R$ 300', value: '200-300' },
    { label: 'Acima de R$ 300', value: '300+' }
  ];

  useEffect(() => {
    searchProfessionals();
  }, [selectedSpecialty, priceRange]);

  const searchProfessionals = async () => {
    try {
      setLoading(true);
      const filters = {};
      
      if (searchTerm) filters.search = searchTerm;
      if (selectedSpecialty) filters.specialty = selectedSpecialty;
      if (priceRange) {
        const [min, max] = priceRange.split('-');
        filters.min_price = min;
        if (max !== '+') filters.max_price = max;
      }

      const response = await api.searchProfessionals(filters);
      setProfessionals(response.data?.professionals || []);
    } catch (error) {
      console.error('Erro ao buscar profissionais:', error);
      setProfessionals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchProfessionals();
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Encontre seu Profissional
          </h1>
          <p className="text-muted-foreground">
            Conecte-se com psicólogos e psiquiatras qualificados
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Buscar por nome, especialidade..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button type="submit" className="md:w-auto">
                  <Search className="w-4 h-4 mr-2" />
                  Buscar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="md:w-auto"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                </Button>
              </div>

              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Especialidade
                    </label>
                    <select
                      value={selectedSpecialty}
                      onChange={(e) => setSelectedSpecialty(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    >
                      <option value="">Todas as especialidades</option>
                      {specialties.map((specialty) => (
                        <option key={specialty} value={specialty}>
                          {specialty}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Faixa de Preço
                    </label>
                    <select
                      value={priceRange}
                      onChange={(e) => setPriceRange(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    >
                      <option value="">Qualquer preço</option>
                      {priceRanges.map((range) => (
                        <option key={range.value} value={range.value}>
                          {range.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-muted rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                    <div className="h-20 bg-muted rounded"></div>
                    <div className="h-10 bg-muted rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : professionals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {professionals.map((professional) => (
              <Card key={professional.id} className="professional-card hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Professional Info */}
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {professional.user?.full_name}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {professional.specialty}
                        </p>
                        <div className="flex items-center space-x-1 mt-1">
                          {renderStars(professional.average_rating || 4.5)}
                          <span className="text-sm text-muted-foreground ml-2">
                            ({professional.total_reviews || 0} avaliações)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Professional Details */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Stethoscope className="w-4 h-4" />
                        <span>CRP: {professional.license_number}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <DollarSign className="w-4 h-4" />
                        <span>A partir de {formatPrice(professional.consultation_price)}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>Disponível hoje</span>
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {professional.bio || 'Profissional especializado em saúde mental com experiência em atendimento online.'}
                    </p>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">
                        <Video className="w-3 h-3 mr-1" />
                        Online
                      </Badge>
                      {professional.accepts_insurance && (
                        <Badge variant="outline">
                          <Heart className="w-3 h-3 mr-1" />
                          Convênio
                        </Badge>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2 pt-2">
                      <Button className="flex-1" size="sm">
                        <Calendar className="w-4 h-4 mr-2" />
                        Agendar
                      </Button>
                      <Button variant="outline" size="sm">
                        Ver Perfil
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Nenhum profissional encontrado
              </h3>
              <p className="text-muted-foreground mb-4">
                Tente ajustar os filtros ou termos de busca
              </p>
              <Button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedSpecialty('');
                  setPriceRange('');
                  searchProfessionals();
                }}
              >
                Limpar Filtros
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

