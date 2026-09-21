export default function LandingPage() {
    return (
        <>
            <div className="bg-slate-700 p-4 text-2xl text-white">
                Área para usuários não autenticados
            </div>
            <div className="flex gap-6 text-blue-500 bg-black p-4">
                <a href="/login">Logar</a>
                <a href="/register">Registrar-se</a>
            </div>

        </>
    );
}