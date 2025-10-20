const express = require('express');
const db = require('../config/db_sequelize');
const middleware = require('../middlewares/middleware');
const controllerUsuario = require('../controllers/controllerUsuario');
const controllerProjeto = require('../controllers/controllerProjeto');
const controllerPalavraChave = require('../controllers/controllerPalavraChave'); 
const controllerConhecimento = require('../controllers/controllerConhecimento');
const multer = require('multer');
const controllerUsuarioConhecimento = require('../controllers/controllerUsuarioConhecimento');
const route = express.Router();

// db.sequelize.sync({force: true}).then(() => {
//     console.log('{ force: true }');
// })
//db.Usuario.create({nome:'Administrador', login:'admin', senha:'1234', tipo:'admin'});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null,  "public/uploads/");
    },
    filename: (req, file, cb) => {
        req.imageName = req.body.nome + '.png'
        cb(null, req.imageName)
    },
})
const upload = multer({ storage: storage });

//Home
route.get("/home", (req, res) => {
    if (req.session.login) res.render('home');
    else res.redirect('/');
});

//principal
route.get('/principal', async (req, res) => {
    try {
        const projetos = await db.Projeto.findAll({
            include: [
                { model: db.Usuario, attributes: ['id', 'nome'], through: { attributes: [] } }
            ],
            order: [['id', 'DESC']]
        });

        res.render('layouts/principal', {
            usuarioLogado: req.session.usuarioId ? {
                id: req.session.usuarioId,
                login: req.session.login,
                tipo: req.session.tipo
            } : null,
            projetos: projetos.map(p => p.toJSON())
        });
    } catch (err) {
        console.error('Erro ao carregar a página principal:', err);
        res.status(500).send('Erro ao carregar a página principal');
    }
});

//Controller Usuario
route.get("/", controllerUsuario.getLogin);
route.post("/login", controllerUsuario.postLogin);
route.get("/logout", controllerUsuario.getLogout);
route.get("/cadastrarUsuario", middleware.requireAdmin, controllerUsuario.getCreate);
route.post("/cadastrarUsuario", middleware.requireAdmin, controllerUsuario.postCreate);
route.get("/listarUsuario", middleware.requireAdmin, controllerUsuario.getList);
route.get("/editarUsuario/:id", middleware.requireAdmin, controllerUsuario.getUpdate);
route.post("/editarUsuario", middleware.requireAdmin, controllerUsuario.postUpdate);
route.get("/excluirUsuario/:id", middleware.requireAdmin, controllerUsuario.getDelete);
route.get("/visualizarUsuario", controllerUsuario.getByAluno);
route.get("/visualizarUsuario/:id", controllerUsuario.getByAluno);

// Controller Projeto
route.get("/cadastrarProjeto", middleware.requireAluno, controllerProjeto.getCreate);
route.post("/cadastrarProjeto", middleware.requireAluno, controllerProjeto.postCreate); 
route.get("/listarProjeto", controllerProjeto.getList);
route.get("/editarProjeto/:id", middleware.requireAluno, controllerProjeto.getUpdate);
route.post("/editarProjeto", middleware.requireAluno, controllerProjeto.postUpdate);
route.get("/excluirProjeto/:id", middleware.requireAluno, controllerProjeto.getDelete);

// Controller Palavra-Chave
route.get('/cadastrarPalavraChave', middleware.requireAdmin, controllerPalavraChave.getCreate);
route.post('/cadastrarPalavraChave', middleware.requireAdmin, controllerPalavraChave.postCreate);
route.get('/listarPalavraChave', controllerPalavraChave.getList);
route.get('/editarPalavraChave/:id', middleware.requireAdmin, controllerPalavraChave.getUpdate);
route.post('/editarPalavraChave', middleware.requireAdmin, controllerPalavraChave.postUpdate);
route.get('/deletarPalavraChave/:id',  middleware.requireAdmin, controllerPalavraChave.getDelete);

// Controller Conhecimento
route.get('/cadastrarConhecimento', middleware.requireAdmin, controllerConhecimento.getCreate);
route.post('/cadastrarConhecimento', middleware.requireAdmin, controllerConhecimento.postCreate);
route.get('/listarConhecimento', controllerConhecimento.getList);
route.get('/editarConhecimento/:id', middleware.requireAdmin, controllerConhecimento.getUpdate);
route.post('/editarConhecimento', middleware.requireAdmin, controllerConhecimento.postUpdate);
route.get('/deletarConhecimento/:id', middleware.requireAdmin, controllerConhecimento.getDelete);

//Controller UsuarioConhecimento
route.post("/vincularConhecimento", controllerUsuarioConhecimento.postCreate);
route.post("/editarVinculoConhecimento", controllerUsuarioConhecimento.postUpdate);
route.post("/excluirVinculoConhecimento", controllerUsuarioConhecimento.postDelete);

module.exports = route;
