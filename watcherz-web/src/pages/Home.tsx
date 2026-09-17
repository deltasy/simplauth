import { logout, restoreSession } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { getUserData } from "../services/userService";
import type { User } from "../services/userService";


export default function Home() {
    const navigate = useNavigate();

    const [isCheckingSession, setIsCheckingSession] = useState(true);
    const [thisUser, setThisUser] = useState<User>()

    useEffect(() => {
        
        restoreSession().then(() => {
            getUserData().then(data => {
                setThisUser(data);
            })
            

        }).catch(err => {
            console.log(err);
            navigate('/') // Voltar para área inicial

        }).finally(() => {
            setIsCheckingSession(false);
        })



    }, []);

    async function handleLogout(){
        try{
            await logout();
            navigate('/')

        }catch(error){
            console.log(error)
        }
    }

    if(!thisUser) return;

    return (
        <div className="p-5">
            <button onClick={handleLogout} className="bg-cyan-500 mb-10 w-25 font-bold px-4 py-2 rounded cursor-pointer">Deslogar</button>

            <div className="bg-black text-white p-10">
                <h1 className="text-xl font-bold mb-6">Dados:</h1>

                <ul className="flex flex-col gap-3">
                    <li>
                        <b>Nome de usuário:</b>
                        <br/>{thisUser.username ? thisUser.username : "(Nenhum)"}
                    </li>
                    <li>
                        <b>E-mail</b>:
                        <br/>{thisUser.email}
                    </li>
                    <li>
                        <b>Permissão</b>:
                        <br/>{thisUser.permission}
                    </li>
                </ul>
            </div>
        </div>
    );
}