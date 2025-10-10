module.exports = (sequelize, Sequelize) => {
    const UsuarioProjeto = sequelize.define('usuarioProjeto', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        usuarioId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'usuarios',
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
        },
    }, {
        tableName:'usuarioProjeto'
    });
    return UsuarioProjeto;
};
