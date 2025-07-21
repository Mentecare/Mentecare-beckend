from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.user import db, User, Professional

users_bp = Blueprint('users', __name__)

@users_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Obter perfil do usuário logado"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'message': 'Usuário não encontrado'
            }), 404
        
        include_professional = user.user_type == 'professional'
        
        return jsonify({
            'success': True,
            'message': 'Perfil obtido com sucesso',
            'data': {
                'user': user.to_dict(include_professional=include_professional)
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Erro interno do servidor',
            'error': str(e)
        }), 500

@users_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Atualizar perfil do usuário"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'message': 'Usuário não encontrado'
            }), 404
        
        data = request.get_json()
        
        # Atualizar campos permitidos
        if 'full_name' in data:
            user.full_name = data['full_name']
        if 'phone' in data:
            user.phone = data['phone']
        if 'date_of_birth' in data:
            user.date_of_birth = data['date_of_birth']
        if 'gender' in data:
            user.gender = data['gender']
        
        db.session.commit()
        
        include_professional = user.user_type == 'professional'
        
        return jsonify({
            'success': True,
            'message': 'Perfil atualizado com sucesso',
            'data': {
                'user': user.to_dict(include_professional=include_professional)
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': 'Erro interno do servidor',
            'error': str(e)
        }), 500

@users_bp.route('/change-password', methods=['PUT'])
@jwt_required()
def change_password():
    """Alterar senha do usuário"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'message': 'Usuário não encontrado'
            }), 404
        
        data = request.get_json()
        
        if not data.get('current_password') or not data.get('new_password'):
            return jsonify({
                'success': False,
                'message': 'Senha atual e nova senha são obrigatórias'
            }), 400
        
        # Verificar senha atual
        if not user.check_password(data['current_password']):
            return jsonify({
                'success': False,
                'message': 'Senha atual incorreta'
            }), 400
        
        # Atualizar senha
        user.set_password(data['new_password'])
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Senha alterada com sucesso'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': 'Erro interno do servidor',
            'error': str(e)
        }), 500

@users_bp.route('/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user_by_id(user_id):
    """Obter usuário por ID (apenas para o próprio usuário)"""
    try:
        requesting_user_id = get_jwt_identity()
        
        # Verificar se o usuário pode acessar estes dados
        if user_id != requesting_user_id:
            return jsonify({
                'success': False,
                'message': 'Acesso negado'
            }), 403
        
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'message': 'Usuário não encontrado'
            }), 404
        
        include_professional = user.user_type == 'professional'
        
        return jsonify({
            'success': True,
            'message': 'Usuário encontrado com sucesso',
            'data': {
                'user': user.to_dict(include_professional=include_professional)
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Erro interno do servidor',
            'error': str(e)
        }), 500

