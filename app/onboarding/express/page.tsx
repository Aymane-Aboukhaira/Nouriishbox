"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Phone, MessageCircle, ArrowLeft, CheckCircle2, Play, Square, Send, Info, ArrowRight } from "lucide-react";

export default function ExpressSetupPage() {
    const router = useRouter();
    const [isRecording, setIsRecording] = useState(false);
    const [recordingComplete, setRecordingComplete] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const mediaRecorder = useRef<MediaRecorder | null>(null);
    const chunks = useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder.current = new MediaRecorder(stream);
            chunks.current = [];
            
            mediaRecorder.current.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.current.push(e.data);
            };

            mediaRecorder.current.onstop = () => {
                const blob = new Blob(chunks.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);
                setAudioUrl(url);
                setRecordingComplete(true);
            };

            mediaRecorder.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Veuillez autoriser l'accès au micro pour enregistrer une note vocale.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorder.current && isRecording) {
            mediaRecorder.current.stop();
            setIsRecording(false);
            mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const infoList = [
        "Prénom de chaque membre",
        "Âges (min. 4 ans)",
        "Taille (cm) & Poids (kg)",
        "Objectifs (Perte, Muscle, Équilibre)",
        "Allergies ou aversions alimentaires",
        "Lieux et horaires de livraison"
    ];

    const [sent, setSent] = useState(false);

    const handleSend = () => {
        setSent(true);
        // In a real app, upload audio here
    };

    return (
        <div className="w-full max-w-4xl mx-auto py-12 px-6 pb-32">
            {!sent ? (
                <>
                    <button 
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors mb-8 group"
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-bold uppercase tracking-widest">Retour</span>
                    </button>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                        {/* Left Side: Info & Checklist */}
                        <div className="space-y-8">
                            <div>
                                <motion.span 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-[10px] font-bold text-accent uppercase tracking-[0.2em] mb-4 block"
                                >
                                    Configuration Concierge
                                </motion.span>
                                <motion.h1 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="font-serif text-4xl lg:text-5xl text-text-primary mb-6 leading-tight"
                                >
                                    Trop fatigué pour tout remplir ? <br/>
                                    <span className="text-primary">On s'occupe de tout.</span>
                                </motion.h1>
                                <motion.p 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-text-muted text-lg font-sans leading-relaxed"
                                >
                                    Envoyez-nous une note vocale ou discutez avec l'un de nos experts nutritionnistes. Nous configurerons votre profil pour vous.
                                </motion.p>
                            </div>

                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-primary/5 rounded-[32px] p-8 space-y-6 border border-primary/10"
                            >
                                <div className="flex items-center gap-3 text-primary">
                                    <Info size={24} />
                                    <h3 className="font-serif text-xl">Informations nécessaires :</h3>
                                </div>
                                <ul className="grid grid-cols-1 gap-4">
                                    {infoList.map((item, index) => (
                                        <li key={index} className="flex items-start gap-3 text-text-primary/80">
                                            <CheckCircle2 size={18} className="text-primary mt-1 flex-shrink-0" />
                                            <span className="font-medium">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        </div>

                        {/* Right Side: Action Methods */}
                        <div className="space-y-6">
                            {/* Voice Note Section */}
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 }}
                                className="bg-white rounded-[32px] p-8 border-[1.5px] border-border shadow-soft flex flex-col items-center text-center space-y-6 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-6">
                                    <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-border'}`} />
                                </div>
                                
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 ${isRecording ? 'bg-red-500 scale-110 shadow-lg shadow-red-200' : 'bg-primary/10 text-primary'}`}>
                                    <Mic size={32} strokeWidth={1.5} className={isRecording ? 'text-white' : ''} />
                                </div>

                                <div>
                                    <h3 className="font-serif text-2xl text-text-primary mb-2">Note Vocale</h3>
                                    <p className="text-sm text-text-muted">Enregistrez vos détails en toute simplicité</p>
                                </div>

                                {!recordingComplete ? (
                                    <button
                                        onClick={isRecording ? stopRecording : startRecording}
                                        className={`w-full py-4 rounded-full font-bold flex items-center justify-center gap-3 transition-all ${
                                            isRecording 
                                            ? "bg-red-50 text-red-500 border-2 border-red-500" 
                                            : "bg-primary text-white shadow-xl shadow-primary/20 hover:scale-[1.02]"
                                        }`}
                                    >
                                        {isRecording ? (
                                            <><Square size={20} fill="currentColor" /> Arrêter l'enregistrement</>
                                        ) : (
                                            <><Mic size={20} /> Lancer l'enregistrement</>
                                        )}
                                    </button>
                                ) : (
                                    <div className="w-full space-y-4">
                                        <audio src={audioUrl || ""} controls className="w-full h-10" />
                                        <div className="flex gap-3">
                                            <button 
                                                onClick={() => setRecordingComplete(false)}
                                                className="flex-1 py-4 rounded-full border-2 border-border text-text-muted font-bold text-sm hover:border-primary/30 transition-all"
                                            >
                                                Réessayer
                                            </button>
                                            <button 
                                                onClick={handleSend}
                                                className="flex-[2] py-4 rounded-full bg-primary text-white font-bold text-sm flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
                                            >
                                                <Send size={18} /> Envoyer la note
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </motion.div>

                            {/* Contact Buttons */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                            >
                                <a 
                                    href="https://wa.me/212600000000?text=Bonjour Nourishbox, je souhaite configurer mon profil par message vocal." 
                                    target="_blank"
                                    onClick={() => setTimeout(() => setSent(true), 2000)}
                                    className="bg-[#25D366] text-white p-6 rounded-[24px] flex flex-col items-center gap-3 hover:scale-[1.02] transition-all shadow-lg shadow-green-100"
                                >
                                    <MessageCircle size={32} fill="white" />
                                    <span className="font-bold text-sm uppercase tracking-wider">WhatsApp</span>
                                </a>

                                <a 
                                    href="tel:+212600000000"
                                    onClick={() => setTimeout(() => setSent(true), 1000)}
                                    className="bg-accent text-white p-6 rounded-[24px] flex flex-col items-center gap-3 hover:scale-[1.02] transition-all shadow-lg shadow-orange-100"
                                >
                                    <Phone size={32} fill="white" />
                                    <span className="font-bold text-sm uppercase tracking-wider">Appeler</span>
                                </a>
                            </motion.div>

                            <p className="text-center text-xs text-text-muted font-medium pt-4">
                                Numéro Direct : <span className="text-text-primary">+212 600 000 000</span> (Nutritionniste de garde)
                            </p>
                        </div>
                    </div>
                </>
            ) : (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-xl mx-auto text-center space-y-8 py-12 bg-white rounded-[40px] border-[1.5px] border-border shadow-soft p-12"
                >
                    <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 size={48} />
                    </div>
                    <div className="space-y-4">
                        <h2 className="font-serif text-4xl text-text-primary">Parfait, nous avons bien reçu !</h2>
                        <p className="text-text-muted text-lg leading-relaxed">
                            Nos experts vont configurer votre profil selon vos instructions. <br/>
                            Inscrivez-vous maintenant pour finaliser votre compte et recevoir vos premiers repas.
                        </p>
                    </div>

                    <div className="space-y-4 pt-4">
                        <button 
                            onClick={() => router.push("/auth/signup")}
                            className="w-full py-5 rounded-full bg-primary text-white font-bold text-lg shadow-xl shadow-primary/20 hover:scale-[1.03] transition-all flex items-center justify-center gap-3"
                        >
                            <span>Créer mon compte</span>
                            <ArrowRight size={22} />
                        </button>
                        <button 
                            onClick={() => router.push("/auth/signin")}
                            className="w-full py-5 rounded-full border-2 border-border text-text-primary font-bold text-lg hover:border-primary/30 transition-all"
                        >
                            J'ai déjà un compte
                        </button>
                    </div>
                </motion.div>
            )}
        </div>

    );
}
