import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export default NextAuth({
    providers: [
        CredentialsProvider({
            name: "Email",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                const res = await fetch("http://localhost:5000/api/login", {
                    method: "POST",
                    body: JSON.stringify(credentials),
                    headers: { "Content-Type": "application/json" }
                });
                const user = await res.json();
                if (res.ok && user) return user;
                return null;
            }
        })
    ],
    secret: process.env.NEXTAUTH_SECRET,
    session: { strategy: "jwt" },
    pages: { signIn: "/login" }
});