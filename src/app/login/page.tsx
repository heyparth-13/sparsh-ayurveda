"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();
  const { refreshUser } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        await refreshUser();
        router.push("/checkout"); // or redirect to home depending on intent
      } else {
        setErrorMsg(data.error || "Login failed");
      }
    } catch (err) {
      setErrorMsg("An error occurred");
    }
  };

  return (
    <>
      <Header />
      <main className="container section-padding" style={{ minHeight: "60vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{ maxWidth: "400px", width: "100%", padding: "2rem", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", borderRadius: "12px", background: "white" }}>
          <h2 style={{ textAlign: "center", marginBottom: "1.5rem", fontFamily: "var(--font-playfair)", fontSize: "2rem", color: "var(--primary-dark)" }}>Welcome Back</h2>
          {errorMsg && <div style={{ color: "var(--danger)", background: "#ffebee", padding: "10px", borderRadius: "6px", marginBottom: "1rem", textAlign: "center" }}>{errorMsg}</div>}
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Email Address</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="form-input" placeholder="name@example.com" />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="form-input" placeholder="••••••••" />
            </div>
            <button type="submit" style={{ padding: "12px", background: "var(--primary-color)", color: "white", border: "none", borderRadius: "6px", fontSize: "1rem", fontWeight: 600, cursor: "pointer", marginTop: "1rem" }}>Log In</button>
          </form>
          <p style={{ textAlign: "center", marginTop: "1.5rem", color: "var(--text-light)" }}>
            Don't have an account? <Link href="/signup" style={{ color: "var(--primary-color)", fontWeight: 600 }}>Sign Up</Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
