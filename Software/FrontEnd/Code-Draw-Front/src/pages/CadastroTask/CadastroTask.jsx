import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './CadastroTask.css';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function CadastroTask() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: ''
    });
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const token = localStorage.getItem('authToken');    
    const decodedToken = jwtDecode(token);
    const [user, setUser] = useState(decodedToken)
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        if (!formData.title || !formData.description) {
            setError('Por favor, preencha todos os campos obrigatórios.');
            return false;
        }

        if (formData.title.length > 150) {
            setError('O título deve ter no máximo 150 caracteres.');
            return false;
        }

        if (formData.description.trim().length < 10) {
            setError('A descrição deve ter no mínimo 10 caracteres.');
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

            if (!token || !user) {
                throw new Error('Usuário não autenticado. Faça login novamente.');
            }

            const response = await fetch(`${API_BASE_URL}/Tasks`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description,
                    teacherId: user.nameid
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha ao criar tarefa. Tente novamente.');
            }

            const data = await response.json();
            
            // Redireciona para a lista de tarefas após criação bem-sucedida
            navigate('/', { 
                state: { message: 'Tarefa criada com sucesso!' }
            });

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/');
    };

    return (
        <div className="criar-tarefa-page">
            <div className="criar-tarefa-container">
                <div className="criar-tarefa-header">
                    <h1>Criar Nova Tarefa</h1>
                    <p>Preencha os campos abaixo para criar uma nova tarefa para seus alunos</p>
                </div>

                <form onSubmit={handleSubmit} noValidate className="criar-tarefa-form">
                    <div className="form-group">
                        <label htmlFor="title">
                            Título da Tarefa *
                            <span className="char-count">{formData.title.length}/150</span>
                        </label>
                        <input
                            id="title"
                            name="title"
                            type="text"
                            value={formData.title}
                            onChange={handleChange}
                            maxLength={150}
                            placeholder="Ex: Algoritmo de ordenação"
                            required
                            className='form-input'
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Descrição da Tarefa *</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Descreva detalhadamente a tarefa, incluindo objetivos, requisitos e critérios de avaliação..."
                            rows={8}
                            required
                            className='form-textarea'
                        />
                        <small className="helper-text">
                            Seja claro e detalhado para que os alunos entendam o que precisa ser feito.
                        </small>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <div className="form-actions">
                        <button 
                            type="button" 
                            onClick={handleCancel}
                            className="btn-cancel"
                            disabled={isLoading}
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            disabled={isLoading} 
                            className="btn-submit"
                        >
                            {isLoading ? 'Criando...' : 'Criar Tarefa'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}