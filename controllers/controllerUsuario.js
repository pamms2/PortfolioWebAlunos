const db = require('../config/db_sequelize');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = {
    //renderiza a página de login
    async getLogin(req, res) {
        res.render('usuario/login', {layout: 'noMenu.handlebars'});
    },

    //desconexão da conta
    async getLogout(req, res) {
        req.session.destroy((err) => {
            if (err) console.error('Erro ao destruir sessão:', err);
            res.clearCookie('connect.sid'); // 🟢 limpa o cookie da sessão
            res.redirect('/');
        });
    },

    //conexão com a conta
    async postLogin(req, res) {
        try {
            const{login, senha} = req.body;

            const usuario = await db.Usuario.findOne({where: {login}});

            //usuário não encontrado
            if(!usuario) {
                console.log('Usuário não encontrado');
                return res.redirect('/');
            }

            const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

            if (!senhaCorreta) {
                console.log('Senha incorreta');
                return res.redirect('/');
            }

            //login bem-sucedido
            req.session.usuarioId = usuario.id;
            req.session.login = usuario.login;
            req.session.tipo = usuario.tipo;

            res.cookie('userData', JSON.stringify({ nome: usuario.nome, tipo: usuario.tipo }), {
                maxAge: 30 * 60 * 1000,
                httpOnly: true
            });

            res.locals.login = usuario.nome;
            res.locals.admin = (usuario.tipo === 'admin');

            res.redirect('/home');
        } catch(err) {
            console.error('Erro no login:', err);
            res.redirect('/');
        }
    },

    //renderiza a página de criação de conta
    async getCreate(req, res) {
        try {
            const tipos = db.Usuario.rawAttributes.tipo.values;
            res.render('usuario/cadastrarUsuario', { tipos });
        } catch (err) {
            console.error(err);
            res.status(500).send('Erro ao carregar a página de criação');
        }
    },

    //cria conta
    async postCreate(req, res) {
        try {
            const { nome, login, senha, tipo } = req.body;
            const hashSenha = await bcrypt.hash(senha, 10);

            await db.Usuario.create({
                nome,
                login,
                senha: hashSenha,
                tipo
            });

            res.redirect('/listarUsuario');
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
            const login = (req.query.login || '').trim();
            const pagina = parseInt(req.query.page, 10) || 1;
            const limite = 5;
            const offset = (pagina - 1) * limite;

            const where = {};
            const dialect = db.sequelize && db.sequelize.getDialect ? db.sequelize.getDialect() : null;
            const nameOp = (dialect === 'postgres') ? Op.iLike : Op.like;

            if (nome) where.nome = { [nameOp]: `%${nome}%` };
            if (tipo) where.tipo = tipo;
            if (login) where.login = { [nameOp]: `%${login}%`};

            const tipos = db.Usuario.rawAttributes.tipo.values;

            const { rows: usuariosRaw, count: totalItens } = await db.Usuario.findAndCountAll({
                where,
                limit: limite,
                offset,
                order: [['nome', 'ASC']]
            });

            const usuarios = usuariosRaw.map(u => u.toJSON());
            const totalPaginas = Math.ceil(totalItens / limite);

            res.render('usuario/listarUsuario', {
                usuarios,
                tipos,
                filtroNome: nome,
                filtroTipo: tipo,
                filtroLogin: login,
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
            res.render('usuario/editarUsuario', { usuario: usuario.toJSON(), tipos });
        } catch (err) {
            console.error(err);
            res.status(500).send('Erro ao carregar o usuário');
        }
    },

    //atualiza usuário
    async postUpdate(req, res) {
        try {
            const { id, nome, login, senha, tipo } = req.body;
            const updateData = { nome, login, tipo };

            if (senha && senha.trim() !== '') {
                updateData.senha = await bcrypt.hash(senha, 10);
            }

            await db.Usuario.update(updateData, { where: { id } });
            res.redirect('/listarUsuario');
        } catch (err) {
            console.error(err);
            res.status(500).send('Erro ao atualizar usuário');
        }
    },

    //deleta usuário
    async getDelete(req, res) {
        try {
            await db.Usuario.destroy({ where: { id: req.params.id } });
            res.redirect('/listarUsuario');
        } catch (err) {
            console.error(err);
            res.status(500).send('Erro ao deletar usuário');
        }
    }
};