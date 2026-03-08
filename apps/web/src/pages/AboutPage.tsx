import { Shield, Lock, Key, Globe } from "lucide-react";
import { Link } from "react-router-dom";

export default function AboutPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
            <div className="w-full max-w-lg">
                <div className="rounded-lg p-8 bg-card border border-border shadow-elevated">
                    {/* Logo and branding */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 mb-5 shadow-sm">
                            <Shield className="w-7 h-7 text-primary" />
                        </div>

                        <h1 className="text-2xl font-semibold text-foreground mb-2">
                            About Vault
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Your secure, encrypted password manager
                        </p>
                    </div>

                    {/* Features */}
                    <div className="space-y-4 mb-8">
                        {[
                            {
                                icon: Lock,
                                title: "End-to-End Encryption",
                                desc: "All data is encrypted on your device before being stored",
                            },
                            {
                                icon: Key,
                                title: "Zero-Knowledge Architecture",
                                desc: "We never see or store your master password",
                            },
                            {
                                icon: Globe,
                                title: "Cross-Platform Access",
                                desc: "Access your vault from any device with our web app and browser extension",
                            },
                        ].map((feature, i) => (
                            <div
                                key={i}
                                className="flex items-start gap-3 p-3 rounded-lg bg-background border border-border/50"
                            >
                                <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center flex-shrink-0">
                                    <feature.icon className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-foreground">
                                        {feature.title}
                                    </h3>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {feature.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Links */}
                    <div className="flex flex-col gap-3 pt-6 border-t border-border">
                        <Link
                            to="/login"
                            className="w-full text-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                        >
                            Sign in to your vault
                        </Link>
                        <Link
                            to="/privacy"
                            className="w-full text-center text-xs text-muted-foreground hover:text-foreground uppercase tracking-widest font-bold transition-colors"
                        >
                            Privacy Policy
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
