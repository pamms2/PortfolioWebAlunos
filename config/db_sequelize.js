const Sequelize = require('sequelize');
const sequelize = new Sequelize('dbProjeto', 'postgres', '1234', {
        host: 'localhost',
        dialect: 'postgres'
    });

var db ={};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

//importando os modelos
db.Usuario = require('../models/usuario.js')(sequelize, Sequelize);
db.Aluno = require('../models/aluno.js')(sequelize, Sequelize);
db.Projeto = require('../models/projeto.js')(sequelize, Sequelize);
db.PalavraChave = require('../models/palavraChave.js')(sequelize, Sequelize);
db.Conhecimento = require('../models/conhecimento.js')(sequelize, Sequelize);

//relacionamentos

//1:1 usuário -> aluno
db.Usuario.hasOne(db.Aluno, {
    foreignKey: 'usuarioId',
    onDelete: 'CASCADE'
});
db.Aluno.belongsTo(db.Usuario, {
    foreignKey: 'usuarioId',
    allowNull: false
});

//N:M aluno -> projeto
db.Aluno.belongsToMany(db.Projeto, {
    through: 'AlunoProjeto',
    foreignKey: 'alunoId',
    otherKey: 'projetoId'
});
db.Projeto.belongsToMany(db.Aluno, {
    through: 'AlunoProjeto',
    foreignKey: 'projetoId',
    otherKey: 'alunoId'
});

//N:M palavra-chave <-> projeto
db.Projeto.belongsToMany(db.PalavraChave, {
    through: 'ProjetoPalavraChave',
    foreignKey: 'projetoId',
    otherKey: 'palavraChaveId'
});
db.PalavraChave.belongsToMany(db.Projeto, {
    through: 'ProjetoPalavraChave',
    foreignKey: 'palavraChaveId',
    otherKey: 'projetoId'
});

//N:M conhecimento <-> aluno
db.Aluno.belongsToMany(db.Conhecimento, {
    through: 'AlunoConhecimento',
    foreignKey: 'alunoId',
    otherKey: 'conhecimentoId'
});
db.Conhecimento.belongsToMany(db.Aluno, {
    through: 'AlunoConhecimento',
    foreignKey: 'conhecimentoId',
    otherKey: 'alunoId'
});

module.exports = db;
