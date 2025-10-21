const Sequelize = require('sequelize');
const sequelize = new Sequelize('dbProjeto', 'postgres', '1234', {
    host: 'localhost',
    dialect: 'postgres'
});

var db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Importando os modelos
db.Usuario = require('../models/relational/usuario.js')(sequelize, Sequelize);
db.Projeto = require('../models/relational/projeto.js')(sequelize, Sequelize);
db.PalavraChave = require('../models/relational/palavraChave.js')(sequelize, Sequelize);
db.Conhecimento = require('../models/relational/conhecimento.js')(sequelize, Sequelize);
db.UsuarioProjeto = require('../models/relational/usuarioProjeto.js')(sequelize, Sequelize);
db.PalavraChaveProjeto = require('../models/relational/palavraChaveProjeto.js')(sequelize, Sequelize);
db.UsuarioConhecimento = require('../models/relational/usuarioConhecimento.js')(sequelize, Sequelize);

// Relacionamentos

// N:M usuário <-> projeto
db.Usuario.belongsToMany(db.Projeto, {
    through: db.UsuarioProjeto,
    foreignKey: 'usuarioId',
    otherKey: 'projetoId',
    as: 'Projetos'
});
db.Projeto.belongsToMany(db.Usuario, {
    through: db.UsuarioProjeto,
    foreignKey: 'projetoId',
    otherKey: 'usuarioId',
    as: 'Usuarios'
});

// N:M palavra-chave <-> projeto
db.Projeto.belongsToMany(db.PalavraChave, {
    through: db.PalavraChaveProjeto,
    foreignKey: 'projetoId',
    otherKey: 'palavraChaveId',
    as: 'PalavrasChave'
});
db.PalavraChave.belongsToMany(db.Projeto, {
    through: db.PalavraChaveProjeto,
    foreignKey: 'palavraChaveId',
    otherKey: 'projetoId',
    as: 'Projetos'
});

// N:M conhecimento <-> usuário
db.Usuario.belongsToMany(db.Conhecimento, {
    through: db.UsuarioConhecimento,
    foreignKey: 'usuarioId',
    otherKey: 'conhecimentoId',
    as: 'Conhecimentos'
});
db.Conhecimento.belongsToMany(db.Usuario, {
    through: db.UsuarioConhecimento,
    foreignKey: 'conhecimentoId',
    otherKey: 'usuarioId',
    as: 'Usuarios'
});

module.exports = db;
