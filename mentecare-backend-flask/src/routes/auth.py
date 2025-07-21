from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from src.models.user import db, User, Professional
import re

auth_bp = Blueprint('auth', __name__)

def validate_email(email):
    """Valida formato do email"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_cpf(cpf):
    """Valida formato do CPF"""
    pattern = r'^\d{3}\.\d{3}\.\d{3}-\d{2}$'
    return re.match(pattern, cpf) is not None

def validate_phone(phone):
    """Valida formato do telefone"""
    pattern = r'^\(\d{2}\)\s\d{4,5}-\d{4}$'
    return re.match(pattern, phone) is not None

@auth_bp.route('/register', methods=['POST'])
def register():
    """Registrar novo usuário"""
    try:
        data = request.get_json()
        
        # Validações obrigatórias
        required_fields = ['email', 'password', 'full_name', 'cpf', 'user_type']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'success': False,
                    'message': f'Campo {field} é obrigatório'
                }), 400
        
        # Validar formato do email
        if not validate_email(data['email']):
            return jsonify({
                'success': False,
                'message': 'Formato de email inválido'
            }), 400
        
        # Validar formato do CPF
        if not validate_cpf(data['cpf']):
            return jsonify({
                'success': False,
                'message': 'Formato de CPF inválido'
            }), 400
        
        # Validar telefone se fornecido
        if data.get('phone') and not validate_phone(data['phone']):
            return jsonify({
                'success': False,
                'message': 'Formato de telefone inválido'
            }), 400
        
        # Verificar se email já existe
        if User.query.filter_by(email=data['email']).first():
            return jsonify({
                'success': False,
                'message': 'Email já está em uso'
            }), 400
        
        # Verificar se CPF já existe
        if User.query.filter_by(cpf=data['cpf']).first():
            return jsonify({
                'success': False,
                'message': 'CPF já está em uso'
            }), 400
        
        # Criar novo usuário
        user = User(
            email=data['email'],
            full_name=data['full_name'],
            phone=data.get('phone'),
            cpf=data['cpf'],
            user_type=data['user_type'],
            date_of_birth=data.get('date_of_birth'),
            gender=data.get('gender')
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        # Gerar token JWT
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'success': True,
            'message': 'Usuário registrado com sucesso',
            'data': {
                'user': user.to_dict(),
                'token': access_token
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': 'Erro interno do servidor',
            'error': str(e)
        }), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login de usuário"""
    try:
        data = request.get_json()
        
        if not data.get('email') or not data.get('password'):
            return jsonify({
                'success': False,
                'message': 'Email e senha são obrigatórios'
            }), 400
        
        # Buscar usuário
        user = User.query.filter_by(email=data['email']).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({
                'success': False,
                'message': 'Credenciais inválidas'
            }), 401
        
        # Gerar token JWT
        access_token = create_access_token(identity=user.id)
        
        # Incluir dados do profissional se for profissional
        include_professional = user.user_type == 'professional'
        
        return jsonify({
            'success': True,
            'message': 'Login realizado com sucesso',
            'data': {
                'user': user.to_dict(include_professional=include_professional),
                'token': access_token
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Erro interno do servidor',
            'error': str(e)
        }), 500

@auth_bp.route('/verify', methods=['GET'])
@jwt_required()
def verify_token():
    """Verificar token JWT"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'message': 'Usuário não encontrado'
            }), 404
        
        return jsonify({
            'success': True,
            'message': 'Token válido',
            'data': {
                'user': user.to_dict()
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Token inválido',
            'error': str(e)
        }), 401

