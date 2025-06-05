const { getConnection, sql } = require('../config/database');

const createHelpCreation = async (menuId, menuName, description) => {
  const pool = await getConnection();
  await pool.request()
    .input('menu_id', sql.NVarChar, menuId)
    .input('menu_name', sql.NVarChar, menuName)
    .input('description', sql.NVarChar, description)
    .query(`
      INSERT INTO HelpCreation (menu_id, menu_name, description)
      VALUES (@menu_id, @menu_name, @description);
    `);
  return { menuId, menuName, description };
};

const updateHelpCreation = async (menuId, menuName, description) => {
  const pool = await getConnection();
  await pool.request()
    .input('menu_id', sql.NVarChar, menuId)
    .input('menu_name', sql.NVarChar, menuName)
    .input('description', sql.NVarChar, description)
    .query(`
      UPDATE HelpCreation
      SET menu_name = @menu_name,
          description = @description
      WHERE menu_id = @menu_id;
    `);
  return { menuId, menuName, description };
};

const getHelpCreation = async (menuId = null) => {
  const pool = await getConnection();
  let query = 'SELECT * FROM HelpCreation';
  const request = pool.request();

  if (menuId) {
    query += ' WHERE menu_id = @menu_id';
    request.input('menu_id', sql.NVarChar, menuId);
  }

  const result = await request.query(query);
  return result.recordset.map(item => ({
    menuId: item.menu_id,
    menuName: item.menu_name,
    description: item.description
  }));
};

const deleteHelpCreation = async (menuId) => {
  const pool = await getConnection();
  const result = await pool.request()
    .input('menu_id', sql.Int, menuId)
    .query(`
      DELETE FROM HelpCreation
      WHERE menu_id = @menu_id;
    `);
  return result.rowsAffected[0] > 0;
};

module.exports = {
  createHelpCreation,
  updateHelpCreation,
  getHelpCreation,
  deleteHelpCreation
};