export default function LandingPage() {
    return (
        <>
            <div className="bg-slate-700 p-4 text-2xl text-white">
                Area for unauthenticated users
            </div>
            <div className="flex gap-6 text-blue-500 bg-black p-4">
                <a href="/login">Login</a>
                <a href="/register">Register</a>
            </div>

        </>
    );
}