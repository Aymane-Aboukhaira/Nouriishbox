"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, AlertCircle, Loader2, ArrowRight, Image as ImageIcon } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const signUpSchema = z.object({
  name: z.string().min(2, "Le nom doit comporter au moins 2 caractères"),
  email: z.string().email("Veuillez entrer un email valide"),
  phone: z.string().min(8, "Veuillez entrer un numéro de téléphone valide"),
  address: z.string().min(10, "Veuillez entrer votre adresse de livraison complète"),
  password: z.string().min(8, "Le mot de passe doit comporter au moins 8 caractères"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type SignUpForm = z.infer<typeof signUpSchema>;

function SignUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan");
  const { user, isAuthenticated, signUp } = useAuthStore();

  const [hasMounted, setHasMounted] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => { setHasMounted(true); }, []);

  useEffect(() => {
    if (hasMounted && isAuthenticated) {
      router.replace("/client/dashboard");
    }
  }, [hasMounted, isAuthenticated, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpForm>({ resolver: zodResolver(signUpSchema) });

  if (!hasMounted) return null;

  const onSubmit = (data: SignUpForm) => {
    setFormError(null);
    if (user?.email === data.email) {
      setFormError("Un compte avec cet email existe déjà.");
      return;
    }
    signUp({ name: data.name, email: data.email, phone: data.phone, address: data.address });
    if (plan) {
      router.push(`/checkout?plan=${plan}`);
    } else {
      router.push("/client/dashboard");
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 overflow-hidden bg-background">
      {/* 1. LEFT — EXPERIENCE PANEL */}
      <div className="hidden lg:flex flex-col justify-between bg-primary p-16 relative overflow-hidden">
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            backgroundSize: "128px 128px",
          }}
        />
        <div className="absolute top-[-20%] right-[-20%] w-[80%] aspect-square rounded-full bg-accent/10 blur-[120px] pointer-events-none" />
        
        <div className="relative z-10">
          <Link href="/" className="inline-block mb-24 group">
            <div className="flex items-center font-serif tracking-tight text-3xl">
              <span className="text-background">nourish</span>
              <span className="text-accent group-hover:text-background transition-colors duration-300">box</span>
            </div>
          </Link>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="font-serif text-6xl xl:text-7xl text-background leading-[1.1] max-w-lg mb-12"
          >
            Mangez Comme Votre Corps <br /> 
            <span className="italic opacity-90">A Été Conçu Pour Le Faire.</span>
          </motion.h1>
        </div>

        <motion.div
           initial={{ opacity: 0, scale: 0.95, y: 40 }}
           animate={{ opacity: 1, scale: 1, y: 0 }}
           transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
           className="relative z-10 w-full"
        >
          <div className="relative aspect-square max-w-sm ml-auto rounded-[32px] border-2 border-dashed border-background/20 bg-background/5 flex items-center justify-center overflow-hidden">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-background/10 mx-auto mb-4 flex items-center justify-center text-background/40">
                <ImageIcon size={28} strokeWidth={1.5} />
              </div>
              <p className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-background/30 px-6">Produit en aperçu</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 2. RIGHT — AUTH PANEL */}
      <div className="flex flex-col justify-start lg:justify-center px-8 sm:px-12 md:px-16 lg:px-24 py-16 min-h-screen overflow-y-auto">
        <Link href="/" className="lg:hidden mb-12 group transition-opacity hover:opacity-80">
          <div className="flex items-center font-serif tracking-tight text-2xl">
            <span className="text-primary">nourish</span>
            <span className="text-accent group-hover:text-primary transition-colors duration-300">box</span>
          </div>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md mx-auto lg:mx-0"
        >
          <div className="mb-10">
            <h2 className="font-serif text-4xl text-text-primary mb-3">Créer Un Compte</h2>
            <p className="text-text-muted font-sans text-base">Vos données sont enregistrées — cela prendra 30 secondes.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-text-primary px-1">Nom Complet</label>
                <Input {...register("name")} placeholder="Amine Kadiri" error={!!errors.name} />
                {errors.name && <p className="text-accent text-[10px] font-bold px-4 uppercase tracking-widest mt-1">{errors.name.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-text-primary px-1">Adresse e-mail</label>
                <Input {...register("email")} type="email" placeholder="vous@exemple.com" error={!!errors.email} />
                {errors.email && <p className="text-accent text-[10px] font-bold px-4 uppercase tracking-widest mt-1">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-text-primary px-1">Numéro de Téléphone</label>
                <Input {...register("phone")} type="tel" placeholder="+212 6XX XXX XXX" error={!!errors.phone} />
                {errors.phone && <p className="text-accent text-[10px] font-bold px-4 uppercase tracking-widest mt-1">{errors.phone.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-text-primary px-1">Adresse de Livraison</label>
                <Input {...register("address")} placeholder="Rue, quartier, Casablanca" error={!!errors.address} />
                {errors.address && <p className="text-accent text-[10px] font-bold px-4 uppercase tracking-widest mt-1">{errors.address.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-text-primary px-1">Mot de Passe</label>
                  <div className="relative">
                    <Input {...register("password")} type={showPw ? "text" : "password"} placeholder="••••••••" error={!!errors.password} />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary transition-colors">
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-accent text-[10px] font-bold px-4 uppercase tracking-widest mt-1">{errors.password.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-text-primary px-1">Confirmer</label>
                  <div className="relative">
                    <Input {...register("confirmPassword")} type={showConfirm ? "text" : "password"} placeholder="••••••••" error={!!errors.confirmPassword} />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary transition-colors">
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-accent text-[10px] font-bold px-4 uppercase tracking-widest mt-1">{errors.confirmPassword.message}</p>}
                </div>
              </div>
            </div>

            {formError && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-accent/5 border border-accent/20 rounded-[20px] p-4 text-sm text-accent font-semibold flex items-center gap-3 mt-4">
                <AlertCircle size={18} strokeWidth={2} />
                <span>{formError} {formError.includes("existe déjà") && <Link href="/auth/signin" className="underline font-bold">Se connecter à la place ?</Link>}</span>
              </motion.div>
            )}

            <Button variant="primary" size="lg" className="w-full h-14 text-sm font-bold uppercase tracking-widest mt-6" type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <>Créer un Compte <ArrowRight size={16} className="ml-2" /></>}
            </Button>
          </form>

          <div className="my-8 flex items-center gap-4">
            <div className="flex-1 h-[1px] bg-border" />
            <span className="text-[9px] font-bold text-text-muted uppercase tracking-[0.2em] whitespace-nowrap">Ou continuer avec</span>
            <div className="flex-1 h-[1px] bg-border" />
          </div>

          <Button variant="secondary" size="lg" className="w-full h-12 bg-white border-border text-text-primary hover:border-primary font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 group" onClick={() => toast.info("Connexion Google à venir")}>
            <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
            Google
          </Button>

          <p className="text-center text-xs font-medium text-text-muted mt-8">
            Vous avez déjà un compte ?{" "}
            <Link href="/auth/signin" className="text-accent underline underline-offset-4 hover:opacity-80 transition-opacity font-bold ml-1">Se Connecter</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <SignUpContent />
    </Suspense>
  );
}
