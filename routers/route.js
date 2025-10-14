const express = require('express');
const db = require('../config/db_sequelize');
const controllerUsuario = require('../controllers/controllerUsuario');
const controllerProjeto = require('../controllers/controllerProjeto');
const controllerPalavraChave = require('../controllers/controllerPalavraChave'); 
const multer = require('multer');
const route = express.Router();

/*db.sequelize.sync({force: true}).then(() => {
    console.log('{ force: true }');
});*/
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
route.get("/cadastrarUsuario", controllerUsuario.getCreate);
route.post("/cadastrarUsuario", controllerUsuario.postCreate);
route.get("/listarUsuario", controllerUsuario.getList);
route.get("/editarUsuario/:id", controllerUsuario.getUpdate);
route.post("/editarUsuario", controllerUsuario.postUpdate);
route.get("/excluirUsuario/:id", controllerUsuario.getDelete);
route.get("/visualizarUsuario", controllerUsuario.getByAluno);
route.get("/visualizarUsuario/:id", controllerUsuario.getByAluno);

// Controller Projeto
route.get("/cadastrarProjeto", controllerProjeto.getCreate);
route.post("/cadastrarProjeto", controllerProjeto.postCreate); 
route.get("/listarProjeto", controllerProjeto.getList);
route.get("/editarProjeto/:id", controllerProjeto.getUpdate);
route.post("/editarProjeto", controllerProjeto.postUpdate);
route.get("/excluirProjeto/:id", controllerProjeto.getDelete);
//route.get("/visualizarProjeto/:id", controllerProjeto.getDelete);

// Controller Palavra-Chave
route.get('/cadastrarPalavraChave', controllerPalavraChave.getCreate);
route.post('/cadastrarPalavraChave', controllerPalavraChave.postCreate);
route.get('/listarPalavraChave', controllerPalavraChave.getList);
route.post('/editarPalavraChave', controllerPalavraChave.postUpdate);
route.get('/deletarPalavraChave/:id', controllerPalavraChave.getDelete);

module.exports = route;
