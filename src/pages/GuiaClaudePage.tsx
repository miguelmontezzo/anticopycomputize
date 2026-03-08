import React, { useEffect } from "react";

const GuiaClaudePage: React.FC = () => {
    useEffect(() => {
        // Define o título da aba
        document.title = "Anti Copy Club — Guia Claude Code";
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
                src="/guia-claude-v2.html"
                title="Anti Copy Club — Guia Claude Code"
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

export default GuiaClaudePage;
