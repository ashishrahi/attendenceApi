const { Server } = require('socket.io');
const { getConnection } = require('../config/database');

function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Dashboard data request handler
    socket.on('requestDashboardUpdate', async ({ type }) => {
      try {
        const pool = await getConnection();

        if (type === 1) {
          // Consolidated Summary Dashboard Data Query
          const summaryQuery = await pool.request().query(`
            -- Get total employees
            DECLARE @totalEmployees INT = (SELECT COUNT(*) FROM d00_emptable);
            
            -- Get present employees (those with any attendance record today)
            DECLARE @presentEmployees INT = (
              SELECT COUNT(DISTINCT e.userid)
              FROM d00_emptable e
              JOIN UserAttendance ua ON e.userid = ua.UserID
              WHERE CAST(ua.AttDateTime AS DATE) = CAST(GETDATE() AS DATE)
            );
            
            -- Get late employees
            DECLARE @lateEmployees INT = (
              SELECT COUNT(DISTINCT e.userid)
              FROM d00_emptable e
              JOIN shift_master s ON e.shiftid = s.id
              JOIN (
                  SELECT 
                      UserID, 
                      MIN(AttDateTime) AS FirstInTime
                  FROM UserAttendance
                  WHERE CAST(AttDateTime AS DATE) = CAST(GETDATE() AS DATE)
                  AND io_mode = 0 -- Check only IN punches
                  GROUP BY UserID
              ) ua ON e.userid = ua.UserID
              WHERE ua.FirstInTime > 
                  CAST(CONVERT(varchar, GETDATE(), 23) + ' ' + CONVERT(varchar, s.intime, 108) AS datetime)
            );
            
            -- Get early leaving employees
            DECLARE @earlyEmployees INT = (
              SELECT COUNT(DISTINCT e.userid)
              FROM d00_emptable e
              JOIN shift_master s ON e.shiftid = s.id
              JOIN (
                  SELECT 
                      UserID,
                      MAX(CASE WHEN io_mode = 1 THEN AttDateTime END) AS LastOutTime
                  FROM UserAttendance
                  WHERE CAST(AttDateTime AS DATE) = CAST(GETDATE() AS DATE)
                  GROUP BY UserID
              ) ua ON e.userid = ua.UserID
              WHERE ua.LastOutTime < 
                  CAST(CONVERT(varchar, GETDATE(), 23) + ' ' + CONVERT(varchar, s.outtime, 108) AS datetime)
            );
            
            -- Return all values
            SELECT 
                @totalEmployees AS total_employees,
                @presentEmployees AS present_employees,
                @totalEmployees - @presentEmployees AS absent_employees,
                @lateEmployees AS late_employees,
                @earlyEmployees AS early_employees;
          `);

          const result = summaryQuery.recordset[0];
          
          // Validate the numbers
          if (result.present_employees + result.absent_employees !== result.total_employees) {
            console.warn('Data inconsistency detected: present + absent ≠ total');
          }
          if (result.late_employees > result.present_employees) {
            console.warn('Data inconsistency: late employees > present employees');
            result.late_employees = Math.min(result.late_employees, result.present_employees);
          }
          if (result.early_employees > result.present_employees) {
            console.warn('Data inconsistency: early employees > present employees');
            result.early_employees = Math.min(result.early_employees, result.present_employees);
          }

          socket.emit('dashboardData', { 
            type: 1, 
            data: result
          });
        }
      } catch (err) {
        console.error('Error in dashboard socket handler:', err);
        socket.emit('dashboardError', { 
          message: err.message 
        });
      }
    });
    

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}

module.exports = initializeSocket;