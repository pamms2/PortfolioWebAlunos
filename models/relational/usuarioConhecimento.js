module.exports = (sequelize, Sequelize) => {
    const UsuarioConhecimento = sequelize.define('usuarioConhecimento', {
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
        conhecimentoId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'conhecimentos',
                key: 'id'
            },
            onDelete: 'CASCADE'
        },
    }, {
        tableName:'usuarioConhecimento'
    });
    return UsuarioConhecimento;
};
