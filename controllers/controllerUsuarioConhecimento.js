const db = require('../config/db_sequelize');

module.exports = {

    async postCreate(req, res) {
        try {
            const { conhecimentoId, nivel } = req.body;
            const { usuarioId, tipo } = req.session;

            if (tipo !== 'aluno') {
                return res.status(403).send('Apenas alunos podem vincular conhecimentos.');
            }

            if (!conhecimentoId || !nivel || nivel < 0 || nivel > 10) {
                return res.status(400).send('Dados inválidos.');
            }

            // 'upsert' cria se não existir, ou atualiza se a chave (usuarioId, conhecimentoId) já existir.
            await db.UsuarioConhecimento.upsert({
                usuarioId: usuarioId,
                conhecimentoId: conhecimentoId,
                nivel: nivel
            });

            res.redirect('/listarConhecimento');
        } catch (err) {
            console.error('Erro ao vincular conhecimento:', err);
            res.status(500).send('Erro ao vincular conhecimento');
        }
    },

    async postUpdate(req, res) {
        try {
            // Pega os dados do formulário inline (que vieram do req.body)
            const { conhecimentoId, usuarioId, nivel } = req.body;
            const { usuarioId: sessionUsuarioId, tipo: sessionTipo } = req.session;

            // Segurança: Apenas o próprio aluno ou um admin podem enviar o formulário
            if (sessionTipo !== 'admin' && sessionUsuarioId.toString() !== usuarioId.toString()) {
                return res.status(403).send('Você não tem permissão para atualizar este vínculo.');
            }

            if (!conhecimentoId || !usuarioId || nivel === undefined || nivel < 0 || nivel > 10) {
                return res.status(400).send('Dados inválidos.');
            }

            await db.UsuarioConhecimento.update( 
                { nivel: nivel },
                { where: { usuarioId: usuarioId, conhecimentoId: conhecimentoId } }
            );

            res.redirect('/visualizarUsuario/' + usuarioId);

        } catch (err) {
            console.error('Erro ao atualizar vínculo de conhecimento:', err);
            res.status(500).send('Erro ao atualizar vínculo de conhecimento');
        }
    },

    async getDelete(req, res) {
        try {
            const { conhecimentoId, usuarioId } = req.params;
            const { usuarioId: sessionUsuarioId, tipo: sessionTipo } = req.session;
    
            if (sessionTipo !== 'admin' && sessionUsuarioId.toString() !== usuarioId.toString()) {
                return res.status(403).send('Você não tem permissão para excluir este vínculo.');
            }
        
            if (!conhecimentoId || !usuarioId) {
                return res.status(400).send('Dados inválidos.');
            }
        
            await db.UsuarioConhecimento.destroy({
                where: {
                    usuarioId: usuarioId,
                    conhecimentoId: conhecimentoId
                }
            });
        
            res.redirect('/visualizarUsuario/' + usuarioId);
        } catch (err) {
            console.error('Erro ao excluir vínculo de conhecimento:', err);
            res.status(500).send('Erro ao excluir vínculo de conhecimento');
        }
    }
};