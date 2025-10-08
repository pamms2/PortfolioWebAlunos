module.exports = (sequelize, Sequelize) => {
    const Aluno = sequelize.define('aluno', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true, 
            allowNull: false, 
            primaryKey: true
        },
        usuarioId: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        ra: {
            type: Sequelize.INTEGER,
            allowNull: false,
            unique: true
        }
    });
    return Aluno;
}

