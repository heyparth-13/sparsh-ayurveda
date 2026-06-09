"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Account created successfully! Redirecting to login...");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setErrorMsg(data.error || "Signup failed");
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
          <h2 style={{ textAlign: "center", marginBottom: "1.5rem", fontFamily: "var(--font-playfair)", fontSize: "2rem", color: "var(--primary-dark)" }}>Create Account</h2>
          {errorMsg && <div style={{ color: "var(--danger)", background: "#ffebee", padding: "10px", borderRadius: "6px", marginBottom: "1rem", textAlign: "center" }}>{errorMsg}</div>}
          {successMsg && <div style={{ color: "green", background: "#e8f5e9", padding: "10px", borderRadius: "6px", marginBottom: "1rem", textAlign: "center" }}>{successMsg}</div>}
          
          <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Full Name</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} className="form-input" placeholder="John Doe" />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Email Address</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="form-input" placeholder="name@example.com" />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="form-input" placeholder="••••••••" minLength={6} />
            </div>
            <button type="submit" style={{ padding: "12px", background: "var(--primary-color)", color: "white", border: "none", borderRadius: "6px", fontSize: "1rem", fontWeight: 600, cursor: "pointer", marginTop: "1rem" }}>Sign Up</button>
          </form>
          <p style={{ textAlign: "center", marginTop: "1.5rem", color: "var(--text-light)" }}>
            Already have an account? <Link href="/login" style={{ color: "var(--primary-color)", fontWeight: 600 }}>Log In</Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
