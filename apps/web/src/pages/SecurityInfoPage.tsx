import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    Shield,
    Lock,
    Key,
    Eye,
    EyeOff,
    Server,
    Smartphone,
    CheckCircle2,
    XCircle,
    ShieldCheck,
    Binary,
    Hash,
    ChevronLeft,
} from "lucide-react";

export default function SecurityInfoPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-lg mx-auto px-6 py-8">
                {/* Page header */}
                <div className="flex items-center gap-3 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center hover:bg-card/80 transition-colors"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold">How Your Data is Protected</h1>
                        <p className="text-sm text-muted-foreground">
                            Understanding our zero-knowledge security
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Zero Knowledge Section */}
                    <section>
                        <div className="flex items-center gap-2 mb-3">
                            <EyeOff className="w-4 h-4 text-primary" />
                            <h3 className="font-semibold text-foreground">
                                Zero-Knowledge Architecture
                            </h3>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            We never see your passwords, recovery key, or decrypted data. All
                            encryption and decryption happens locally on your device. Our
                            servers only store encrypted data that is meaningless without your
                            keys.
                        </p>
                    </section>

                    {/* E2E Encryption Section */}
                    <section>
                        <div className="flex items-center gap-2 mb-3">
                            <Lock className="w-4 h-4 text-primary" />
                            <h3 className="font-semibold text-foreground">
                                End-to-End Encryption
                            </h3>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                            Your data is encrypted on your device before it leaves. Only you
                            can decrypt it with your password.
                        </p>
                        <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 border border-border">
                            <div className="flex items-center gap-2">
                                <Smartphone className="w-4 h-4 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                    Your Device
                                </span>
                            </div>
                            <div className="flex-1 border-t border-dashed border-muted-foreground/30" />
                            <div className="px-2 py-1 rounded bg-primary/10 text-xs text-primary font-medium">
                                Encrypted
                            </div>
                            <div className="flex-1 border-t border-dashed border-muted-foreground/30" />
                            <div className="flex items-center gap-2">
                                <Server className="w-4 h-4 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">Server</span>
                            </div>
                        </div>
                    </section>

                    {/* Encryption Details */}
                    <section>
                        <div className="flex items-center gap-2 mb-3">
                            <Binary className="w-4 h-4 text-primary" />
                            <h3 className="font-semibold text-foreground">
                                Encryption Standards
                            </h3>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border">
                                <Shield className="w-4 h-4 text-primary mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-foreground">
                                        AES-256-CBC
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Military-grade encryption for all your vault data
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border">
                                <Hash className="w-4 h-4 text-primary mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-foreground">
                                        PBKDF2-SHA256
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        310,000 iterations to derive keys from your password
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border">
                                <Key className="w-4 h-4 text-primary mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-foreground">
                                        Unique Master Key
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        A random 256-bit key encrypts your data, wrapped by your
                                        password
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* What We Store vs Don't Store */}
                    <section>
                        <div className="flex items-center gap-2 mb-3">
                            <Eye className="w-4 h-4 text-primary" />
                            <h3 className="font-semibold text-foreground">Data Storage</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <XCircle className="w-4 h-4 text-destructive" />
                                    <span className="text-xs font-semibold text-destructive">
                                        We Never Store
                                    </span>
                                </div>
                                <ul className="space-y-1">
                                    {[
                                        "Your password",
                                        "Your recovery key",
                                        "Your master key",
                                        "Decrypted data",
                                    ].map((item, i) => (
                                        <li
                                            key={i}
                                            className="text-xs text-muted-foreground flex items-center gap-1"
                                        >
                                            <span className="w-1 h-1 rounded-full bg-destructive" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    <span className="text-xs font-semibold text-green-500">
                                        We Store (Encrypted)
                                    </span>
                                </div>
                                <ul className="space-y-1">
                                    {[
                                        "Encrypted vault data",
                                        "Encrypted master key",
                                        "Salt for key derivation",
                                    ].map((item, i) => (
                                        <li
                                            key={i}
                                            className="text-xs text-muted-foreground flex items-center gap-1"
                                        >
                                            <span className="w-1 h-1 rounded-full bg-green-500" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Recovery Key */}
                    <section>
                        <div className="flex items-center gap-2 mb-3">
                            <Key className="w-4 h-4 text-amber-500" />
                            <h3 className="font-semibold text-foreground">Recovery Key</h3>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Your recovery key is a backup way to access your vault if you
                            forget your password. It's generated once and shown only to you.
                            Store it safely — we cannot recover your data without it.
                        </p>
                    </section>

                    {/* What This Means */}
                    <section className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                        <h3 className="font-semibold text-foreground mb-2">
                            What This Means For You
                        </h3>
                        <ul className="space-y-2">
                            {[
                                "Even if our servers are compromised, your data remains encrypted",
                                "We cannot access your data even if legally required to",
                                "Only you can unlock your vault with your password or recovery key",
                                "If you lose both, your data is permanently inaccessible",
                            ].map((item, i) => (
                                <li
                                    key={i}
                                    className="text-sm text-muted-foreground flex items-start gap-2"
                                >
                                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </section>

                    <Button onClick={() => navigate(-1)} className="w-full mt-2">
                        Got it
                    </Button>
                </div>
            </div>
        </div>
    );
}
