import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    
    const handleLogin = async (e) => {
        e.preventDefault();
        await signIn("credentials", { email, password, redirect: true, callbackUrl: "/dashboard" });
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h2 className="text-2xl font-bold">Login</h2>
            <form onSubmit={handleLogin} className="flex flex-col gap-4 mt-4">
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="border p-2" required />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="border p-2" required />
                <button type="submit" className="bg-blue-500 text-white p-2">Login</button>
            </form>
        </div>
    );
}