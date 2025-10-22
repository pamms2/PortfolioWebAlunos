const db = require('../config/db_sequelize');
const { Op } = require('sequelize'); 

module.exports = {
    async getCreate(req, res) {
        try {
            res.render('conhecimento/cadastrarConhecimento');
        } catch (err) {
            console.error('Erro ao carregar página de cadastro de conhecimento:', err);
            res.status(500).send('Erro ao carregar página de cadastro de conhecimento');
        }
    },

    //criar conhecimento
    async postCreate(req, res) {
        try {
            const {usuarioId, tipo} = req.session;
            if(!usuarioId || tipo !== 'admin') {
                return res.status(403).send("Somente administradores logados podem cadastrar conhecimentos.");
            }

            const {titulo} = req.body;
            await db.Conhecimento.create({titulo});
            res.redirect('/listarConhecimento');
        } catch (err) {
            console.error('Erro ao cadastrar conhecimento:', err);
            res.status(500).send('Erro ao cadastrar conhecimento');
        }
    },

    //listar conhecimento
    async getList(req, res) {
        try {
            const { usuarioId, tipo } = req.session || {};
            const { titulo } = req.query;
            const pagina = parseInt(req.query.pagina, 10) || 1;
            const limite = 10;
            const offset = (pagina - 1) * limite;

            const whereConhecimento = {};
            if (titulo) {
                whereConhecimento.titulo = { [Op.iLike]: `%${titulo}%` };
            }

            const queryOptions = {
                where: whereConhecimento,
                limit: limite,
                offset: offset,
                order: [['titulo', 'ASC']],
                distinct: true,
                attributes: ['id', 'titulo'] 
            };

            // SE o usuário for externo
            if (tipo !== 'admin' && tipo !== 'aluno') {
                const subQuery = `(
                    SELECT COUNT(DISTINCT "uc"."usuarioId") 
                    FROM "usuarioConhecimento" AS "uc"
                    INNER JOIN "usuarios" AS "u" ON "u"."id" = "uc"."usuarioId"
                    WHERE "u"."tipo" = 'aluno' 
                    AND "uc"."conhecimentoId" = "conhecimento"."id"
                )`;
                
                queryOptions.attributes.push([
                    db.sequelize.literal(subQuery), 'totalAlunos'
                ]);
            }
           
            const { rows: conhecimentosRaw, count: totalItens } = await db.Conhecimento.findAndCountAll(queryOptions);

            let conhecimentos = conhecimentosRaw.map(c => {
                const json = c.toJSON();
                if (json.totalAlunos !== undefined) {
                    json.totalAlunos = parseInt(json.totalAlunos, 10);
                }
                return json;
            });
            
            const totalPaginas = Math.ceil(totalItens / limite);

            // SE for aluno
            if (tipo === 'aluno') {
                const conhecimentoIds = conhecimentos.map(c => c.id);
                const meusVinculos = await db.UsuarioConhecimento.findAll({
                    where: {
                        usuarioId: usuarioId,
                        conhecimentoId: { [Op.in]: conhecimentoIds }
                    }
                });

                const vinculoMap = new Map();
                meusVinculos.forEach(v => vinculoMap.set(v.conhecimentoId, v.nivel));

                conhecimentos = conhecimentos.map(c => ({
                    ...c,
                    nivel: vinculoMap.get(c.id) || null
                }));
            }
            
            // Se for admin, não faz nada disso e só renderiza a lista simples

            res.render('conhecimento/listarConhecimento', {
                conhec: conhecimentos,
                filtroTitulo: titulo,
                paginaAtual: pagina,
                totalPaginas: totalPaginas,
                admin: (tipo === 'admin'),
                aluno: (tipo === 'aluno')
            });

        } catch (err) {
            console.error('Erro ao listar conhecimentos:', err);
            res.status(500).send('Erro ao listar conhecimentos');
        }
    },

    //renderizar página de edição
    async getUpdate(req, res) {
        try {
            const conhecimento = await db.Conhecimento.findByPk(req.params.id);
            if(!conhecimento) return res.status(404).send('Conhecimento não encontrado');
            res.render('conhecimento/editarConhecimento', {conhecimento: conhecimento.toJSON()});
        } catch (err) {
            console.error('Erro ao carregar página de edição de conhecimento:', err);
            res.status(500).send('Erro ao carregar página de edição de conhecimento');
        }
    },

    //editar conhecimento
    async postUpdate(req, res) {
        try {
            const {id, titulo} = req.body;
            const {usuarioId, tipo} = req.session;
            if(!usuarioId || tipo !== 'admin') {
                return res.status(403).send("Somente administradores logados podem atualizar conhecimentos.");
            }

            await db.Conhecimento.update({titulo }, {where: {id}});
            res.redirect('/listarConhecimento');
        } catch (err) {
            console.error('Erro ao atualizar conhecimento:', err);
            res.status(500).send('Erro ao atualizar conhecimento');
        }
    },

    //deletar conhecimento
    async getDelete(req, res) {
        try {
            await db.Conhecimento.destroy({where: {id: req.params.id}});
            res.redirect('/listarConhecimento');
        } catch (err) {
            console.error('Erro ao deletar conhecimento:', err);
            res.status(500).send('Erro ao deletar conhecimento');
        }
    }
};