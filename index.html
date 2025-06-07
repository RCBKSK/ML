function doGet() {
  return HtmlService.createHtmlOutputFromFile('index.html');
}

function registerUser(username, wallet, kingdomIds) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Users');

  const existingUsers = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues().flat();
  if (existingUsers.includes(username)) {
    return { success: false, message: 'Username already exists.' };
  }

  sheet.appendRow([username, wallet, JSON.stringify(kingdomIds)]);
  return { success: true, message: 'Registered successfully!' };
}

function validateUser(username) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Users');
  const usernames = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues().flat();
  return usernames.includes(username);
}

function getUserDetails(username) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Users');

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 3).getValues();
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
}

function getUserContribution(username, rangeKey) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Logs');
  const userSheet = ss.getSheetByName('Users');

  const userData = userSheet.getRange(2, 1, userSheet.getLastRow() - 1, 3).getValues();
  const userKingdoms = {};

  for (let row of userData) {
    if (row[0] === username) {
      try {
        const kingdoms = typeof row[2] === 'string' ? JSON.parse(row[2]) : row[2];
        if (Array.isArray(kingdoms)) {
          kingdoms.forEach(id => userKingdoms[id] = true);
        }
      } catch (e) {}
    }
  }

  const now = new Date();
  let fromDate;

  switch (rangeKey) {
    case 'currentWeek':
      fromDate = new Date(now);
      fromDate.setDate(now.getDate() - now.getDay());
      break;
    case 'lastWeek':
      fromDate = new Date(now);
      fromDate.setDate(now.getDate() - now.getDay() - 7);
      break;
    case 'lastMonth':
      fromDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      break;
    case 'currentMonth':
    default:
      fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
  }

  const logs = sheet.getRange(2, 1, sheet.getLastRow() - 1, 6).getValues();
  const contributions = {};

  for (let row of logs) {
    const [logDate, kingdomId, name, continent, , total] = [new Date(row[0]), row[1], row[2], row[3], row[4], row[5]];
    if (logDate < fromDate) continue;
    if (!userKingdoms[kingdomId]) continue;

    if (!contributions[kingdomId]) {
      contributions[kingdomId] = { kingdomId, name, continent, total: 0 };
    }
    contributions[kingdomId].total += total;
  }

  return Object.values(contributions);
}

function getAllUserContributionTotals(rangeKey) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Logs');
  const userSheet = ss.getSheetByName('Users');

  const userData = userSheet.getRange(2, 1, userSheet.getLastRow() - 1, 3).getValues();
  const userMap = {};
  userData.forEach(row => {
    const [username, , kingdomsRaw] = row;
    try {
      const ids = typeof kingdomsRaw === 'string' ? JSON.parse(kingdomsRaw) : kingdomsRaw;
      if (Array.isArray(ids)) {
        ids.forEach(id => userMap[id] = username);
      }
    } catch (e) {}
  });

  const now = new Date();
  let fromDate;

  switch (rangeKey) {
    case 'currentWeek':
      fromDate = new Date(now);
      fromDate.setDate(now.getDate() - now.getDay());
      break;
    case 'lastWeek':
      fromDate = new Date(now);
      fromDate.setDate(now.getDate() - now.getDay() - 7);
      break;
    case 'lastMonth':
      fromDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      break;
    case 'currentMonth':
    default:
      fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
  }

  const logs = sheet.getRange(2, 1, sheet.getLastRow() - 1, 6).getValues();
  const totals = {};

  for (let row of logs) {
    const [logDate, kingdomId, , , , total] = [new Date(row[0]), row[1], row[2], row[3], row[4], row[5]];
    if (logDate < fromDate) continue;
    const user = userMap[kingdomId];
    if (!user) continue;

    if (!totals[user]) totals[user] = 0;
    totals[user] += total;
  }

  return Object.entries(totals).map(([username, total]) => ({ username, total }));
}

function getAllUsernames() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Users');
  if (!sheet) return [];

  const usernames = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues().flat();
  return usernames.filter(name => name);
}
