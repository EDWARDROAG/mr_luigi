const Log = require('../models/Log');

const getLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, usuario_id, accion, fecha_desde, fecha_hasta } = req.query;
    const result = await Log.findAll(
      { usuario_id, accion, fecha_desde, fecha_hasta },
      parseInt(page, 10),
      parseInt(limit, 10)
    );

    res.json({
      success: true,
      data: result.logs,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener logs' });
  }
};

const getLogStats = async (req, res) => {
  try {
    const { fecha_desde, fecha_hasta } = req.query;
    const by_action = await Log.getStatsByAction(fecha_desde, fecha_hasta);
    const total = await Log.getTotalCount();

    res.json({
      success: true,
      data: { by_action, total },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener estadísticas de logs' });
  }
};

module.exports = {
  getLogs,
  getLogStats,
};
