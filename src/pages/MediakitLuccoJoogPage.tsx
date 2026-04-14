import React, { useEffect } from "react";

const MediakitLuccoJoogPage: React.FC = () => {
    useEffect(() => {
        document.title = "Anti Copy Club — Lucco × Joog";
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
                src="/mediakit-lucaslucco-joog.html"
                title="Anti Copy Club — Lucco × Joog"
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

export default MediakitLuccoJoogPage;
