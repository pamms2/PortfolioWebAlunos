const db = require('../config/db_sequelize');
const { Op } = require('sequelize');
// const bcrypt = require('bcryptjs');
const { postUpdate } = require('./controllerUsuario');

module.exports = {
    async getList(req, res) {
        try {
            const usuarioId = req.session.usuarioId;
            const tipo = req.session.tipo; // 'admin' ou 'aluno'

            // busca todos os conhecimentos
            const conhecimentos = await db.Conhecimento.findAll();

            // vínculos do usuário logado (caso seja aluno)
            let conhecimentosUsuario = [];
            if (tipo === 'aluno') {
                conhecimentosUsuario = await db.UsuarioConhecimento.findAll({
                    where: { usuarioId },
                    include: [{ model: db.Conhecimento }]
                });
            }

            // mapa pra relacionar conhecimentoId -> nível
            const mapaConhecimentos = {};
            conhecimentosUsuario.forEach(item => {
                mapaConhecimentos[item.conhecimentoId] = {
                    nivel: item.nivel
                };
            });

            // adiciona info de vínculo e contador de alunos
            const lista = await Promise.all(conhecimentos.map(async (c) => {
                // conta alunos que têm esse conhecimento
                const quantidadeAlunos = await db.UsuarioConhecimento.count({
                    where: { conhecimentoId: c.id }
                });

                return {
                    id: c.id,
                    titulo: c.titulo,
                    usuarioConhecimento: mapaConhecimentos[c.id] || null,
                    quantidadeAlunos
                };
            }));

            res.render('conhecimento/listarConhecimento', {
                conhec: lista,
                aluno: tipo === 'aluno',
                admin: tipo === 'admin'
            });
        } catch (err) {
            console.error('Erro ao listar conhecimentos:', err);
            res.status(500).send('Erro ao listar conhecimentos.');
        }
    },

    async postCreate(req, res) {
        try {
            const usuarioId = req.session.usuarioId;
            const { conhecimentoId, nivel } = req.body;

            await db.UsuarioConhecimento.create({
                usuarioId,
                conhecimentoId,
                nivel
            });

            res.redirect('/listarConhecimento');
        } catch (err) {
            console.error('Erro ao adicionar conhecimento:', err);
            res.status(500).send('Erro ao adicionar conhecimento.');
        }
    },

    async postUpdate(req, res) {
        try {
            const usuarioId = req.session.usuarioId;
            const { conhecimentoId, nivel } = req.body;

            await db.UsuarioConhecimento.update(
                { nivel },
                { where: { usuarioId, conhecimentoId } }
            );

            res.redirect('/listarConhecimento');
        } catch (err) {
            console.error('Erro ao atualizar nível:', err);
            res.status(500).send('Erro ao atualizar nível.');
        }
    },

    async postDelete(req, res) {
        try {
            const usuarioId = req.session.usuarioId;
            const { conhecimentoId } = req.body;

            await db.UsuarioConhecimento.destroy({
                where: { usuarioId, conhecimentoId }
            });

            res.redirect('/listarConhecimento');
        } catch (err) {
            console.error('Erro ao remover vínculo:', err);
            res.status(500).send('Erro ao remover vínculo.');
        }
    }
};
