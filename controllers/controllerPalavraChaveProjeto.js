const db = require('../config/db_sequelize');
const { Op } = require('sequelize');

module.exports = {
    async getList(req, res) {
        try {
            const usuarioId = req.session.usuarioId;
            const tipo = req.session.tipo;
            const projetoId = req.params.projetoId || req.query.projetoId;

            const palavrasChave = await db.PalavraChave.findAll({
                order: [['palavra', 'ASC']]
            });
            
            let vinculadas = [];
            if (projetoId) {
                const projeto = await db.Projeto.findByPk(projetoId, {
                    include: db.PalavraChave
                });
                vinculadas = projeto ? projeto.PalavraChaves.map(p => p.id) : [];
            }

            res.render('editarProjeto', {
                palavras: palavrasChave,
                vinculadas,
                projetoId,
                tipo,
                usuarioId
            });
        } catch (err) {
            console.error('Erro ao listar palavras-chave:', err);
            res.status(500).send('Erro ao listar palavras-chave.');
        }
    },

    async postCreate(req, res) {
        try {
            const { projetoId, palavraChaveId } = req.body;

            if(!projetoId || !palavraChaveId) {
                return res.status(400).send('Projeto ou palavra-chave inválidos.');
            }

            await db.PalavraChaveProjeto.create({
                projetoId,
                palavraChaveId
            });

            res.redirect('back');
        } catch (err) {
            console.error('Erro ao adicionar palavra-chave:', err);
            res.status(500).send('Erro ao adicionar palavra-chave.');
        }
    },

    async postDelete(req, res) {
        try {
            const {projetoId, palavraChaveId} = req.body;

            if(!projetoId || !palavraChaveId) {
                return res.status(400).send('Projeto ou palavra-chave inválidos.');
            }

            await db.PalavraChaveProjeto.destroy({
                where: {projetoId, palavraChaveId}
            });

            res.redirect('back');
        } catch (err) {
            console.error('Erro ao remover vínculo:', err);
            res.status(500).send('Erro ao remover vínculo.');
        }
    }
}