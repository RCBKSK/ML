function doGet() {
  return HtmlService.createHtmlOutputFromFile('index.html');
}

// Helper function to check if sheet exists
function checkSheetExists(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error(`Sheet '${sheetName}' not found`);
  return sheet;
}

// Only function that writes to spreadsheet
function registerUser(username, wallet, kingdomIds) {
  try {
    const sheet = checkSheetExists('Users');
    const existingUsers = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues().flat();
    
    if (existingUsers.includes(username)) {
      return { success: false, message: 'Username already exists.' };
    }

    sheet.appendRow([username, wallet, JSON.stringify(kingdomIds)]);
    return { success: true, message: 'Registered successfully!' };
  } catch (e) {
    console.error("Error in registerUser:", e);
    return { success: false, message: "Error: " + e.message };
  }
}

// Read-only functions below
function validateUser(username) {
  try {
    const sheet = checkSheetExists('Users');
    const data = sheet.getDataRange().getValues();
    return data.some(row => row[0] === username);
  } catch (e) {
    console.error("Error in validateUser:", e);
    return false;
  }
}

function getUserDetails(username) {
  try {
    const sheet = checkSheetExists('Users');
    const data = sheet.getDataRange().getValues();
    
    for (let row of data) {
      if (row[0] === username) {
        let kingdoms = [];
        try {
          kingdoms = typeof row[2] === 'string' ? JSON.parse(row[2]) : row[2];
          if (!Array.isArray(kingdoms)) kingdoms = [];
        } catch (e) {
          kingdoms = [];
        }
        return {
          wallet: row[1],
          kingdomIds: kingdoms
        };
      }
    }
    return null;
  } catch (e) {
    console.error("Error in getUserDetails:", e);
    return null;
  }
}

function getUserContribution(username, rangeKey) {
  try {
    const userData = checkSheetExists('Users').getDataRange().getValues();
    const logsData = checkSheetExists('Logs').getDataRange().getValues();
    
    // Process user's kingdoms
    const userKingdoms = {};
    for (let row of userData) {
      if (row[0] === username) {
        try {
          const kingdoms = typeof row[2] === 'string' ? JSON.parse(row[2]) : row[2];
          if (Array.isArray(kingdoms)) {
            kingdoms.forEach(id => userKingdoms[id] = true);
          }
        } catch (e) {}
        break;
      }
    }

    // Calculate date range
    const now = new Date();
    let fromDate;
    switch (rangeKey) {
      case 'currentWeek': fromDate = new Date(now.setDate(now.getDate() - now.getDay())); break;
      case 'lastWeek': fromDate = new Date(now.setDate(now.getDate() - now.getDay() - 7)); break;
      case 'lastMonth': fromDate = new Date(now.getFullYear(), now.getMonth() - 1, 1); break;
      default: fromDate = new Date(now.getFullYear(), now.getMonth(), 1); // currentMonth
    }

    // Process contributions
    const contributions = {};
    for (let row of logsData) {
      const logDate = new Date(row[0]);
      if (logDate < fromDate) continue;
      
      const kingdomId = row[1];
      if (!userKingdoms[kingdomId]) continue;

      if (!contributions[kingdomId]) {
        contributions[kingdomId] = {
          kingdomId: kingdomId,
          name: row[2],
          continent: row[3],
          total: 0
        };
      }
      contributions[kingdomId].total += row[5];
    }

    return Object.values(contributions);
  } catch (e) {
    console.error("Error in getUserContribution:", e);
    return [];
  }
}

function getAllUserContributionTotals(rangeKey) {
  try {
    const userData = checkSheetExists('Users').getDataRange().getValues();
    const logsData = checkSheetExists('Logs').getDataRange().getValues();
    
    // Map kingdom IDs to usernames
    const userMap = {};
    userData.forEach(row => {
      try {
        const kingdoms = typeof row[2] === 'string' ? JSON.parse(row[2]) : row[2];
        if (Array.isArray(kingdoms)) {
          kingdoms.forEach(id => userMap[id] = row[0]);
        }
      } catch (e) {}
    });

    // Calculate date range
    const now = new Date();
    let fromDate;
    switch (rangeKey) {
      case 'currentWeek': fromDate = new Date(now.setDate(now.getDate() - now.getDay())); break;
      case 'lastWeek': fromDate = new Date(now.setDate(now.getDate() - now.getDay() - 7)); break;
      case 'lastMonth': fromDate = new Date(now.getFullYear(), now.getMonth() - 1, 1); break;
      default: fromDate = new Date(now.getFullYear(), now.getMonth(), 1); // currentMonth
    }

    // Calculate totals
    const totals = {};
    for (let row of logsData) {
      const logDate = new Date(row[0]);
      if (logDate < fromDate) continue;
      
      const user = userMap[row[1]];
      if (!user) continue;

      totals[user] = (totals[user] || 0) + row[5];
    }

    return Object.entries(totals).map(([username, total]) => ({ username, total }));
  } catch (e) {
    console.error("Error in getAllUserContributionTotals:", e);
    return [];
  }
}

function getAllUsernames() {
  try {
    const data = checkSheetExists('Users').getDataRange().getValues();
    return data.map(row => row[0]).filter(name => name && name !== 'Username');
  } catch (e) {
    console.error("Error in getAllUsernames:", e);
    return [];
  }
}
