module.exports = (sequelize, Sequelize) => {
    const PalavraChaveProjeto = sequelize.define('palavraChaveProjeto', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        palavraChaveId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'palavrasChave',
                key: 'id'
            },
            onDelete: 'CASCADE'
        },
        projetoId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'projetos',
                key: 'id'
            },
            onDelete: 'CASCADE'
        }
    }, {
        tableName: 'palavraChaveProjeto'
    });
    return PalavraChaveProjeto;
};
