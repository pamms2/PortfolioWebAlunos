const db = require('../config/db_mongoose');
const Log = require('../models/noSql/log');
const { Op } = require('sequelize');

module.exports = {
    async registrarAcesso(req) {
        try {
            const log = new Log({
                ip: req.ip,
                route: req.originalUrl,
                userAgent: req.get('User-Agent')
            });
            await log.save();
            console.log("Acesso registrado!");
        } catch (err) {
            console.error("Erro ao registrar acesso:", err);
        }
    },

    async getList(req, res) {
        try {
            const logs = await Log.find().sort({ timestamp: -1 });
            res.render('log/listarLog', { logs: logs.map(l => l.toObject()) });

        } catch (err) {
            console.error(err);
            res.status(500).send("Erro ao buscar logs");
        }
    }
};

