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
            const { palavra, pagina = 1 } = req.query; 
            const limite = 10;
            const offset = (pagina - 1) * limite;

            const filtro = {};

            if (palavra) {
                filtro.where = {
                    palavra: { [db.Sequelize.Op.iLike]: `%${palavra}%` } // busca parcial (case-insensitive dependendo do BD)
                };
            }

            const { count, rows } = await db.PalavraChave.findAndCountAll({
                ...filtro,
                order: [['id', 'DESC']],
                limit: limite,
                offset: offset
            });

            const totalPaginas = Math.ceil(count / limite);

            res.render('palavraChave/listarPalavraChave', {
                palavras: rows.map(p => p.toJSON()),
                filtroPalavra: palavra || '', // mantém o valor digitado no input
                paginaAtual: Number(pagina),
                totalPaginas
            });
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
