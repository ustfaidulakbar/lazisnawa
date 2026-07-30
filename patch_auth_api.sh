#!/bin/bash
cat << 'PATCH' > temp_auth.tsx
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email === "admin@lazisna.org" && password === "admin123") {
      onAdminLogin();
      return;
    }
    try {
      const endpoint = isLoginMode ? "/api/auth/login" : "/api/auth/register";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name: email.split("@")[0] })
      });
      if (res.ok) {
        const u = await res.json();
        setRegisteredUser(u);
        localStorage.setItem("lazisna_member", JSON.stringify(u));
        onRegisterSuccess(u.name, u.wa, undefined);
      } else {
        alert("Gagal otentikasi.");
      }
    } catch (e) {
      console.error(e);
      alert("Terjadi kesalahan jaringan.");
    }
  };
PATCH

sed -i '/const handleAuth = async (e: React.FormEvent) => {/,/  };/d' src/components/MemberCard.tsx
sed -i '33r temp_auth.tsx' src/components/MemberCard.tsx
