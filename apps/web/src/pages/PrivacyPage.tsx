import { useNavigate } from "react-router-dom";
import { Shield, ChevronLeft } from "lucide-react";

export default function PrivacyPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-2xl mx-auto px-6 py-8">
                {/* Page header */}
                <div className="flex items-center gap-3 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center hover:bg-card/80 transition-colors"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold">Privacy Policy</h1>
                        <p className="text-sm text-muted-foreground">
                            Last Updated: March 2026
                        </p>
                    </div>
                </div>

                <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
                    <p>
                        Vault is committed to protecting your security and privacy. This
                        policy explains how we handle your data within the Vault Web
                        Application and Browser Extension.
                    </p>

                    <section>
                        <h2 className="text-base font-semibold text-primary mb-3">
                            1. Zero-Knowledge Architecture
                        </h2>
                        <p>
                            Vault is built on a{" "}
                            <strong className="text-primary">Zero-Knowledge</strong>{" "}
                            architecture. This means your sensitive credentials, master
                            passwords, and recovery keys are encrypted locally on your device
                            before they ever touch our servers. We do not have access to your
                            unencrypted data, and we cannot reset your master password if you
                            lose it.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-semibold text-primary mb-3">
                            2. Data Collection & Usage
                        </h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>
                                <strong className="text-primary">Credentials:</strong> Your
                                saved accounts and passwords are encrypted using AES-256-GCM. We
                                only store the encrypted blobs in our database.
                            </li>
                            <li>
                                <strong className="text-primary">Extension Permissions:</strong>
                                <ul className="list-disc pl-5 mt-2 space-y-1">
                                    <li>
                                        <strong className="text-primary">
                                            activeTab & Scripting:
                                        </strong>{" "}
                                        Used solely to detect login forms and fill saved credentials
                                        on your behalf.
                                    </li>
                                    <li>
                                        <strong className="text-primary">Storage:</strong> Used to
                                        save local extension preferences.
                                    </li>
                                    <li>
                                        <strong className="text-primary">
                                            Chrome Notifications:
                                        </strong>{" "}
                                        Used only to confirm successful save/update actions.
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-base font-semibold text-primary mb-3">
                            3. Data Protection
                        </h2>
                        <p>
                            Your decryption keys (Master Key) are kept in{" "}
                            <strong className="text-primary">
                                volatile memory (RAM)
                            </strong>{" "}
                            and are never written to disk or sent to any server. When you close
                            your browser or lock the vault, these keys are wiped immediately.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-semibold text-primary mb-3">
                            4. Third-Party Sharing
                        </h2>
                        <p>
                            Vault{" "}
                            <strong className="text-primary">
                                does not sell, trade, or share
                            </strong>{" "}
                            your data with any third parties. We do not use your data for
                            advertising, credit scoring, or tracking.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-semibold text-primary mb-3">
                            5. Security Compliance
                        </h2>
                        <p>
                            We use industry-standard encryption protocols (Web Crypto API,
                            PBKDF2 with 310,000 iterations) to ensure your identity remains
                            secure even in the event of a breach of our encrypted storage.
                        </p>
                    </section>

                    <div className="pt-6 border-t border-border text-xs text-muted-foreground">
                        <p>&copy; 2026 Vault Password Manager. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
