import React, { useEffect } from "react";

const EleicaoPage: React.FC = () => {
    useEffect(() => {
        document.title = "Anti Copy Club — Produção com IA · Eleições 2026";
        return () => {
            document.title = "Anti Copy Club";
        };
    }, []);

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                width: "100%",
                height: "100%",
                overflow: "hidden",
                background: "#0a0a0a",
            }}
        >
            <iframe
                src="/eleicao.html"
                title="Anti Copy Club — Produção com IA · Eleições 2026"
                style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                    display: "block",
                }}
                allow="autoplay; fullscreen"
            />
        </div>
    );
};

export default EleicaoPage;
