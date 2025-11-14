import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './cadastro.css'

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function Cadastro() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'turma' ? parseInt(value) || 0 : value
        }));
    };

    const validateForm = () => {
        if (!formData.name || !formData.email || !formData.password) {
            setError('Por favor, preencha todos os campos obrigatórios.');
            return false;
        }

        if (formData.name.length > 150) {
            setError('O nome deve ter no máximo 150 caracteres.');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Email em formato inválido.');
            return false;
        }

        if (formData.password.length < 6) {
            setError('A senha deve ter no mínimo 6 caracteres.');
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('As senhas não coincidem.');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/Users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha no cadastro. Tente novamente.');
            }

            const data = await response.json();

            try {
                const response = await fetch(`${API_BASE_URL}/Auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email : formData.email, password: formData.password })
                });
                if (!response.ok) {
                    throw new Error('Falha no login. Verifique suas credenciais.');
                }
                const data = await response.json();

                // Salva o token e os dados do usuário no localStorage
                localStorage.setItem('authToken', data.token);

                // Navega para a página principal da aplicação
                navigate('/');
            } catch (err) {
                setError(err.message);
                console.log(error)
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-panel-left">
                <div className="art-container">
                    <h1 className="logo-text">Code<span>Draw</span></h1>
                    <p>Desperte a criatividade através do código.</p>
                </div>
            </div>
            <div className="login-panel-right">
                <div className="login-form-container CadastroForm">
                    <form onSubmit={handleSubmit} noValidate >
                        <h2 className="form-title">Criar nova conta</h2>

                        <div className="login-inputa">
                            <label htmlFor="name">NOME COMPLETO *</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleChange}
                                maxLength={150}
                                required
                                className='login-input'
                            />
                        </div>

                        <div className="login-inputa">
                            <label htmlFor="email">E-MAIL *</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className='login-input'
                            />
                        </div>

                        <div className="login-inputa">
                            <label htmlFor="password">SENHA *</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className='login-input'
                            />
                        </div>

                        <div className="login-inputa">
                            <label htmlFor="confirmPassword">CONFIRMAR SENHA *</label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                className='login-input'
                            />
                        </div>
                        {error && <p className="error-message">{error}</p>}

                        <button type="submit" disabled={isLoading} className="login-button">
                            {isLoading ? 'CADASTRANDO...' : 'CADASTRAR'}
                        </button>

                        <p className="login-link">
                            Já tem uma conta? <Link to="/login">Faça login aqui!</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}