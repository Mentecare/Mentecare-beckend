from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.user import db, User, Professional
from sqlalchemy import and_, or_

professionals_bp = Blueprint('professionals', __name__)

@professionals_bp.route('/search', methods=['GET'])
def search_professionals():
    """Buscar profissionais com filtros"""
    try:
        # Parâmetros de busca
        specialty = request.args.get('specialty')
        min_price = request.args.get('min_price', type=float)
        max_price = request.args.get('max_price', type=float)
        rating = request.args.get('rating', type=float)
        experience_years = request.args.get('experience_years', type=int)
        approach = request.args.get('approach')
        language = request.args.get('language')
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 10, type=int)
        
        # Construir query base
        query = Professional.query.filter(
            Professional.is_available == True,
            Professional.is_verified == True
        )
        
        # Aplicar filtros
        if specialty:
            query = query.filter(Professional.specialty.like(f'%{specialty}%'))
        
        if min_price is not None:
            query = query.filter(Professional.consultation_price >= min_price)
        
        if max_price is not None:
            query = query.filter(Professional.consultation_price <= max_price)
        
        if rating is not None:
            query = query.filter(Professional.rating >= rating)
        
        if experience_years is not None:
            query = query.filter(Professional.experience_years >= experience_years)
        
        if approach:
            query = query.filter(Professional.approach.like(f'%{approach}%'))
        
        if language:
            query = query.filter(Professional.languages.like(f'%{language}%'))
        
        # Ordenar por rating e total de reviews
        query = query.order_by(Professional.rating.desc(), Professional.total_reviews.desc())
        
        # Paginação
        offset = (page - 1) * limit
        total = query.count()
        professionals = query.offset(offset).limit(limit).all()
        
        # Incluir dados do usuário
        professionals_data = []
        for prof in professionals:
            prof_data = prof.to_dict()
            prof_data['user'] = {
                'id': prof.user.id,
                'full_name': prof.user.full_name,
                'email': prof.user.email,
                'phone': prof.user.phone
            }
            professionals_data.append(prof_data)
        
        # Calcular informações de paginação
        total_pages = (total + limit - 1) // limit
        has_next_page = page < total_pages
        has_prev_page = page > 1
        
        return jsonify({
            'success': True,
            'message': 'Profissionais encontrados com sucesso',
            'data': {
                'professionals': professionals_data,
                'pagination': {
                    'current_page': page,
                    'total_pages': total_pages,
                    'total_items': total,
                    'items_per_page': limit,
                    'has_next_page': has_next_page,
                    'has_prev_page': has_prev_page
                }
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Erro interno do servidor',
            'error': str(e)
        }), 500

@professionals_bp.route('/specialties', methods=['GET'])
def get_specialties():
    """Listar todas as especialidades disponíveis"""
    try:
        specialties = db.session.query(Professional.specialty).filter(
            Professional.is_available == True,
            Professional.is_verified == True,
            Professional.specialty != '',
            Professional.specialty.isnot(None)
        ).distinct().all()
        
        specialty_list = [s[0] for s in specialties if s[0] and s[0].strip()]
        specialty_list.sort()
        
        return jsonify({
            'success': True,
            'message': 'Especialidades encontradas com sucesso',
            'data': {
                'specialties': specialty_list
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Erro interno do servidor',
            'error': str(e)
        }), 500

@professionals_bp.route('/<int:professional_id>', methods=['GET'])
def get_professional_by_id(professional_id):
    """Obter detalhes de um profissional específico"""
    try:
        professional = Professional.query.get(professional_id)
        
        if not professional:
            return jsonify({
                'success': False,
                'message': 'Profissional não encontrado'
            }), 404
        
        prof_data = professional.to_dict()
        prof_data['user'] = {
            'id': professional.user.id,
            'full_name': professional.user.full_name,
            'email': professional.user.email,
            'phone': professional.user.phone
        }
        
        return jsonify({
            'success': True,
            'message': 'Profissional encontrado com sucesso',
            'data': {
                'professional': prof_data
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Erro interno do servidor',
            'error': str(e)
        }), 500

@professionals_bp.route('/user/<int:user_id>', methods=['GET'])
@jwt_required()
def get_professional_by_user_id(user_id):
    """Obter profissional pelo user_id (para profissionais logados)"""
    try:
        requesting_user_id = get_jwt_identity()
        
        # Verificar se o usuário pode acessar estes dados
        if user_id != requesting_user_id:
            return jsonify({
                'success': False,
                'message': 'Acesso negado'
            }), 403
        
        professional = Professional.query.filter_by(user_id=user_id).first()
        
        if not professional:
            return jsonify({
                'success': False,
                'message': 'Profissional não encontrado'
            }), 404
        
        prof_data = professional.to_dict()
        prof_data['user'] = {
            'id': professional.user.id,
            'full_name': professional.user.full_name,
            'email': professional.user.email,
            'phone': professional.user.phone,
            'user_type': professional.user.user_type
        }
        
        return jsonify({
            'success': True,
            'message': 'Profissional encontrado com sucesso',
            'data': {
                'professional': prof_data
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Erro interno do servidor',
            'error': str(e)
        }), 500

@professionals_bp.route('/user/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_professional(user_id):
    """Atualizar perfil do profissional"""
    try:
        requesting_user_id = get_jwt_identity()
        
        # Verificar se o usuário pode atualizar estes dados
        if user_id != requesting_user_id:
            return jsonify({
                'success': False,
                'message': 'Acesso negado'
            }), 403
        
        # Verificar se o usuário é um profissional
        user = User.query.get(user_id)
        if not user or user.user_type != 'professional':
            return jsonify({
                'success': False,
                'message': 'Apenas profissionais podem atualizar este perfil'
            }), 403
        
        professional = Professional.query.filter_by(user_id=user_id).first()
        
        if not professional:
            return jsonify({
                'success': False,
                'message': 'Profissional não encontrado'
            }), 404
        
        data = request.get_json()
        
        # Atualizar dados
        if 'specialty' in data:
            professional.specialty = data['specialty']
        if 'bio' in data:
            professional.bio = data['bio']
        if 'experience_years' in data:
            professional.experience_years = data['experience_years']
        if 'consultation_price' in data:
            professional.consultation_price = data['consultation_price']
        if 'approach' in data:
            professional.approach = data['approach']
        if 'languages' in data:
            professional.languages = data['languages']
        if 'is_available' in data:
            professional.is_available = data['is_available']
        
        db.session.commit()
        
        # Buscar profissional atualizado
        prof_data = professional.to_dict()
        prof_data['user'] = {
            'id': professional.user.id,
            'full_name': professional.user.full_name,
            'email': professional.user.email,
            'phone': professional.user.phone
        }
        
        return jsonify({
            'success': True,
            'message': 'Perfil profissional atualizado com sucesso',
            'data': {
                'professional': prof_data
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': 'Erro interno do servidor',
            'error': str(e)
        }), 500

