const db = require('../config/db_sequelize');

module.exports = {
    //renderizar página de cadastro
    async getCreate(req, res) {
        try {
            res.render('palavraChave/cadastrarPalavraChave');
        } catch (err) {
            console.error('Erro ao carregar página de cadastro de palavra-chave:', err);
            res.status(500).send('Erro ao carregar página de cadastro de palavra-chave');
        }
    },

    //criar palavra-chave
    async postCreate(req, res) {
        try {
            const {palavra} = req.body;
            await db.PalavraChave.create({palavra});
            res.redirect('/listarPalavraChave');
        } catch (err) {
            console.error('Erro ao cadastrar palavra-chave:', err);
            res.status(500).send('Erro ao cadastrar palavra-chave');
        }
    },

    //listar palavras-chave
    async getList(req, res) {
        try {
            const palavrasChave = await db.PalavraChave.findAll({order: [['id', 'DESC']]});
            res.render('palavraChave/listarPalavraChave', {palavras: palavrasChave.map(p => p.toJSON())});
        } catch (err) {
            console.error('Erro ao listar palavras-chave:', err);
            res.status(500).send('Erro ao listar palavras-chave');
        }
    },

    //renderizar página de edição
    async getUpdate(req, res) {
        try {
            const palavraChave = await db.PalavraChave.findByPk(req.params.id);
            if(!palavraChave) return res.status(404).send('Palavra-chave não encontrada');
            res.render('palavraChave/editarPalavraChave', {palavraChave: palavraChave.toJSON()});
        } catch (err) {
            console.error('Erro ao carregar página de edição de palavra-chave:', err);
            res.status(500).send('Erro ao carregar página de edição de palavra-chave');
        }
    },

    //editar palavra-chave
    async postUpdate(req, res) {
        try {
            const {id, palavra} = req.body;
            await db.PalavraChave.update({palavra}, {where: { id }});
            res.redirect('/listarPalavraChave');
        } catch (err) {
            console.error('Erro ao atualizar palavra-chave:', err);
            res.status(500).send('Erro ao atualizar a palavra-chave');
        }
    },

    //deletar palavra-chave
    async getDelete(req, res) {
        try {
            await db.PalavraChave.destroy({where: {id: req.params.id}});
            res.redirect('/listarPalavraChave');
        } catch (err) {
            console.error('Erro ao deletar palavra-chave:', err);
            res.status(500).send('Erro ao deletar palavra-chave');
        }
    }
};
