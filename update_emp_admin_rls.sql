-- Para que o painel administrativo consiga ler os dados sem que um usuário final
-- estaja logado no Supabase, é preciso aplicar uma política na tabela `emp_responses`
-- permitindo a ação de SELECT para todos (publico).

-- Se essa RLS não existir no seu painel:
CREATE POLICY "Permitir Leitura Geral"
ON emp_responses FOR SELECT
TO public
USING (true);
