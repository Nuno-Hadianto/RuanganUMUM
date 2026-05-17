const express = require('express');
const router = express.Router();
const agendaController = require('../controller/agendaController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', agendaController.getAgendas);
router.post('/', authMiddleware, agendaController.createAgenda);
router.put('/:id/status', authMiddleware, agendaController.updateAgendaStatus);
router.put('/:id', authMiddleware, agendaController.updateAgenda);

module.exports = router;
