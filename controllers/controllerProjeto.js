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
            
            let desenvolvedores = [usuarioId];

            if (alunosId) {
                const ids = Array.isArray(alunosId)
                    ? alunosId.map(Number).filter(id => !isNaN(id) && id > 0)
                    : [Number(alunosId)].filter(id => !isNaN(id) && id > 0);

                const idsUnicos = new Set([...desenvolvedores, ...ids]);
                desenvolvedores = [...idsUnicos]
            }

            await projeto.setUsuarios(desenvolvedores);

            if (palavrasChave && palavrasChave.length > 0) {
            const palavrasArray = (Array.isArray(palavrasChave) ? palavrasChave : [palavrasChave])
                .map(Number)
                .filter(id => !isNaN(id) && id > 0);

                const palavrasUnicas = [...new Set(palavrasArray)];
                await projeto.setPalavrasChave(palavrasArray);
            }

            res.redirect('/visualizarProjeto/' + projeto.id);
        } catch (err) {
            console.error('Erro ao criar projeto:', err);
            res.status(500).send('Erro ao criar projeto');
        }
    },

    //listar TODOS projetos 
    async getList(req, res) {
        try {
            const usuarioId = req.session.usuarioId;
            const { busca, palavraChave } = req.query;
            const pagina = parseInt(req.query.pagina, 10) || 1;
            const limite = 10; 
            const offset = (pagina - 1) * limite;

            const where = {};
            const include = [
                {
                    model: db.Usuario,
                    as: 'Usuarios',
                    attributes: ['id', 'nome', 'login'],
                    through: { attributes: [] },
                    required: false 
                },
                {
                    model: db.PalavraChave,
                    as: 'PalavrasChave',
                    attributes: ['id', 'palavra'],
                    through: { attributes: [] },
                    required: false 
                }
            ];

            if (busca && busca.trim() !== '') {
                const termo = `%${busca}%`;

                where[Op.or] = [
                    { nome: { [Op.iLike]: termo } },
                    { '$Usuarios.nome$': { [Op.iLike]: termo } },
                    { link: { [Op.iLike]: termo } }
                ];
            }

            if (palavraChave && palavraChave !== '') {
                include[1].where = { id: Number(palavraChave) };
                include[1].required = true; 
            }

            const { rows: projetos, count: totalItens } = await db.Projeto.findAndCountAll({
                where,
                include,
                order: [['nome', 'ASC']],
                distinct: true, 
                limit: limite,
                offset,
                col: 'id',
                subQuery: false
            });

            const palavras = (await db.PalavraChave.findAll({
                order: [['palavra', 'ASC']],
                attributes: ['id', 'palavra']
            })).map(p => p.toJSON());

            const totalPaginas = Math.ceil(totalItens / limite);

            const projetosFormatados = projetos.map(p => {
                const proj = p.toJSON();
                proj.palavrasChave = proj.PalavrasChave?.map(pc => pc.palavra).join(', ') || '';
                proj.desenvolvedores = proj.Usuarios?.map(u => u.nome).join(', ') || '';
                proj.ehDesenvolvedor = proj.Usuarios?.some(u => u.id === usuarioId);
                return proj;
            });

            res.render('projeto/listarProjeto', {
                projetos: projetosFormatados,
                palavras,
                filtroBusca: busca || '',
                filtroPalavra: palavraChave || '',

                paginaAtual: pagina,
                totalPaginas
            });

        } catch (err) {
            console.error('Erro ao listar projetos', err);
            res.status(500).send("Erro ao listar projeto");
        }
    },

    //Listar um Projeto
    async getByProjeto(req, res) {
        try {
            const projeto = await db.Projeto.findByPk(req.params.id, {
                include: [
                    { 
                        model: db.Usuario, 
                        as: 'Usuarios',      // Estes são os 'Colaboradores'
                        attributes: ['id', 'nome', 'login'] 
                    },
                    { 
                        model: db.PalavraChave, 
                        as: 'PalavrasChave', // Estas são as 'Palavras-Chave'
                        attributes: ['id', 'palavra']
                    }
                ]
            });

            if (!projeto) {
                return res.status(404).send('Projeto não encontrado');
            }

            const projetoJSON = projeto.toJSON();

            // Vamos formatar os dados para o Handlebars usar
            const palavrasChaveFormatadas = projetoJSON.PalavrasChave 
                ? projetoJSON.PalavrasChave.map(p => p.palavra) // Um array de strings
                : [];

            const colaboradores = projetoJSON.Usuarios 
                ? projetoJSON.Usuarios.map(u => ({ id: u.id, nome: u.nome })) // Um array de objetos
                : [];

            // Renderiza a nova view
            res.render('projeto/visualizarProjeto', { 
                projeto: projetoJSON,
                palavrasChave: palavrasChaveFormatadas,
                colaboradores: colaboradores
            });

        } catch (err) {
            console.error('Erro ao carregar o projeto:', err);
            res.status(500).send('Erro ao carregar o projeto');
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

            const alunosVinculados = projetoJSON.Usuarios?.map(u => ({ id: u.id, nome: u.nome })) || [];
            const vinculadas = projetoJSON.PalavrasChave?.map(p => ({ id: p.id, palavra: p.palavra })) || [];

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
                include: [{ model: db.Usuario, as: 'Usuarios', attributes: ['id'] }]
            });

            if (!projeto) return res.status(404).send('Projeto não encontrado');

            const usuariosDoProjeto = projeto.Usuarios || [];
            const ehDesenvolvedor = usuariosDoProjeto.some(u => u.id === usuarioId);
            if (!ehDesenvolvedor) return res.status(403).send('Sem permissão para editar este projeto.');

            await projeto.update({ nome, resumo, link });

            // Atualiza usuários associados (mantendo o editor sempre)
            let usuariosAssociados = [usuarioId];

            if (alunosId && alunosId.length > 0) {
                const ids = Array.isArray(alunosId)
                    ? alunosId.map(Number).filter(id => !isNaN(id) && id > 0 && id !== usuarioId)
                    : [Number(alunosId)].filter(id => !isNaN(id) && id > 0 && id !== usuarioId);

                usuariosAssociados.push(...ids);
            }

            await projeto.setUsuarios(usuariosAssociados);

            // Atualiza palavras-chave
            if (palavrasChave) {
                const palavrasArray = Array.isArray(palavrasChave)
                    ? palavrasChave.map(Number)
                    : [Number(palavrasChave)];
                await projeto.setPalavrasChave(palavrasArray);
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
                include: [{ model: db.Usuario, as: 'Usuarios', attributes: ['id'] }]
            });

            if (!projeto) return res.status(404).send('Projeto não encontrado');

            const ehDesenvolvedor = projeto.Usuarios.some(u => u.id === usuarioId);
            if (!ehDesenvolvedor && tipo !== 'admin') return res.status(403).send('Sem permissão para excluir este projeto.');

            await projeto.destroy();
            res.redirect('/listarProjeto');
        } catch (err) {
            console.error('Erro ao deletar projeto:', err);
            res.status(500).send('Erro ao deletar projeto');
        }
    }
}