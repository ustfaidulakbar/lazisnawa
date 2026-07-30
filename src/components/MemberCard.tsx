import React, { useState, useEffect } from "react";
import { DonationRecord } from "../types";
import { Award, User, Settings, Check, Download, Camera, LogOut } from "lucide-react";

interface MemberCardProps {
  pastDonations: DonationRecord[];
  onRegisterSuccess: (name: string, wa: string, photo?: string) => void;
  onAdminLogin: () => void;
  onNavigateToUmroh?: () => void;
  isAgent?: boolean;
}

export default function MemberCard({ pastDonations, onRegisterSuccess, onAdminLogin, onNavigateToUmroh, isAgent }: MemberCardProps) {
  const [registeredUser, setRegisteredUser] = useState<any>(null);
  const [activeSection, setActiveSection] = useState<"profil" | "pengaturan">("profil");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginMode, setIsLoginMode] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("lazisna_member");
    if (saved) {
      try {
        const u = JSON.parse(saved);
        setRegisteredUser(u);
        onRegisterSuccess(u.name, u.wa, u.photo);
      } catch (e) {}
    }
  }, []);


  const handleLogout = () => {
    localStorage.removeItem("lazisna_member");
    setRegisteredUser(null);
    onRegisterSuccess("", "");
  };

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
        
        if (u.role === "admin") {
           onAdminLogin();
           return;
        }
        
        setRegisteredUser(u);
        localStorage.setItem("lazisna_member", JSON.stringify(u));
        onRegisterSuccess(u.name, u.wa || "", undefined);
      } else {
        alert("Gagal otentikasi. Periksa email/password.");
      }
    } catch (e) {
      console.error(e);
      alert("Terjadi kesalahan jaringan.");
    }
  };

  const handleSocialLogin = (provider: string) => {
    alert(`Autentikasi dengan ${provider} sedang diproses... (Mock)`);
    // Simulasi login sukses
    const u = { name: `User ${provider}`, email: `user@${provider}.com`, wa: "08123456789" };
    setRegisteredUser(u);
    localStorage.setItem("lazisna_member", JSON.stringify(u));
    onRegisterSuccess(u.name, u.wa, undefined);
  };

  return (
    <div className="max-w-md mx-auto p-5 space-y-6 text-left">
      {registeredUser ? (
        <div className="space-y-4">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button onClick={() => setActiveSection("profil")} className={`flex-1 py-2 text-xs font-bold rounded-lg ${activeSection === "profil" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500"}`}>Profil</button>
            <button onClick={() => setActiveSection("pengaturan")} className={`flex-1 py-2 text-xs font-bold rounded-lg ${activeSection === "pengaturan" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500"}`}>Pengaturan</button>
          </div>
          
          {activeSection === "profil" ? (
             <div className="bg-emerald-600 text-white rounded-2xl p-5 shadow-lg">
               <h3 className="text-xl font-bold">{registeredUser.name}</h3>
               <p className="text-emerald-100 text-sm mt-1">{registeredUser.email}</p>
               <div className="mt-6 border-t border-emerald-500/50 pt-4 flex justify-between">
                 <div>
                   <div className="text-xs text-emerald-200">Total Donasi</div>
                   <div className="text-lg font-bold">Rp {pastDonations.reduce((a, b) => a + b.amount, 0).toLocaleString("id-ID")}</div>
                 </div>
                 <button onClick={handleLogout} className="flex items-center gap-1 text-xs text-emerald-100 hover:text-white">
                   <LogOut className="w-4 h-4" /> Keluar
                 </button>
               </div>
             </div>
          ) : (
             <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                <h4 className="font-bold text-slate-800 mb-4">Pengaturan Akun</h4>
                <p className="text-xs text-slate-500">Pengaturan aplikasi Lazisna Anda.</p>
             </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs space-y-5">
          <div className="text-center space-y-2">
             <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto"><User className="w-6 h-6"/></div>
             <h3 className="font-bold text-slate-800">Masuk / Daftar</h3>
          </div>
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email</label>
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full text-xs rounded-xl border border-slate-200 p-3" placeholder="email@domain.com" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
              <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full text-xs rounded-xl border border-slate-200 p-3" placeholder="Password" />
            </div>
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl text-xs transition-all">
              {isLoginMode ? "Masuk" : "Daftar"}
            </button>
            <div className="text-center">
               <button type="button" onClick={() => setIsLoginMode(!isLoginMode)} className="text-xs text-emerald-600 font-semibold hover:text-emerald-700 transition-all">
                 {isLoginMode ? "Belum punya akun? Daftar" : "Sudah punya akun? Masuk"}
               </button>
            </div>
            
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink-0 mx-4 text-[10px] text-slate-400 font-medium">ATAU {isLoginMode ? "MASUK" : "DAFTAR"} DENGAN</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <div className="space-y-2">
              <button 
                type="button" 
                onClick={() => handleSocialLogin('Google')}
                className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold py-3 rounded-xl text-xs transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
              
              <button 
                type="button" 
                onClick={() => handleSocialLogin('Facebook')}
                className="w-full flex items-center justify-center gap-2 bg-[#1877F2] hover:bg-[#166FE5] text-white font-semibold py-3 rounded-xl text-xs transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>
              
              <button 
                type="button" 
                onClick={() => handleSocialLogin('TikTok')}
                className="w-full flex items-center justify-center gap-2 bg-black hover:bg-zinc-900 text-white font-semibold py-3 rounded-xl text-xs transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93v8.12c-.01 2.92-1.74 5.6-4.46 6.55-2.52.92-5.45.36-7.38-1.41-1.97-1.79-2.72-4.73-1.85-7.23.82-2.39 3.01-4.08 5.53-4.32.32-.03.65-.04.98-.04.01 1.33.02 2.67.01 4-.29.02-.57.07-.86.13-1.19.24-2.12 1.25-2.31 2.45-.16 1.05.2 2.15 1.01 2.82.91.75 2.27.87 3.29.23 1-.63 1.57-1.75 1.58-2.92V.02h.39z"/>
                </svg>
                TikTok
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
