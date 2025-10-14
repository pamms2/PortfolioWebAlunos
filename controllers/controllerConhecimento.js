const db = require('../config/db_sequelize');

module.exports = {
    //renderizar página de cadastro
    async getCreate(req, res) {
        try {
            res.render('conhecimento/cadastrarConhecimento');
        } catch (err) {
            console.error('Erro ao carregar página de cadastro de conhecimento:', err);
            res.status(500).send('Erro ao carregar página de cadastro de conhecimento');
        }
    },

    //criar conhecimento
    async postCreate(req, res) {
        try {
            const {usuarioId, tipo} = req.session;
            if(!usuarioId || tipo !== 'admin') {
                return res.status(403).send("Somente administradores logados podem cadastrar conhecimentos.");
            }

            const {titulo} = req.body;
            await db.Conhecimento.create({titulo});
            res.redirect('/listarConhecimento');
        } catch (err) {
            console.error('Erro ao cadastrar conhecimento:', err);
            res.status(500).send('Erro ao cadastrar conhecimento');
        }
    },

    //listar conhecimentos
    async getList(req, res) {
        try {
            const conhecimentos = await db.Conhecimento.findAll({order: [['id', 'DESC']]});
            res.render('conhecimento/listarConhecimento', {conhec: conhecimentos.map(c => c.toJSON())});
        } catch (err) {
            console.error('Erro ao listar conhecimentos:', err);
            res.status(500).send('Erro ao listar conhecimentos');
        }
    },

    //renderizar página de edição
    async getUpdate(req, res) {
        try {
            const conhecimento = await db.Conhecimento.findByPk(req.params.id);
            if(!conhecimento) return res.status(404).send('Conhecimento não encontrado');
            res.render('conhecimento/editarConhecimento', {conhecimento: conhecimento.toJSON()});
        } catch (err) {
            console.error('Erro ao carregar página de edição de conhecimento:', err);
            res.status(500).send('Erro ao carregar página de edição de conhecimento');
        }
    },

    //editar conhecimento
    async postUpdate(req, res) {
        try {
            const {id, titulo} = req.body;
            const {usuarioId, tipo} = req.session;
            if(!usuarioId || tipo !== 'admin') {
                return res.status(403).send("Somente administradores logados podem atualizar conhecimentos.");
            }

            await db.Conhecimento.update({titulo }, {where: {id}});
            res.redirect('/listarConhecimento');
        } catch (err) {
            console.error('Erro ao atualizar conhecimento:', err);
            res.status(500).send('Erro ao atualizar conhecimento');
        }
    },

    //deletar conhecimento
    async getDelete(req, res) {
        try {
            await db.Conhecimento.destroy({where: {id: req.params.id}});
            res.redirect('/listarConhecimento');
        } catch (err) {
            console.error('Erro ao deletar conhecimento:', err);
            res.status(500).send('Erro ao deletar conhecimento');
        }
    }
};