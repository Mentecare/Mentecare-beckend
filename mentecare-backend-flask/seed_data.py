#!/usr/bin/env python3
"""
Script para popular o banco de dados com dados de teste
"""
import os
import sys
sys.path.insert(0, os.path.dirname(__file__))

from src.main import app
from src.models.user import db, User, Professional

def seed_database():
    """Popular banco com dados de teste"""
    with app.app_context():
        # Limpar dados existentes
        db.drop_all()
        db.create_all()
        
        print("🌱 Populando banco de dados com dados de teste...")
        
        # Criar pacientes de teste
        patients = [
            {
                'email': 'amanda.silva@email.com',
                'password': '123456',
                'full_name': 'Amanda Silva',
                'phone': '(11) 99999-1111',
                'cpf': '123.456.789-01',
                'user_type': 'patient',
                'gender': 'Feminino'
            },
            {
                'email': 'carlos.santos@email.com',
                'password': '123456',
                'full_name': 'Carlos Santos',
                'phone': '(11) 99999-2222',
                'cpf': '234.567.890-12',
                'user_type': 'patient',
                'gender': 'Masculino'
            },
            {
                'email': 'maria.oliveira@email.com',
                'password': '123456',
                'full_name': 'Maria Oliveira',
                'phone': '(11) 99999-3333',
                'cpf': '345.678.901-23',
                'user_type': 'patient',
                'gender': 'Feminino'
            }
        ]
        
        for patient_data in patients:
            patient = User(**{k: v for k, v in patient_data.items() if k != 'password'})
            patient.set_password(patient_data['password'])
            db.session.add(patient)
        
        # Criar profissionais de teste
        professionals_data = [
            {
                'user': {
                    'email': 'dr.ana.costa@email.com',
                    'password': '123456',
                    'full_name': 'Dra. Ana Costa',
                    'phone': '(11) 98888-1111',
                    'cpf': '456.789.012-34',
                    'user_type': 'professional',
                    'gender': 'Feminino'
                },
                'professional': {
                    'crp_crm': 'CRP 06/123456',
                    'specialty': 'Psicologia Clínica',
                    'bio': 'Psicóloga clínica com mais de 10 anos de experiência em terapia cognitivo-comportamental.',
                    'experience_years': 10,
                    'consultation_price': 120.0,
                    'approach': 'Terapia Cognitivo-Comportamental',
                    'languages': 'Português, Inglês',
                    'is_verified': True,
                    'rating': 4.8,
                    'total_reviews': 45,
                    'is_available': True
                }
            },
            {
                'user': {
                    'email': 'dr.roberto.silva@email.com',
                    'password': '123456',
                    'full_name': 'Dr. Roberto Silva',
                    'phone': '(11) 98888-2222',
                    'cpf': '567.890.123-45',
                    'user_type': 'professional',
                    'gender': 'Masculino'
                },
                'professional': {
                    'crp_crm': 'CRM 123456',
                    'specialty': 'Psiquiatria',
                    'bio': 'Médico psiquiatra especializado em transtornos de ansiedade e depressão.',
                    'experience_years': 15,
                    'consultation_price': 200.0,
                    'approach': 'Psicofarmacologia e Psicoterapia',
                    'languages': 'Português, Espanhol',
                    'is_verified': True,
                    'rating': 4.9,
                    'total_reviews': 78,
                    'is_available': True
                }
            },
            {
                'user': {
                    'email': 'dra.maria.oliveira@email.com',
                    'password': '123456',
                    'full_name': 'Dra. Maria Oliveira',
                    'phone': '(11) 98888-3333',
                    'cpf': '678.901.234-56',
                    'user_type': 'professional',
                    'gender': 'Feminino'
                },
                'professional': {
                    'crp_crm': 'CRP 06/789012',
                    'specialty': 'Psicologia Infantil',
                    'bio': 'Especialista em psicologia infantil e adolescente, com foco em desenvolvimento emocional.',
                    'experience_years': 8,
                    'consultation_price': 100.0,
                    'approach': 'Ludoterapia e Terapia Familiar',
                    'languages': 'Português',
                    'is_verified': True,
                    'rating': 4.7,
                    'total_reviews': 32,
                    'is_available': True
                }
            },
            {
                'user': {
                    'email': 'dr.pedro.almeida@email.com',
                    'password': '123456',
                    'full_name': 'Dr. Pedro Almeida',
                    'phone': '(11) 98888-4444',
                    'cpf': '789.012.345-67',
                    'user_type': 'professional',
                    'gender': 'Masculino'
                },
                'professional': {
                    'crp_crm': 'CRP 06/345678',
                    'specialty': 'Psicologia Organizacional',
                    'bio': 'Psicólogo organizacional com experiência em coaching e desenvolvimento de liderança.',
                    'experience_years': 12,
                    'consultation_price': 150.0,
                    'approach': 'Coaching e Desenvolvimento Pessoal',
                    'languages': 'Português, Inglês, Francês',
                    'is_verified': True,
                    'rating': 4.6,
                    'total_reviews': 28,
                    'is_available': True
                }
            }
        ]
        
        for prof_data in professionals_data:
            # Criar usuário profissional
            user = User(**{k: v for k, v in prof_data['user'].items() if k != 'password'})
            user.set_password(prof_data['user']['password'])
            db.session.add(user)
            db.session.flush()  # Para obter o ID do usuário
            
            # Criar perfil profissional
            professional = Professional(
                user_id=user.id,
                **prof_data['professional']
            )
            db.session.add(professional)
        
        # Salvar todas as mudanças
        db.session.commit()
        
        print("✅ Banco de dados populado com sucesso!")
        print(f"📊 Criados: {len(patients)} pacientes e {len(professionals_data)} profissionais")
        print("\n🔑 Credenciais de teste:")
        print("Pacientes:")
        for patient in patients:
            print(f"  - {patient['email']} / {patient['password']}")
        print("\nProfissionais:")
        for prof in professionals_data:
            print(f"  - {prof['user']['email']} / {prof['user']['password']}")

if __name__ == '__main__':
    seed_database()

