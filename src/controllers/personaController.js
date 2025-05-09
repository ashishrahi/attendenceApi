const { getConnection, sql } = require('../config/database');
const { encryptData } = require('../middleware/crypto');
const { AccountCreationmail } = require('../middleware/emailservice');

const createPersona = async (req, res) => {
  try {
    const {
      userid,
      deptId,
      desigId,
      zoneId,
      wardId,
      areaId,
      beatId,
      genderId,
      firstName,
      middleName,
      lastName,
      fatherName,
      motherName,
      email,
      phone,
      address,
      dob 
    } = req.body;
    const pool = await getConnection();
    
    const result = await pool.request()
    .input('userid', sql.Int, userid)
    .input('dept_id', sql.Int, deptId)
    .input('desig_id', sql.Int, desigId)
    .input('zone_id', sql.Int, zoneId)
    .input('ward_id', sql.Int, wardId)
    .input('area_id', sql.Int, areaId)
    .input('beat_id', sql.Int, beatId)
    .input('gender_id', sql.Int, genderId)
    .input('first_name', sql.NVarChar, firstName)
    .input('middle_name', sql.NVarChar, middleName)
    .input('last_name', sql.NVarChar, lastName)
    .input('father_name', sql.NVarChar, fatherName)
    .input('mother_name', sql.NVarChar, motherName)
    .input('email', sql.NVarChar, email)
    .input('phone', sql.NVarChar, phone)
    .input('address', sql.NVarChar, address)
    .input('dob', sql.Date, dob)
      .query(`INSERT INTO [iDMS].[dbo].[d00_emptable]
(userid, dept_id, desig_id, zone_id, ward_id, area_id, beat_id, gender_id,
 first_name, middle_name, last_name, father_name, mother_name,
 email, phone, address, dob)
VALUES (@userid, @dept_id, @desig_id, @zone_id, @ward_id, @area_id, @beat_id, @gender_id,
        @first_name, @middle_name, @last_name, @father_name, @mother_name,
        @email, @phone, @address, @dob)
`);

    

   
    
    res.json({
      success: true,
      message: 'data inserted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const updatePersona = async (req, res) => {
  try {
    const {
      userid,
      deptId,
      desigId,
      zoneId,
      wardId,
      areaId,
      beatId,
      genderId,
      firstName,
      middleName,
      lastName,
      fatherName,
      motherName,
      email,
      phone,
      address,
      dob,
      shiftid 
    } = req.body;
    const pool = await getConnection();
    
    const result = await pool.request()
    .input('userid', sql.Int, userid)
    .input('dept_id', sql.Int, deptId)
    .input('desig_id', sql.Int, desigId)
    .input('zone_id', sql.Int, zoneId)
    .input('ward_id', sql.Int, wardId)
    .input('area_id', sql.Int, areaId)
    .input('beat_id', sql.Int, beatId)
    .input('gender_id', sql.Int, genderId)
    .input('first_name', sql.NVarChar, firstName)
    .input('middle_name', sql.NVarChar, middleName)
    .input('last_name', sql.NVarChar, lastName)
    .input('father_name', sql.NVarChar, fatherName)
    .input('mother_name', sql.NVarChar, motherName)
    .input('email', sql.NVarChar, email)
    .input('phone', sql.NVarChar, phone)
    .input('address', sql.NVarChar, address)
    .input('dob', sql.Date, dob)
    .input('shiftid', sql.Int, shiftid)
    .query(`
      UPDATE [iDMS].[dbo].[d00_emptable]
      SET 
        dept_id = @dept_id,
        desig_id = @desig_id,
        zone_id = @zone_id,
        ward_id = @ward_id,
        area_id = @area_id,
        beat_id = @beat_id,
        gender_id = @gender_id,
        first_name = @first_name,
        middle_name = @middle_name,
        last_name = @last_name,
        father_name = @father_name,
        mother_name = @mother_name,
        email = @email,
        phone = @phone,
        address = @address,
        dob = @dob,
        shiftid = @shiftid
      WHERE userid = @userid
    `);
    

    
    res.json({
      success: true,
      message: 'updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const getPersonas = async (req, res) => {
  try {
    // console.log(req.user.personData);
    
    
    // const UserRole = req.user.personData.RoleName;
    const pool = await getConnection();
    const result = await pool.request()
      .query(`
        SELECT DISTINCT 
    u.UserID, 
    u.Name, 
    e.dept_id,
    e.desig_id,
    e.zone_id,
    e.ward_id,
    e.area_id,
    e.beat_id,
    e.gender_id,
    e.first_name,
    e.middle_name,
    e.last_name,
    e.father_name,
    e.mother_name,
    e.email,
    e.phone,
    e.address,
    e.dob,
    e.shiftid
FROM 
    [iDMS].[dbo].[Userdetail] u
JOIN 
    [iDMS].[dbo].[d00_emptable] e 
    ON u.UserID = e.userid

      `);
    console.log(result);
    
    // const { IsSuccess, Message } = result.recordsets[0][0];
    const personas = result.recordset;
    
    res.json({
      success: true,
      message: "Message",
      data: personas
    });
   
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const getPersonaDetails = async (req, res) => {
  try {
    console.log(req);
    
    const personId = req.user.personData.PersonID;
    const pool = await getConnection();
    console.log(personId)
    
    const result = await pool.request()
      .input('Type', sql.Int, 3)
      .input('PersonID', sql.Int, personId)
      .execute('ManagePersonaDetails');

    const { IsSuccess, Message } = result.recordsets[0][0];
    const personaDetails = result.recordsets[1][0];
    console.log(result.recordsets);
    
    
    res.json({
      success: IsSuccess,
      message: Message,
      data: personaDetails
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


const deletepersona = async (req, res) => {
  try {
    const {  userid } = req.body;
    const pool = await getConnection();
    console.log(userid)
    
    const result = await pool.request()
      .input('userid', sql.Int, userid)
      .execute('delete [iDMS].[dbo].[d00_emptable] where userid = @userid');

    const { IsSuccess, Message } = result.recordsets[0][0];
    console.log(result.recordsets);
    
    
    res.json({
      success: IsSuccess,
      message: Message,
      // data: personaDetails
    });
  }
   catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  createPersona,
  getPersonas,
  getPersonaDetails,
  deletepersona,
  updatePersona
};