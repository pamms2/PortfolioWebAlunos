const db = require('../config/db_sequelize');

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
    }
}