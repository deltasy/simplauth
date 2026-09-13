export default function LandingPage() {
    return (
        <>
            <div className="bg-slate-700 p-4">
                Área para usuários não autenticados
            </div>
            <div className="flex flex-col gap-2 text-blue-500 bg-black p-4">
                <a href="/login">Logar</a>
                <a href="/register">Registrar-se</a>
            </div>

        </>
    );
}