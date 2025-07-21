from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20))
    date_of_birth = db.Column(db.Date)
    gender = db.Column(db.String(20))
    cpf = db.Column(db.String(14), unique=True, nullable=False, index=True)
    user_type = db.Column(db.String(20), nullable=False, default='patient')  # 'patient' ou 'professional'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamento com Professional
    professional = db.relationship('Professional', backref='user', uselist=False, cascade='all, delete-orphan')
    
    def set_password(self, password):
        """Define a senha do usuário com hash"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Verifica se a senha está correta"""
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self, include_professional=False):
        """Converte o usuário para dicionário"""
        data = {
            'id': self.id,
            'email': self.email,
            'full_name': self.full_name,
            'phone': self.phone,
            'date_of_birth': self.date_of_birth.isoformat() if self.date_of_birth else None,
            'gender': self.gender,
            'cpf': self.cpf,
            'user_type': self.user_type,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
        
        if include_professional and self.professional:
            data['professional'] = self.professional.to_dict()
            
        return data

class Professional(db.Model):
    __tablename__ = 'professionals'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    crp_crm = db.Column(db.String(20), nullable=False)
    specialty = db.Column(db.String(100), nullable=False)
    bio = db.Column(db.Text)
    experience_years = db.Column(db.Integer, default=0)
    consultation_price = db.Column(db.Float, nullable=False)
    approach = db.Column(db.String(200))
    languages = db.Column(db.String(100), default='Português')
    is_verified = db.Column(db.Boolean, default=False)
    rating = db.Column(db.Float, default=0.0)
    total_reviews = db.Column(db.Integer, default=0)
    is_available = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self, include_user=False):
        """Converte o profissional para dicionário"""
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'crp_crm': self.crp_crm,
            'specialty': self.specialty,
            'bio': self.bio,
            'experience_years': self.experience_years,
            'consultation_price': self.consultation_price,
            'approach': self.approach,
            'languages': self.languages,
            'is_verified': self.is_verified,
            'rating': self.rating,
            'total_reviews': self.total_reviews,
            'is_available': self.is_available,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
        
        if include_user and self.user:
            data['user'] = {
                'id': self.user.id,
                'full_name': self.user.full_name,
                'email': self.user.email,
                'phone': self.user.phone
            }
            
        return data

