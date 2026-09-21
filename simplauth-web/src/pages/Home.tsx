import { logout, restoreSession } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { checkField, editField, getUserData } from "../services/userService";
import type { User } from "../services/userService";

import ReactiveInput from "../components/ReactiveInput";
import { getToken } from "../services/setupInterceptors";

export default function Home() {
    const navigate = useNavigate();

    const [thisUser, setThisUser] = useState<User>()

    const [username, setUsername] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);
    const [validEmail, setValidEmail] = useState(false);
    const [validUsername, setValidUsername] = useState(false);
    const [emailChanged, setEmailChanged] = useState(false);
    const [usernameChanged, setUsernameChanged] = useState(false);

    useEffect(() => {
        restoreSession().then(() => {
            getUserData().then(userData => {
                setThisUser(userData);
                setEmail(userData.email);
                if(userData.username) setUsername(userData.username);
            })  

        }).catch(err => {
            console.log(err);
            navigate('/') // Voltar para área inicial

        });
    }, []);

    async function handleLogout(){
        try{
            await logout();
            navigate('/');

        }catch(err){
            console.log(err);
        }
    }

    async function handleUsernameChange(newUsername: string){
        if(usernameChanged) setUsernameChanged(false);

        if(thisUser && thisUser.username != newUsername){
            try{
                await checkField("username", newUsername);
                setValidUsername(true);

            }catch(error){
                setValidUsername(false);
            }
            
        }else{ // Sem alteração
            setValidUsername(false);
        }
        setUsername(newUsername);
    }

    async function handleEmailChange(newEmail: string){
        if(emailChanged) setEmailChanged(false);
    
        if(thisUser && thisUser.email != newEmail){
            try{
                await checkField("email", newEmail);
                setValidEmail(true);

            }catch(error){ // Já existente
                setValidEmail(false);
            }
        }else{ // Sem alterações
            setValidEmail(false);
        }

        setEmail(newEmail);
    }

    async function handleEditApply(field: string, value: string){
        try{
            await editField(field, value);
            switch(field){
                case "email":
                    setEmail(value); setEmailChanged(true);
                    setThisUser(prev => prev ? {...prev, email: value}: prev);
                    return;
                
                case "username":
                    setUsername(value); setUsernameChanged(true);
                    setThisUser(prev => prev ? {...prev, username: value}: prev);
                    return;
            }

        }catch(err){
            console.log(err);
        }
    }

    if(!thisUser) return;

    return (
        <>
            <button onClick={handleLogout} className="m-5 bg-red-500 w-25 font-bold px-4 py-2 rounded cursor-pointer">Deslogar</button>

            <div className="bg-gray-600 text-white p-10">
                <h1 className="text-xl font-bold mb-6">Dados:</h1>

                <ul className="flex flex-col gap-3">
                    <li>
                        <ReactiveInput field="email" 
                            value={email} originalValue={thisUser.email === email} 
                            validChange={validEmail}
                            setFunction={handleEmailChange}
                            editFunction={handleEditApply}
                            placeholder="E-mail">
                                {
                                    emailChanged ? (
                                        <div className="text-green-500 font-medium mt-1">
                                            E-mail alterado com sucesso
                                        </div>
                                    ) : ""
                                }
                            </ReactiveInput>
                    </li>
                    <li>
                        <ReactiveInput field="username" 
                            value={username} originalValue={thisUser.username === username} 
                            validChange={validUsername}
                            setFunction={handleUsernameChange} 
                            editFunction={handleEditApply}
                            placeholder="Nickname">
                                {
                                    usernameChanged ? (
                                        <div className="text-green-500 font-medium mt-1">
                                            Nickname alterado com sucesso
                                        </div>
                                    ) : ""
                                }
                            </ReactiveInput>
                    </li>
                    <li>
                        <b>Permissão</b>:
                        <br/>{thisUser.permission}
                    </li>
                </ul>
            </div>
        </>
    );
}