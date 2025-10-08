const db = require('../config/db_sequelize');
const { Op } = require('sequelize');

module.exports = {
    //renderiza a página de login
    async getLogin(req, res) {
        res.render('usuario/login', {layout: 'noMenu.handlebars'});
    },

    //desconexão da conta
    async getLogout(req, res) {
        res.cookie('userData', req.cookies.userData, {maxAge: 0, httpOnly: true});
        req.session.destroy();
        res.redirect('/');
    },

    //conexão com a conta
    async postLogin(req, res) {
        try {
            const{email, senha} = req.body;
            const usuario = await db.Usuario.findOne({where: {email, senha}});

            //usuário válido
            if(usuario) {
                req.session.login = usuario.nome;
                req.session.tipo = usuario.tipo;

                res.cookie('userData', {nome: usuario.nome, tipo: usuario.tipo}, {
                    maxAge: 30 * 60 * 1000,
                    httpOnly: true
                });

                res.locals.login = usuario.nome;
                res.locals.admin = (usuario.tipo === 'admin');

                res.redirect('/home');

            //usuário inválido
            } else {
                res.redirect('/');
            }
        } catch(err) {
            console.error('Erro no login:', err);
            res.redirect('/');
        }
    },

    //renderiza a página de criação de conta
    async getCreate(req, res) {
        try {
            const tipos = db.Usuario.rawAttributes.tipo.values;
            res.render('usuario/criacaoUsuario', { tipos });
        } catch (err) {
            console.error(err);
            res.status(500).send('Erro ao carregar a página de criação');
        }
    },

    //cria conta
    async postCreate(req, res) {
        try {
            await db.Usuario.create(req.body);
            res.redirect('/listaUsuarios');
        } catch (err) {
            console.error(err);
            res.status(500).send('Erro ao criar usuário');
        }
    },

    //listar usuários com filtros e paginação
    async getList(req, res) {
        try {
            const nome = (req.query.nome || '').trim();
            const tipo = (req.query.tipo || '').trim();
            const email = (req.query.email || '').trim();
            const pagina = parseInt(req.query.page, 10) || 1;
            const limite = 5;
            const offset = (pagina - 1) * limite;

            const where = {};
            const dialect = db.sequelize && db.sequelize.getDialect ? db.sequelize.getDialect() : null;
            const nameOp = (dialect === 'postgres') ? Op.iLike : Op.like;

            if (nome) where.nome = { [nameOp]: `%${nome}%` };
            if (tipo) where.tipo = tipo; 
            if (email) where.email = { [nameOp]: `%${email}%` };

            const tipos = db.Usuario.rawAttributes.tipo.values; 

            const { rows: usuariosRaw, count: totalItens } = await db.Usuario.findAndCountAll({
                where,
                limit: limite,
                offset,
                order: [['nome', 'ASC']]
            });

            const usuarios = usuariosRaw.map(u => u.toJSON());
            const totalPaginas = Math.ceil(totalItens / limite);

            res.render('usuario/listaUsuarios', {
                usuarios,
                tipos,
                filtroNome: nome,
                filtroTipo: tipo,
                filtroEmail: email,
                paginaAtual: pagina,
                totalPaginas
            });
        } catch (err) {
            console.error(err);
            res.status(500).send('Erro ao listar usuários');
        }
    },

    //renderiza página de edição
    async getUpdate(req, res) {
        try {
            const usuario = await db.Usuario.findByPk(req.params.id);
            if (!usuario) return res.status(404).send('Usuário não encontrado');

            const tipos = db.Usuario.rawAttributes.tipo.values;
            res.render('usuario/EdicaoUsuario', { usuario: usuario.toJSON(), tipos });
        } catch (err) {
            console.error(err);
            res.status(500).send('Erro ao carregar o usuário');
        }
    },

    //atualiza usuário
    async postUpdate(req, res) {
        try {
            await db.Usuario.update(req.body, { where: { id: req.body.id } });
            res.redirect('/listaUsuarios');
        } catch (err) {
            console.error(err);
            res.status(500).send('Erro ao atualizar usuário');
        }
    },

    //deleta usuário
    async getDelete(req, res) {
        try {
            await db.Usuario.destroy({ where: { id: req.params.id } });
            res.redirect('/listaUsuarios');
        } catch (err) {
            console.error(err);
            res.status(500).send('Erro ao deletar usuário');
        }
    }
};