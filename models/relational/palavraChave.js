module.exports = (sequelize, Sequelize) => {
    const PalavraChave = sequelize.define('palavraChave', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true, 
            allowNull: false, 
            primaryKey: true
        },
        palavra: {
            type: Sequelize.STRING,
            allowNull: false
        }
    });
    return PalavraChave;
}

