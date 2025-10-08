module.exports = (sequelize, Sequelize) => {
    const Usuario = sequelize.define('usuario', {
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
        email: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true
        },
        senha: {
            type: Sequelize.STRING,
            allowNull: false
        },
        tipo: {
            type: Sequelize.ENUM('aluno', 'admin', 'externo'),
            allowNull: false
        }
    });
    return Usuario;
}

