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
function getUserContribution(username, dateRange) {
  var dates = getDateRange(dateRange);
  if (!dates) {
    return { error: 'Invalid date range selected.' };
  }
  var from = dates.from;
  var to = dates.to;

  var kingdoms = getUserKingdoms(username);
  if (kingdoms.length === 0) {
    return { contribution: [], message: 'No kingdoms linked to this user.' };
  }

  var combinedContributions = {};

  predefinedLands.forEach(function(landId) {
    var apiUrl = "https://api-lok-live.leagueofkingdoms.com/api/stat/land/contribution?landId=" + landId + "&from=" + from + "&to=" + to;
    try {
      var response = UrlFetchApp.fetch(apiUrl, {muteHttpExceptions: true});
      if (response.getResponseCode() !== 200) return;
      var jsonData = JSON.parse(response.getContentText());
      if (!jsonData.contribution) return;

      jsonData.contribution.forEach(function(item) {
        if (kingdoms.includes(item.kingdomId.toString())) {
          if (!combinedContributions[item.kingdomId]) {
            combinedContributions[item.kingdomId] = {
              kingdomId: item.kingdomId,
              name: item.name,
              continent: item.continent,
              total: 0
            };
          }
          combinedContributions[item.kingdomId].total += item.total;
        }
      });
    } catch(e) {
      Logger.log("Error fetching land " + landId + ": " + e.toString());
    }
  });

  return { contribution: Object.values(combinedContributions) };
}

// Admin-level fetch for all users
function getAllUserContributionTotals(dateRange) {  // <--- Renamed here
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
  var today = new Date();
  today.setHours(0,0,0,0);
  var from, to;

  switch(range) {
    case 'currentWeek':
      var day = today.getDay();
      from = new Date(today);
      from.setDate(today.getDate() - day + 1);
      to = new Date(from);
      to.setDate(from.getDate() + 6);
      break;

    case 'lastWeek':
      var day = today.getDay();
      from = new Date(today);
      from.setDate(today.getDate() - day - 6);
      to = new Date(from);
      to.setDate(from.getDate() + 6);
      break;

    case 'currentMonth':
      from = new Date(today.getFullYear(), today.getMonth(), 1);
      to = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      break;

    case 'lastMonth':
      from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      to = new Date(today.getFullYear(), today.getMonth(), 0);
      break;

    default:
      return null;
  }
  return {
    from: formatDate(from),
    to: formatDate(to)
  };
}

// Format date to YYYY-MM-DD
function formatDate(date) {
  var y = date.getFullYear();
  var m = (date.getMonth() + 1).toString().padStart(2, '0');
  var d = date.getDate().toString().padStart(2, '0');
  return y + '-' + m + '-' + d;
}
