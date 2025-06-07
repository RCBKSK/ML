// Serve the HTML frontend
function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('index')
      .setTitle('LOK Contribution Portal')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Validate if username exists in Users sheet
function validateUser(username) {
  var ss = SpreadsheetApp.getActive();
  var sheet = ss.getSheetByName('Users');
  if (!sheet) return false;
  var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
  username = username.toString().toLowerCase();
  for (var i = 0; i < data.length; i++) {
    if (data[i][0].toString().toLowerCase() === username) {
      return true;
    }
  }
  return false;
}

// Register a new user with wallet and kingdomIds array
function registerUser(username, wallet, kingdomIds) {
  var ss = SpreadsheetApp.getActive();
  var usersSheet = ss.getSheetByName('Users');
  var kingdomSheet = ss.getSheetByName('KingdomMap');

  // Create sheets if not existing
  if (!usersSheet) {
    usersSheet = ss.insertSheet('Users');
    usersSheet.appendRow(['Username', 'Wallet']);
  }
  if (!kingdomSheet) {
    kingdomSheet = ss.insertSheet('KingdomMap');
    kingdomSheet.appendRow(['Username', 'KingdomID']);
  }

  username = username.toString().trim();
  wallet = wallet.toString().trim();
  if (username === '' || wallet === '') {
    return { success: false, message: 'Username and wallet cannot be empty.' };
  }

  if (validateUser(username)) {
    return { success: false, message: 'Username already exists. Please choose another.' };
  }

  usersSheet.appendRow([username, wallet]);

  var existingKingdoms = kingdomSheet.getRange(2, 1, kingdomSheet.getLastRow() - 1, 2).getValues();
  var kingdomSet = new Set(existingKingdoms.map(r => r[1].toString()));

  kingdomIds.forEach(function(kid) {
    kid = kid.toString().trim();
    if (kid !== '' && !kingdomSet.has(kid)) {
      kingdomSheet.appendRow([username, kid]);
      kingdomSet.add(kid);
    }
  });

  return { success: true, message: 'Registration successful! You can now log in.' };
}

// Get all Kingdom IDs linked to username
function getUserKingdoms(username) {
  var ss = SpreadsheetApp.getActive();
  var kingdomSheet = ss.getSheetByName('KingdomMap');
  if (!kingdomSheet) return [];
  var data = kingdomSheet.getRange(2, 1, kingdomSheet.getLastRow() - 1, 2).getValues();
  var kingdoms = [];
  username = username.toString().toLowerCase();
  for (var i = 0; i < data.length; i++) {
    if (data[i][0].toString().toLowerCase() === username) {
      kingdoms.push(data[i][1].toString());
    }
  }
  return kingdoms;
}

// Predefined lands
var predefinedLands = [140578, 140322, 140066, 140320, 140064];

// User contribution for their own data
function getUserContribution(username, range) {
  const ss = SpreadsheetApp.getActive();
  const userSheet = ss.getSheetByName('Users');
  const users = userSheet.getDataRange().getValues();
  
  const userRow = users.find(row => row[0].toLowerCase() === username.toLowerCase());
  if (!userRow) return [];

  const wallet = userRow[1].toLowerCase();
  const kingdomIds = userRow[2] ? userRow[2].split(',').map(k => k.trim()) : [];
  const { from, to } = getDateRange(range);

  const allContributions = [];

  kingdomIds.forEach(kingdomId => {
    try {
      const url = `https://api-lok-live.leagueofkingdoms.com/api/stat/land/contribution?landId=${kingdomId}&from=${from}&to=${to}`;
      const response = UrlFetchApp.fetch(url);
      const data = JSON.parse(response.getContentText()).data;

      data.forEach(entry => {
        if (entry.wallet?.toLowerCase() === wallet) {
          allContributions.push({
            kingdomId: kingdomId,
            name: entry.name || '',
            continent: entry.continent || '',
            total: entry.total || 0
          });
        }
      });

    } catch (err) {
      Logger.log(`Error fetching for kingdom ${kingdomId}: ${err}`);
    }
  });

  return allContributions;
}

// Admin-level fetch for all users
function getAllUsersContribution(dateRange) {
  var dates = getDateRange(dateRange);
  if (!dates) {
    return { error: 'Invalid date range selected.' };
  }
  var from = dates.from;
  var to = dates.to;

  var ss = SpreadsheetApp.getActive();
  var kingdomSheet = ss.getSheetByName('KingdomMap');
  var usersSheet = ss.getSheetByName('Users');
  if (!kingdomSheet || !usersSheet) {
    return { contribution: [], message: 'Required sheets not found.' };
  }

  var kingdomData = kingdomSheet.getRange(2, 1, kingdomSheet.getLastRow() - 1, 2).getValues();
  var usersData = usersSheet.getRange(2, 1, usersSheet.getLastRow() - 1, 1).getValues();

  var userKingdomMap = {};
  kingdomData.forEach(function(row) {
    var user = row[0].toString().toLowerCase();
    var kingdomId = row[1].toString();
    if (!userKingdomMap[user]) userKingdomMap[user] = [];
    userKingdomMap[user].push(kingdomId);
  });

  var combinedContributions = [];

  predefinedLands.forEach(function(landId) {
    var apiUrl = "https://api-lok-live.leagueofkingdoms.com/api/stat/land/contribution?landId=" + landId + "&from=" + from + "&to=" + to;
    try {
      var response = UrlFetchApp.fetch(apiUrl, {muteHttpExceptions: true});
      if (response.getResponseCode() !== 200) return;
      var jsonData = JSON.parse(response.getContentText());
      if (!jsonData.contribution) return;

      jsonData.contribution.forEach(function(item) {
        var kingdomIdStr = item.kingdomId.toString();
        for (var user in userKingdomMap) {
          if (userKingdomMap[user].includes(kingdomIdStr)) {
            combinedContributions.push({
              username: user,
              kingdomId: item.kingdomId,
              name: item.name,
              continent: item.continent,
              total: item.total
            });
            break;
          }
        }
      });
    } catch(e) {
      Logger.log("Error fetching land " + landId + ": " + e.toString());
    }
  });

  return { contribution: combinedContributions };
}

// Date range helper

function getDateRange(range) {
  const now = new Date();
  let from = new Date();
  let to = new Date();

  switch (range) {
    case "lastWeek":
      from.setDate(now.getDate() - now.getDay() - 7);
      to.setDate(from.getDate() + 6);
      break;
    case "currentWeek":
      from.setDate(now.getDate() - now.getDay());
      to.setDate(from.getDate() + 6);
      break;
    case "lastMonth":
      from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      to = new Date(now.getFullYear(), now.getMonth(), 0);
      break;
    case "currentMonth":
    default:
      from = new Date(now.getFullYear(), now.getMonth(), 1);
      to = now;
      break;
  }

  const format = d => Utilities.formatDate(d, Session.getScriptTimeZone(), "yyyy-MM-dd");
  return { from: format(from), to: format(to) };
}

// Format date to YYYY-MM-DD
function formatDate(date) {
  var y = date.getFullYear();
  var m = (date.getMonth() + 1).toString().padStart(2, '0');
  var d = date.getDate().toString().padStart(2, '0');
  return y + '-' + m + '-' + d;
}
