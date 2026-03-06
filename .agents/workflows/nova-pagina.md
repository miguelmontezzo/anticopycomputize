---
description: Como criar e registrar uma nova página estática e embarcá-la no app React
---

Este workflow descreve os passos exatos para subir uma nova página estática (HTML/CSS/JS) para o projeto do Anti Copy Club, inserindo-a via um `iframe` fullscreen através do React Router.

1. **Adicione a Página na Pasta Pública**:
   - Mova o seu novo arquivo `.html` e salve-o na pasta raiz `public/` (exemplo: `public/nova-campanha.html`).

2. **Crie o Componente React**:
   - Crie um novo arquivo TSX na pasta de páginas `src/pages/` (exemplo: `src/pages/NovaCampanhaPage.tsx`).
   - Use a seguinte estrutura padrão para carregar o seu HTML:

   ```tsx
   import React, { useEffect } from "react";

   const NovaCampanhaPage: React.FC = () => {
       useEffect(() => {
           // Define o título da aba
           document.title = "Anti Copy Club — Nova Campanha";
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
                   src="/nova-campanha.html"
                   title="Anti Copy Club — Nova Campanha"
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

   export default NovaCampanhaPage;
   ```

3. **Registre a Rota no App.tsx**:
   - Abra o arquivo global de rotas `src/App.tsx`.
   - Adicione o `import` deste novo componente na seção de importações do topo do arquivo:
     ```tsx
     import NovaCampanhaPage from "./pages/NovaCampanhaPage";
     ```
   - Dentro de `<Routes>...</Routes>`, adicione a nova rota:
     ```tsx
     <Route path="/nova-campanha" element={<NovaCampanhaPage />} />
     ```

4. **Conclua e faça o Commit/Deploy**:
   - Após criar o HTML, o componente da página e linkar as rotas, verifique sua porta local (`npm run dev`) acessando `localhost:5173/nova-campanha`.

// turbo
5. Se tudo estiver correto, adicione todas as mudanças e suba com o Git:
   `git add . && git commit -m "feat: adicionando página nova-campanha" && git push`
