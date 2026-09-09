export const healthController = {
  getHealth(req, res) {
    res.json({
      success: true,
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'Ashish Portfolio CMS API Backend',
      version: '1.0.0',
      database: 'PostgreSQL Connected'
    });
  }
};
