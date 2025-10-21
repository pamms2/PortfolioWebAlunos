const db = require('../config/db_sequelize');
const { Op } = require('sequelize');

module.exports = {
    //renderizar a página de cadastro de projeto
    async getCreate(req, res) {
        try {
            const alunos = await db.Usuario.findAll({
                where: { tipo: 'aluno' },
                attributes: ['id', 'nome']
            });

            const palavras = await db.PalavraChave.findAll({
                order: [['palavra', 'ASC']],
                attributes: ['id', 'palavra']
            });

            res.render('projeto/cadastrarProjeto', {
                alunos,
                palavras: palavras.map(p => p.toJSON())
            });
        } catch (err) {
            console.error('Erro ao carregar página de cadastro:', err);
            res.status(500).send('Erro ao carregar página de cadastro');
        }
    },

    //criar projeto
    async postCreate(req, res) {
        try {
            const { nome, resumo, link, alunosId, palavrasChave } = req.body;
            
            const projeto = await db.Projeto.create({ nome, resumo, link });
            const usuarioId = req.session.usuarioId;
            const desenvolvedores = [usuarioId];

            if (alunosId) {
                const ids = Array.isArray(alunosId)
                    ? alunosId.map(Number).filter(id => !isNaN(id) && id > 0)
                    : [Number(alunosId)].filter(id => !isNaN(id) && id > 0);

                for (let id of ids) {
                    if (!desenvolvedores.includes(id)) desenvolvedores.push(id);
                }
            }

            await projeto.setUsuarios(desenvolvedores);

            if (palavrasChave && palavrasChave.length > 0) {
            const palavrasArray = Array.isArray(palavrasChave)
                ? palavrasChave.map(Number)
                : [Number(palavrasChave)];

            await projeto.setPalavraChaves(palavrasArray);
            }

            res.redirect('/principal');
        } catch (err) {
            console.error('Erro ao criar projeto:', err);
            res.status(500).send('Erro ao criar projeto');
        }
    },

    //listar TODOS projetos 
    async getList(req, res) {
        try {
            const projetos = await db.Projeto.findAll({
                include: [
                    {
                        model: db.Usuario,
                        as: 'Usuarios',        // <--- necessário
                        attributes: ['id', 'nome'],
                        through: { attributes: [] }
                    },
                    {
                        model: db.PalavraChave,
                        as: 'PalavrasChave',   // <--- necessário
                        attributes: ['id', 'palavra'],
                        through: { attributes: [] }
                    }
                ],
                order: [['id', 'DESC']]
            });

            const projetosFormatados = projetos.map(p => {
                const proj = p.toJSON();
                proj.palavrasChave = proj.PalavrasChave
                    ? proj.PalavrasChave.map(pc => pc.palavra).join(', ')
                    : '';
                return proj;
            });

            res.render('projeto/listarProjeto', {
                projetos: projetosFormatados
            });
        } catch (err) {
            console.error('Erro ao listar projetos', err);
            res.status(500).send("Erro ao listar projeto");
        }
    },

    //renderizar página de atualização
    async getUpdate(req, res) {
        try {
            const projeto = await db.Projeto.findByPk(req.params.id, {
                include: [
                    { model: db.Usuario, as: 'Usuarios', attributes: ['id', 'nome', 'login'] },
                    { model: db.PalavraChave, as: 'PalavrasChave', attributes: ['id', 'palavra'] }
                ]
            });

            if (!projeto) return res.status(404).send('Projeto não encontrado');

            const alunos = await db.Usuario.findAll({
                where: { tipo: 'aluno' },
                attributes: ['id', 'nome', 'login']
            });

            const palavras = await db.PalavraChave.findAll({
                attributes: ['id', 'palavra'],
                order: [['palavra', 'ASC']]
            });

            const projetoJSON = projeto.toJSON();

            // Ajuste nomes dos arrays
            const alunosVinculados = projetoJSON.Usuarios?.map(u => ({ id: u.id, nome: u.nome })) || [];
            const vinculadas = projetoJSON.PalavrasChave?.map(p => ({ id: p.id, palavra: p.palavra })) || [];

            console.log('================ DEBUG EDITAR PROJETO ================');
            console.log('Projeto:', projetoJSON);
            console.log('Alunos vinculados:', alunosVinculados);
            console.log('Palavras vinculadas:', vinculadas);
            console.log('======================================================');

            res.render('projeto/editarProjeto', {
                projeto: projetoJSON,
                alunos,
                alunosVinculados,
                palavras: palavras.map(p => p.toJSON()),
                vinculadas
            });

        } catch (err) {
            console.error('Erro ao carregar o projeto:', err);
            res.status(500).send('Erro ao carregar o projeto');
        }
    },

    //atualizar projeto
    async postUpdate(req, res) {
        try {
            const { id, nome, resumo, link, alunosId, palavrasChave } = req.body;
            const usuarioId = req.session.usuarioId;

            const projeto = await db.Projeto.findByPk(id, {
                include: [{ model: db.Usuario, attributes: ['id'] }]
            });

            if (!projeto) return res.status(404).send('Projeto não encontrado');

            const usuariosDoProjeto = projeto.usuarios || [];
            const ehDesenvolvedor = usuariosDoProjeto.some(u => u.id === usuarioId);
            if (!ehDesenvolvedor) return res.status(403).send('Sem permissão para editar este projeto.');

            await projeto.update({ nome, resumo, link });

            // Atualiza usuários associados
            let usuariosAssociados = [usuarioId];
            if (alunosId) {
                const ids = Array.isArray(alunosId)
                    ? alunosId.map(Number).filter(id => !isNaN(id) && id > 0)
                    : [Number(alunosId)].filter(id => !isNaN(id) && id > 0);

                ids.forEach(id => {
                    if (!usuariosAssociados.includes(id)) usuariosAssociados.push(id);
                });
            }

            await projeto.setUsuarios(usuariosAssociados);

            // Atualiza palavras-chave
            if (palavrasChave) {
                const palavrasArray = Array.isArray(palavrasChave)
                    ? palavrasChave.map(Number)
                    : [Number(palavrasChave)];
                await projeto.setPalavraChaves(palavrasArray);
            }

            res.redirect('/listarProjeto');
        } catch (err) {
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
                include: [{ model: db.Usuario, attributes: ['id'] }]
            });

            if (!projeto) return res.status(404).send('Projeto não encontrado');

            const ehDesenvolvedor = projeto.Usuarios.some(u => u.id === usuarioId);
            if (!ehDesenvolvedor && tipo !== 'admin') return res.status(403).send('Sem permissão para excluir este projeto.');

            await projeto.destroy();
            res.redirect('/principal');
        } catch (err) {
            console.error('Erro ao deletar projeto:', err);
            res.status(500).send('Erro ao deletar projeto');
        }
    }
}