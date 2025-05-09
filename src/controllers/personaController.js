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
      .input('Type', sql.Int, 1)
      .input('FullName', sql.NVarChar, fullName)
      .input('GenderId', sql.Int, genderId)
      .input('Address', sql.NVarChar, address)
      .input('Email', sql.NVarChar, email)
      .input('PhoneNumber', sql.NVarChar, phoneNumber)
      .input('StateID', sql.Int, stateId)
      .input('CountryID', sql.Int, countryId)
      .input('DistrictID', sql.Int, districtId)
      .input('EmergencyContact', sql.NVarChar, emergencyContact)
      .input('PersonPicture', sql.NVarChar, personPicture)
      .input('DateOfBirth', sql.Date, dateOfBirth)
      .input('DateOfJoining', sql.Date, dateOfJoining)
      .input('DLNumber', sql.NVarChar, dlNumber)
      .input('VehicleNumber', sql.NVarChar, vehicleNumber)
      .input('PincodeID', sql.Int, pincodeId)
      .input('MaritalStatusId', sql.Int, maritalStatusId)
      .input('DesignationID', sql.Int, designationId)
      .input('DepartmentID', sql.Int, departmentId)
      .input('RoleId', sql.Int, roleId)
      .input('Status', sql.Bit, status)
      .input('UserName', sql.NVarChar, username)
      .input('HashPassword', sql.NVarChar, encryptData(password))
      .execute('ManagePersonaDetails');

    const { IsSuccess, Message } = result.recordsets[0][0];

    AccountCreationmail(username, password, email);
    
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
      .query("SELECT DISTINCT UserID, Name FROM [iDMS].[dbo].[Userdetail];")
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