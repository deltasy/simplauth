import { useState } from "react";
import { signIn } from "../services/authService"
import { AxiosError } from "axios";

import { useNavigate } from "react-router-dom";
import Input from "../components/Input";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [isSubmiting, setIsSubmiting] = useState(false)


    const navigate = useNavigate();

    const handleLogin = async (event: React.SubmitEvent) => {
        event.preventDefault();

        setIsSubmiting(true);

        try {
            await signIn(email, password);
            navigate('/home');

        } catch (error) { 
            if(!(error instanceof AxiosError)) return;

            alert(error.response?.data.error);

        }   finally {
            setIsSubmiting(false);
        }

    };

    return (
        <form onSubmit={handleLogin}>
            <div className="bg-slate-800 text-white p-8">
                <Input field="email" value={email} 
                placeholder="E-mail" setFunction={setEmail} />

                <Input field="password" value={password} type="password" 
                placeholder="Senha" setFunction={setPassword} />

            </div>
            <div className="bg-slate-700 p-4 text-white flex flex-col gap-2">
                <button type="submit" className="bg-cyan-500 w-25 font-bold disabled:bg-cyan-500/40 disabled:text-slate-300 px-4 py-2 rounded cursor-pointer disabled:cursor-not-allowed" disabled={isSubmiting}>
                    Logar
                </button>
                <a href="/register">Não tem uma conta? registre-se</a>
            </div>
        </form>

    );
}