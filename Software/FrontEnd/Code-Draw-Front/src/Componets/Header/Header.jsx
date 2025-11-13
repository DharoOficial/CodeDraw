import { jwtDecode } from 'jwt-decode';
import './Header.css'
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Header() {

    const token = localStorage.getItem('authToken');
    const decodedToken = jwtDecode(token);
    const [user, setUser] = useState(decodedToken)
    console.log(decodedToken)

    return (
        <div className="header-container-side">
            <h1>Code<span style={{color: '#E79F07'}}>Draw</span></h1>
            {user ? (
                <div className='Header-logado'>
                    <p className='NomeHeader'>Bem vindo, <b>{user.unique_name}</b></p>
                    {/* Painel Administrativo */}
                    <div className='HeaderGenerate'>

                        {user.role === "Admin" ?
                            (<>
                                <h2>Portal administrativo:</h2><b>
                                    <Link to="/create-task" className='linkHeaderH'>Criar Tarefa</Link>
                                    <Link to="/ManagerUsers" className='linkHeaderH'>Gerenciar Usuários</Link>
                                </b>
                            </>)
                            // Painel Professor
                            : user.role === 'Professor' || user.role === "Admin" ?
                                (<>
                                    <b>
                                        <h2>Portal do Professor:</h2>
                                        <Link to="/create-task" className='linkHeaderH'>Criar Tarefa</Link>
                                    </b>
                                </>) :
                                // Painel Usuario
                                (<>
                                    <b>
                                        <Link to="/create-task" className='linkHeaderH'></Link>
                                    </b>
                                </>)
                        }
                    </div>
                </div>
            ) :
                (
                    <div className='Header-deslogado'>

                    </div>
                )
            }
        </div>
    )
}