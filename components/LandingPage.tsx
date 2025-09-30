import React from 'react';

interface LandingPageProps {
    onLoginClick: () => void;
}

const FeatureIcon1: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
    </svg>
);

const FeatureIcon3: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
    </svg>
);

export const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick }) => {
    return (
        <div className="bg-slate-50 min-h-screen font-sans">
            {/* Header */}
            <header className="bg-slate-900 text-white">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold">Plataforma de Auditoria ISO</h1>
                    <button onClick={onLoginClick} className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition text-sm">
                        Login
                    </button>
                </div>
            </header>

            {/* Hero Section */}
            <main>
                <section className="bg-slate-900 text-white text-center py-20 md:py-32">
                    <div className="container mx-auto px-6">
                        <h2 className="text-4xl md:text-6xl font-extrabold leading-tight">
                            Plataforma Web Inteligente para Auditorias ISO.
                        </h2>
                        <p className="mt-4 text-lg md:text-xl text-slate-300 max-w-3xl mx-auto">
                            Construída com tecnologias web modernas, nossa plataforma agiliza o planejamento, execução e a geração de relatórios para as normas ISO 9001, 14001 e 45001.
                        </p>
                        <button onClick={onLoginClick} className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition shadow-lg text-lg">
                            Acessar a Plataforma
                        </button>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-16 md:py-24 bg-white">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-12">
                            <h3 className="text-3xl font-bold text-slate-800">Funcionalidades Principais</h3>
                            <p className="mt-2 text-slate-500">Tudo que você precisa para uma auditoria eficiente.</p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            <div className="text-center p-8 bg-slate-50 rounded-2xl shadow-sm">
                                <div className="flex items-center justify-center h-16 w-16 bg-blue-100 text-blue-600 rounded-full mx-auto mb-4">
                                    <FeatureIcon1 className="w-8 h-8" />
                                </div>
                                <h4 className="text-xl font-semibold text-slate-800">Geração de Observações com IA</h4>
                                <p className="mt-2 text-slate-600">
                                    A IA gera automaticamente observações e evidências com base na metodologia FER (Fato, Evidência, Requisito), economizando tempo e garantindo consistência.
                                </p>
                            </div>
                             <div className="text-center p-8 bg-slate-50 rounded-2xl shadow-sm">
                                <div className="flex items-center justify-center h-16 w-16 bg-blue-100 text-blue-600 rounded-full mx-auto mb-4">
                                    <FeatureIcon3 className="w-8 h-8" />
                                </div>
                                <h4 className="text-xl font-semibold text-slate-800">Dashboards e Relatórios</h4>
                                <p className="mt-2 text-slate-600">
                                    Acompanhe o progresso da auditoria em tempo real com dashboards intuitivos e gere relatórios finais profissionais com apenas um clique.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-slate-900 text-white py-6">
                <div className="container mx-auto px-6 text-center text-sm text-slate-400">
                    <p>&copy; {new Date().getFullYear()} Plataforma de Auditoria Interna ISO. Todos os direitos reservados.</p>
                </div>
            </footer>
        </div>
    );
};