const db = require('../config/db_sequelize');
const { Op } = require('sequelize');

module.exports = {
    async getList(req, res) {
        try {
            const projetos = await db.Projeto.findAll({
                include: [
                    {
                        model: db.Usuario,
                        attributes: ['id', 'nome'],
                        through: { attributes: [] } // remove dados da tabela de junção
                    }
                ],
                order: [['id', 'DESC']]
            });

            const projetosFormatados = projetos.map(p => {
                const proj = p.toJSON();
                proj.usuarios = proj.Usuarios ? proj.Usuarios.map(u => u.nome).join(', ') : '';
                return proj;
            });

            res.render('usuarioProjeto/listar', { projetos: projetosFormatados });
        } catch (err) {
            console.error('Erro ao listar usuários: ', err);
            res.status(500).send("Erro ao listar usuários.");
        }
    },

    async postCreate(req, res) {
        try {
            const { projetoId, usuarioId } = req.body;

            if(!projetoId || !usuarioId) {
                return res.status(400).send('Projeto ou usuário inválidos.');
            }

            await db.UsuarioProjeto.create({
                projetoId,
                usuarioId
            });

            res.redirect('back');
        } catch (err) {
            console.error('Erro ao adicionar usuário:', err);
            res.status(500).send('Erro ao adicionar usuário');
        }
    },

    async postDelete(req, res) {
        try {
            const { projetoId, usuarioId } = req.body;

            if(!projetoId || !usuarioId) {
                return res.status(400).send('Projeto ou usuário inválidos.');
            }

            await db.UsuarioProjeto.destroy({
                where: { projetoId, usuarioId }
            });

            res.redirect('back');
        } catch (err) {
            console.error('Erro ao remover vínculo:', err);
            res.status(500).send('Erro ao remover vínculo.');
        }
    }
}