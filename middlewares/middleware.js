module.exports = {
    //log simples de requisições
    logRegister(req, res, next) {
        console.log(req.url + req.method + new Date())
        next();
    },
    
    //garante que a sessão (se existir) fique acessível às views
    exposeSession(req, res, next) {
        res.locals.login = req.session.login || null;
        res.locals.tipo = req.session.tipo || null;
        res.locals.admin = req.session.tipo === 'admin';
        res.locals.aluno = req.session.tipo === 'aluno';
        next();
    },

    //usuários logados
    requireLogin(req, res, next) {
        if(req.session && req.session.login) {
            return next();
        }
        res.redirect('/');
    },

    //apenas administradores
    requireAdmin(req, res, next) {
        if(req.session && req.session.tipo === 'admin') {
            return next();
        }
        res.status(403).send('Acesso restrito aos administradores.');
    },

    //apenas alunos
    requireAluno(req, res, next) {
        if(req.session && req.session.tipo === 'aluno') {
            return next();
        }
        res.status(403).send('Acesso restrito aos alunos.');
    }
};