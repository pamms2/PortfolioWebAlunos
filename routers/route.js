const express = require('express');
const db = require('../config/db_sequelize');
const controllerUsuario = require('../controllers/controllerUsuario');
const controllerProjeto = require('../controllers/controllerProjeto');
const multer = require('multer');
const route = express.Router();

/*db.sequelize.sync({force: true}).then(() => {
    console.log('{ force: true }');
});*/
//db.Usuario.create({nome:'Administrador', login:'admin', senha:'1234', tipo:'admin'});


module.exports = route;
/*
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
 route.get("/home", function (req, res) {

    if (req.session.login) {
        res.render('home')
    }
    else
        res.redirect('/');
}); */

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

//Controller Projeto
route.get("/cadastrarProjeto", controllerProjeto.getCreate);
route.post("/listarProjeto", controllerProjeto.postCreate);
route.get("/listarProjeto", controllerProjeto.getList);
route.get("/editarProjeto/:id", controllerProjeto.getUpdate);
route.post("/editarProjeto", controllerProjeto.postUpdate);
route.get("/excluirProjeto/:id", controllerProjeto.getDelete);