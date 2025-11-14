import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './login.css';


const API_BASE_URL = import.meta.env.VITE_API_URL

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (!email || !password) {
            setError('Por favor, preencha todos os campos.');
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/Auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
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
                <div className="login-form-container">
                    <form onSubmit={handleSubmit} noValidate>
                        <h2 className="form-title">Acessar a plataforma</h2>

                        <div className="login-inputa">
                            <label htmlFor="email">E-MAIL</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                className='login-input'
                            />
                        </div>

                        <div className="login-inputa">
                            <label htmlFor="password">SENHA</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                className='login-input'
                            />
                            <a href="#" className="forgot-password">Esqueci minha senha</a>
                        </div>

                        {error && <p className="error-message">{error}</p>}

                        <button type="submit" disabled={isLoading} className="login-button">
                            {isLoading ? 'ENTRANDO...' : 'ENTRAR'}
                        </button>

                        <p className="login-link">
                            Não tem uma conta? <Link to="/cadastro">Clique aqui!</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}

