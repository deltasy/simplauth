import { useState } from "react";
import { signUp } from "../services/authService"

import Input from "../components/Input";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [isSubmiting, setIsSubmiting] = useState(false)

    const navigate = useNavigate();

    const handleRegister = async (event: React.SubmitEvent) => {
        event.preventDefault();

        setIsSubmiting(true);

        try {
            const data = await signUp(email, password);
            navigate('/home')

        } catch (error) { 
            if(!(error instanceof AxiosError)) return;

            alert(error.response?.data.error);
        }

        setIsSubmiting(false);
    };

    return (
        <form onSubmit={handleRegister}>
            <div className="bg-slate-800 text-white p-8">
                <Input field="email" value={email} 
                placeholder="E-mail" setFunction={setEmail} />

                <Input field="password" value={password} type="password" 
                placeholder="Senha" setFunction={setPassword} />

            </div>
            <div className="bg-slate-700 p-4 text-white flex flex-col gap-2">
                <button type="submit" className="bg-cyan-500 font-bold w-40 disabled:bg-cyan-500/40 disabled:text-slate-300 px-4 py-2 rounded cursor-pointer disabled:cursor-not-allowed" disabled={isSubmiting}>
                    Registrar-se
                </button>
                <a href="/login">Já tenho uma conta</a>
            </div>
        </form>

    );
}