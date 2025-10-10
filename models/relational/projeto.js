module.exports = (sequelize, Sequelize) => {
    const Projeto = sequelize.define('projeto', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true, 
            allowNull: false, 
            primaryKey: true
        },
        nome: {
            type: Sequelize.STRING,
            allowNull: false
        },
        resumo: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        link: {
            type: Sequelize.STRING,
            allowNull: false
        },
    });
    return Projeto;
}

