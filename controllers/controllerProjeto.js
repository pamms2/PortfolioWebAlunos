const db = require('../config/db_sequelize');
const { Op } = require('sequelize');

module.exports = {
    //renderizar a página de cadastro de projeto
    async getCreate(req, res) {
        try {
            const alunos = await db.Usuario.findAll({
                where: {tipo: 'aluno'},
                attributes: ['id', 'nome']
            });
            res.render('projeto/cadastrarProjeto', {alunos});
        } catch(err) {
            console.error('Erro ao carregar página de cadastro:', err);
            res.status(500).send('Erro ao carregar página de cadastro');
        }
    },

    //criar projeto
    async postCreate(req, res) {
        try {
            const {nome, resumo, link, alunosId} = req.body;
            const usuarioId = req.session.usuarioId; //aluno logado

            if(!usuarioId) {
                return res.status(401).send('Usuário não autenticado');
            }

            const projeto = await db.Projeto.create({nome, resumo, link});
            const desenvolvedores = [usuarioId];

            if(alunosId) {
                let ids = [];
                if(Array.isArray(alunosId)) {
                    ids = alunosId.map(function(item) {
                        return Number(item);
                    });
                } else {
                    ids = [Number(alunosIds)];
                }
                
                for(let i = 0; i < ids.length; i++) {
                    const id = ids[i];
                    if(!desenvolvedores.includes(id)) {
                        desenvolvedores.push(id);
                    }
                }
                await projeto.setUsuarios(desenvolvedores);
                res.redirect('/principal');
            }
        } catch(err) {
            console.error('Erro ao criar um novo projeto:', err);
            res.status(500).send('Erro ao criar projeto');
        }
    },

    //listar projetos TODOS
    async getList(req, res) {
        try {
            const projetos = await db.Projeto.findAll({
                include: [
                    {
                        model: db.Usuario,
                        attributes: ['id', 'nome'],
                        through: {attributes: []}
                    }
                ],
                order: [['id', 'DESC']]
            });

            res.render('projeto/listarProjeto', {
                projetos: projetos.map(p => p.toJSON())
            });
        } catch(err) {
            console.error('Erro ao listar projetos', err);
            res.status(500).send("Erro ao listar projeto");
        }
    },

    //listar projetos de um aluno específico
    async getByAluno(req, res) {
        try {
            const usuarioId = req.session.usuarioId || req.params.id;

            const usuario = await db.Usuario.findByPk(usuarioId, {
                include: [
                    {
                        model: db.Projeto,
                        include: [{ model: db.Usuario, attributes: ['id', 'nome'] }],
                        through: { attributes: [] }
                    }
                ]
            });

            if (!usuario) return res.status(404).send('Usuário não encontrado');

            res.render('usuario/visualizarUsuario', {
                usuario: usuario.toJSON(),
                projetos: usuario.projetos.map(p => p.toJSON())
            });
        } catch (err) {
            console.error('Erro ao carregar projetos do aluno:', err);
            res.status(500).send('Erro ao carregar projetos do aluno');
        }
    },

    //renderizar página de edição
    async postUpdate(req, res) {
        try {
            const {id, nome, resumo, link} = req.body;
            const usuarioId = req.session.usuarioId;
            const tipo = req.session.tipo;

            const projeto = await db.Projeto.findByPk(id, {
                include: [
                    {model: db.Usuario, where: {id: usuarioId}, required: false}
                ]
            });

            if(!projeto && tipo !== 'admin') {
                return res.status(403).send('Sem permissão para editar este projeto.');
            }

            await db.Projeto.update({nome, resumo, link}, {where: {id}});
            res.redirect('/visualizarLista');
        } catch(err) {
            console.error('Erro ao atualizar projeto:', err);
            res.status(500).send('Erro ao atualizar projeto');
        }
        
        
    },

    //excluir projeto
    async getDelete(req, res) {
        try {
            const projetoId = req.params.id;
            const usuarioId = req.session.usuarioId;
            const tipo = req.session.tipo;

            const projeto = await db.Projeto.findByPk(projetoId, {
                include: [
                    { model: db.Usuario, where: { id: usuarioId }, required: false }
                ]
            });

            if (!projeto && tipo !== 'admin') {
                return res.status(403).send('Sem permissão para excluir este projeto.');
            }

            await db.Projeto.destroy({ where: { id: projetoId } });
            res.redirect('/perfil');
        } catch (err) {
            console.error('Erro ao deletar projeto:', err);
            res.status(500).send('Erro ao deletar projeto');
        }
    }
}