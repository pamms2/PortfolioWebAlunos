const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://pamela:1234@cluster0.gg2zzu5.mongodb.net/dbProjeto', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB conectado!'))
.catch(err => console.error('Erro ao conectar no MongoDB:', err));

module.exports = mongoose;
