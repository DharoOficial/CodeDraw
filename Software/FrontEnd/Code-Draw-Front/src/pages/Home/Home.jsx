import Header from "../../Componets/Header/Header";
import './Home.css'
import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Home() {

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    const token = localStorage.getItem('authToken');

    useEffect(() => {
        if (token === null) {
            navigate("/login");
            return;
        }
        fetchTasks();
    }, [token, navigate]);
    async function handleUpdate() {
        setLoading(true);
        await fetchTasks();
        setLoading(false);
    }

    const fetchTasks = async () => {
        try {
            setError(null);

            if (!token) {
                setError('Token de autenticação não encontrado. Faça login novamente.');
                return;
            }

            const API_BASE_URL = import.meta.env.VITE_API_URL

            const response = await fetch(`${API_BASE_URL}/Tasks`, {
                method: 'GET',
                headers: {
                    'accept': 'text/plain',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Não autorizado. Token inválido ou expirado.');
                }
                throw new Error(`Erro ao carregar tarefas: ${response.status}`);
            }

            const data = await response.json();
            setTasks(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };


    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
                    <div className="flex items-center gap-3 text-red-600 mb-4">
                        <AlertCircle className="w-6 h-6" />
                        <h2 className="text-xl font-semibold">Erro</h2>
                    </div>
                    <p className="text-gray-700 mb-4">{error}</p>
                    <button
                        onClick={fetchTasks}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Tentar Novamente
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ width: '100%', height: '100vh', display: 'flex' }}>
            <Header />
            <div className="HomeTarefas">
                <div className="min-h-screen bg-gray-50 p-4">
                    <div className="HomeMiniHeader">
                        <h1 style={{ fontSize: '3em' }}> <span className="json-class">Minhas</span> <span className="json-boolean">Tarefas</span> <span className="json-string">:</span></h1>
                        <button
                            onClick={handleUpdate}
                            className={`HomeAtualizarTask ${loading ? "loading" : ""}`}
                        >
                            {loading ? "Carregando..." : "Atualizar"}
                        </button>
                    </div>

                    {tasks.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">Nenhuma tarefa encontrada</p>
                        </div>
                    ) : (
                        <div className="HomeTaskSection">
                            {tasks.map((task) => (
                                <div
                                    key={task.id}
                                    className="HomeCardTask"
                                >
                                    <div className="HomeTarefaTite">
                                        <h2 className="json-boolean">
                                            {task.title}
                                        </h2>
                                        <span className="json-class">
                                            ID: {task.id.slice(0, 10)}...
                                        </span>
                                    </div>

                                    <p className="json-string">
                                        {task.description}
                                    </p>
                                    <div className="HomeSepararBotao">

                                        <div>
                                            {task.teacherName && (
                                                <div className="flex items-center gap-2">
                                                    <span className="json-class">Professor: </span>
                                                    <span className="json-key">{task.teacherName}</span>
                                                </div>
                                            )}
                                        </div>
                                        <button className="HomeBotaoProg"><Link className="HomeTextBotaoProg" to='/Code'>Programar</Link></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <p className="HomeNumeroTarefas">
                    Total de tarefas: {tasks.length}
                </p>

            </div>
        </div>
    )
}