/**
 * Menu Picker for Google Sheets
 * 
 * Automatically generates weekly menus from three columns (meat, starch, veggie) with:
 * - Weekly limits for specific meat types (chicken, pork, fish, shrimp, beef)
 * - No consecutive day repeats for meats
 * - Each meat item used only once per week
 * - Starch limit: 3 times per week each
 * - Veggie limit: 2 times per week each
 * - Special dates support for birthdays/holidays
 * - 8-week meal history tracking
 * - Multiple email recipients
 * - Mobile-friendly responsive email design
 * - Weekly automation (Friday 9 AM)
 * - Configurable email start dates
 * 
 * Automatically filters common header labels: meat, starch, veggie, veggies, vegetable, vegetables
 */

// Configuration constants
const LIMITS = {
  'chicken': 3,
  'pork': 2,
  'fish': 1,
  'shrimp': 1,
  'beef': 0  // Set to 0 to exclude beef, increase to allow beef (e.g., 2)
};

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Creates a custom menu in Google Sheets
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Menu Picker')
    .addItem('Generate Weekly Menu', 'generateAndDisplayMenu')
    .addItem('Setup Weekly Email Trigger', 'setupWeeklyTrigger')
    .addItem('Configure Email Start Date', 'configureEmailStartDate')
    .addItem('Test Email', 'sendWeeklyMenuEmail')
    .addSeparator()
    .addItem('View Special Dates', 'showSpecialDatesDialog')
    .addItem('Add Special Date', 'addSpecialDate')
    .addItem('Remove Special Date', 'removeSpecialDate')
    .addSeparator()
    .addItem('View Meal History', 'viewMealHistory')
    .addItem('Clear Meal History', 'clearMealHistory')
    .addSeparator()
    .addItem('Manage Email Recipients', 'manageEmailRecipients')
    .addToUi();
}

/**
 * Reads data from the three columns (meat, starch, veggie)
 * Reads from columns A, B, C starting from row 2
 * Automatically filters out common header labels (meat, starch, veggie, veggies, vegetable, vegetables)
 */
function getMenuData() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastRow = sheet.getLastRow();
  
  if (lastRow < 2) {
    throw new Error('No menu data found. Please add items to columns A, B, and C.');
  }
  
  // Common header words to filter out (case-insensitive)
  const headerLabels = ['meat', 'starch', 'veggie', 'veggies', 'vegetable', 'vegetables'];
  
  // Helper function to filter out header labels and empty items
  const filterItems = (items) => {
    return items.filter(item => {
      if (item === '') return false;
      const itemLower = String(item).toLowerCase().trim();
      return !headerLabels.includes(itemLower);
    });
  };
  
  const meats = filterItems(sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat());
  const starches = filterItems(sheet.getRange(2, 2, lastRow - 1, 1).getValues().flat());
  const veggies = filterItems(sheet.getRange(2, 3, lastRow - 1, 1).getValues().flat());
  
  return {
    meats: meats,
    starches: starches,
    veggies: veggies
  };
}

/**
 * Gets special dates/meals from script properties
 * Format: { "MM-DD": { "name": "Birthday", "meat": "Steak", "starch": "Baked Potato", "veggie": "Asparagus" } }
 */
function getSpecialDates() {
  const props = PropertiesService.getScriptProperties();
  const specialDatesJson = props.getProperty('SPECIAL_DATES');
  
  if (specialDatesJson) {
    return JSON.parse(specialDatesJson);
  }
  return {};
}

/**
 * Saves special dates/meals to script properties
 */
function saveSpecialDates(specialDates) {
  const props = PropertiesService.getScriptProperties();
  props.setProperty('SPECIAL_DATES', JSON.stringify(specialDates));
}

/**
 * Checks if a given date matches any special date
 * Returns the special meal if found, null otherwise
 */
function getSpecialMealForDate(date) {
  const specialDates = getSpecialDates();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateKey = `${month}-${day}`;
  
  return specialDates[dateKey] || null;
}

/**
 * Shows a dialog to manage special dates
 */
function showSpecialDatesDialog() {
  const specialDates = getSpecialDates();
  
  let message = 'Special Dates & Meals\n\n';
  message += 'Currently saved special dates:\n\n';
  
  const dateKeys = Object.keys(specialDates);
  if (dateKeys.length === 0) {
    message += 'No special dates saved yet.\n\n';
  } else {
    dateKeys.forEach(dateKey => {
      const special = specialDates[dateKey];
      message += `${dateKey} - ${special.name}\n`;
      message += `  Meat: ${special.meat}\n`;
      message += `  Starch: ${special.starch}\n`;
      message += `  Veggie: ${special.veggie}\n\n`;
    });
  }
  
  message += '\nTo add a special date, use: Menu Picker > Add Special Date\n';
  message += 'To remove a special date, use: Menu Picker > Remove Special Date';
  
  SpreadsheetApp.getUi().alert(message);
}

/**
 * Adds a special date via user input
 */
function addSpecialDate() {
  const ui = SpreadsheetApp.getUi();
  
  // Get date
  const dateResponse = ui.prompt(
    'Add Special Date',
    'Enter the date (MM-DD format, e.g., 12-25 for December 25):',
    ui.ButtonSet.OK_CANCEL
  );
  
  if (dateResponse.getSelectedButton() !== ui.Button.OK) return;
  const dateKey = dateResponse.getResponseText().trim();
  
  // Validate date format
  if (!/^\d{2}-\d{2}$/.test(dateKey)) {
    ui.alert('Invalid format. Please use MM-DD format (e.g., 12-25).');
    return;
  }
  
  // Get name
  const nameResponse = ui.prompt(
    'Special Date Name',
    'Enter a name for this special date (e.g., "Mom\'s Birthday", "Anniversary"):',
    ui.ButtonSet.OK_CANCEL
  );
  
  if (nameResponse.getSelectedButton() !== ui.Button.OK) return;
  const name = nameResponse.getResponseText().trim();
  
  // Get meat
  const meatResponse = ui.prompt(
    'Special Meal - Meat',
    'Enter the meat for this special date:',
    ui.ButtonSet.OK_CANCEL
  );
  
  if (meatResponse.getSelectedButton() !== ui.Button.OK) return;
  const meat = meatResponse.getResponseText().trim();
  
  // Get starch
  const starchResponse = ui.prompt(
    'Special Meal - Starch',
    'Enter the starch for this special date:',
    ui.ButtonSet.OK_CANCEL
  );
  
  if (starchResponse.getSelectedButton() !== ui.Button.OK) return;
  const starch = starchResponse.getResponseText().trim();
  
  // Get veggie
  const veggieResponse = ui.prompt(
    'Special Meal - Veggie',
    'Enter the veggie for this special date:',
    ui.ButtonSet.OK_CANCEL
  );
  
  if (veggieResponse.getSelectedButton() !== ui.Button.OK) return;
  const veggie = veggieResponse.getResponseText().trim();
  
  // Save
  const specialDates = getSpecialDates();
  specialDates[dateKey] = {
    name: name,
    meat: meat,
    starch: starch,
    veggie: veggie
  };
  saveSpecialDates(specialDates);
  
  ui.alert(`Special date added!\n\n${dateKey} - ${name}\nMeat: ${meat}\nStarch: ${starch}\nVeggie: ${veggie}`);
}

/**
 * Removes a special date via user input
 */
function removeSpecialDate() {
  const ui = SpreadsheetApp.getUi();
  const specialDates = getSpecialDates();
  
  if (Object.keys(specialDates).length === 0) {
    ui.alert('No special dates to remove.');
    return;
  }
  
  let message = 'Enter the date (MM-DD) to remove:\n\n';
  Object.keys(specialDates).forEach(dateKey => {
    message += `${dateKey} - ${specialDates[dateKey].name}\n`;
  });
  
  const response = ui.prompt(
    'Remove Special Date',
    message,
    ui.ButtonSet.OK_CANCEL
  );
  
  if (response.getSelectedButton() !== ui.Button.OK) return;
  const dateKey = response.getResponseText().trim();
  
  if (specialDates[dateKey]) {
    delete specialDates[dateKey];
    saveSpecialDates(specialDates);
    ui.alert(`Special date ${dateKey} has been removed.`);
  } else {
    ui.alert(`Date ${dateKey} not found.`);
  }
}

/**
 * Gets meal history from script properties
 * Stores the last N weeks of menus to avoid repetition
 */
function getMealHistory() {
  const props = PropertiesService.getScriptProperties();
  const historyJson = props.getProperty('MEAL_HISTORY');
  
  if (historyJson) {
    return JSON.parse(historyJson);
  }
  return [];
}

/**
 * Saves meal history (keeps last 8 weeks)
 */
function saveMealHistory(menu) {
  const history = getMealHistory();
  const weekData = {
    date: new Date().toISOString(),
    menu: menu
  };
  
  history.unshift(weekData); // Add to beginning
  
  // Keep only last 8 weeks
  if (history.length > 8) {
    history.splice(8);
  }
  
  const props = PropertiesService.getScriptProperties();
  props.setProperty('MEAL_HISTORY', JSON.stringify(history));
}

/**
 * Checks if a meal combination was used recently (within last 4 weeks)
 */
function wasRecentlyUsed(meat, starch, veggie) {
  const history = getMealHistory();
  const recentWeeks = history.slice(0, 4); // Check last 4 weeks
  
  for (let week of recentWeeks) {
    for (let meal of week.menu) {
      if (meal.meat === meat && meal.starch === starch && meal.veggie === veggie) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Views meal history
 */
function viewMealHistory() {
  const ui = SpreadsheetApp.getUi();
  const history = getMealHistory();
  
  if (history.length === 0) {
    ui.alert('No meal history available yet.');
    return;
  }
  
  let message = 'Meal History (Last 8 Weeks)\n';
  message += '================================\n\n';
  
  history.forEach((week, index) => {
    const date = new Date(week.date);
    message += `Week ${index + 1} - ${date.toLocaleDateString()}\n`;
    message += '---\n';
    week.menu.slice(0, 3).forEach(meal => {
      message += `${meal.day}: ${meal.meat}, ${meal.starch}, ${meal.veggie}\n`;
    });
    message += '...\n\n';
  });
  
  ui.alert(message);
}

/**
 * Clears meal history
 */
function clearMealHistory() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    'Clear Meal History',
    'Are you sure you want to clear all meal history?',
    ui.ButtonSet.YES_NO
  );
  
  if (response === ui.Button.YES) {
    const props = PropertiesService.getScriptProperties();
    props.deleteProperty('MEAL_HISTORY');
    ui.alert('Meal history cleared.');
  }
}

/**
 * Gets email recipients list
 */
function getEmailRecipients() {
  const props = PropertiesService.getScriptProperties();
  const recipientsJson = props.getProperty('EMAIL_RECIPIENTS');
  
  if (recipientsJson) {
    return JSON.parse(recipientsJson);
  }
  // Default to current user
  return [Session.getActiveUser().getEmail()];
}

/**
 * Saves email recipients list
 */
function saveEmailRecipients(recipients) {
  const props = PropertiesService.getScriptProperties();
  props.setProperty('EMAIL_RECIPIENTS', JSON.stringify(recipients));
}

/**
 * Manages email recipients
 */
function manageEmailRecipients() {
  const ui = SpreadsheetApp.getUi();
  const currentRecipients = getEmailRecipients();
  
  let message = 'Current Email Recipients:\n\n';
  currentRecipients.forEach((email, index) => {
    message += `${index + 1}. ${email}\n`;
  });
  message += '\nEnter email addresses separated by commas to update the list:';
  
  const response = ui.prompt(
    'Manage Email Recipients',
    message,
    ui.ButtonSet.OK_CANCEL
  );
  
  if (response.getSelectedButton() !== ui.Button.OK) return;
  
  const input = response.getResponseText().trim();
  if (input) {
    const newRecipients = input.split(',').map(email => email.trim()).filter(email => email);
    if (newRecipients.length > 0) {
      saveEmailRecipients(newRecipients);
      ui.alert(`Email recipients updated! Will send to:\n${newRecipients.join('\n')}`);
    } else {
      ui.alert('No valid email addresses entered.');
    }
  }
}

/**
 * Determines the meat type based on the item name
 */
function getMeatType(meatItem) {
  const itemLower = meatItem.toLowerCase();
  
  if (itemLower.includes('chicken')) return 'chicken';
  if (itemLower.includes('pork')) return 'pork';
  if (itemLower.includes('fish')) return 'fish';
  if (itemLower.includes('shrimp')) return 'shrimp';
  if (itemLower.includes('beef')) return 'beef';
  
  return 'other'; // Items not subject to limits
}

/**
 * Picks a weekly menu (7 days) respecting the meat type limits,
 * ensuring no meat is repeated on consecutive days,
 * ensuring each specific meat item is used only once per week,
 * ensuring starches appear max 3 times per week,
 * ensuring veggies appear max 2 times per week,
 * avoiding recently used meal combinations (last 4 weeks),
 * and checking for special dates/meals
 */
function pickWeeklyMenu(startDate = null) {
  // If no start date provided, use next Sunday
  if (!startDate) {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilSunday = (7 - dayOfWeek) % 7;
    startDate = new Date(today);
    startDate.setDate(today.getDate() + daysUntilSunday);
  }
  
  const data = getMenuData();
  const weeklyMenu = [];
  const meatCounts = {
    'chicken': 0,
    'pork': 0,
    'fish': 0,
    'shrimp': 0,
    'beef': 0
  };
  
  let previousMeat = null; // Track the previous day's meat
  const usedMeats = new Set(); // Track all meats used this week
  const starchCounts = {}; // Track count of each starch
  const veggieCounts = {}; // Track count of each veggie
  
  // Separate meats by type for easier selection
  const meatsByType = {
    'chicken': [],
    'pork': [],
    'fish': [],
    'shrimp': [],
    'other': []
  };
  
  data.meats.forEach(meat => {
    const type = getMeatType(meat);
    meatsByType[type].push(meat);
  });
  
  // Initialize starch and veggie counts
  data.starches.forEach(starch => starchCounts[starch] = 0);
  data.veggies.forEach(veggie => veggieCounts[veggie] = 0);
  
  // Pick 7 days of meals
  for (let day = 0; day < 7; day++) {
    // Calculate the actual date for this day
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + day);
    
    // Check if this is a special date
    const specialMeal = getSpecialMealForDate(currentDate);
    
    let meat = null;
    let starch = null;
    let veggie = null;
    
    // If this is a special date, use the special meal
    if (specialMeal) {
      meat = specialMeal.meat;
      starch = specialMeal.starch;
      veggie = specialMeal.veggie;
      
      // Update tracking for special meals
      usedMeats.add(meat);
      const meatType = getMeatType(meat);
      if (meatType !== 'other' && meatCounts[meatType] !== undefined) {
        meatCounts[meatType]++;
      }
      if (starchCounts[starch] !== undefined) {
        starchCounts[starch]++;
      } else {
        starchCounts[starch] = 1;
      }
      if (veggieCounts[veggie] !== undefined) {
        veggieCounts[veggie]++;
      } else {
        veggieCounts[veggie] = 1;
      }
      previousMeat = meat;
      
      // Add to menu with special indicator
      weeklyMenu.push({
        day: DAYS_OF_WEEK[day],
        date: currentDate.toLocaleDateString(),
        meat: meat,
        starch: starch,
        veggie: veggie,
        isSpecial: true,
        specialName: specialMeal.name
      });
      
      continue; // Skip to next day
    }
    
    // Otherwise, pick normally
    let attempts = 0;
    const maxAttempts = 100;
    
    // Try to pick a meat that meets all constraints
    while (meat === null && attempts < maxAttempts) {
      attempts++;
      
      // Get a random meat
      const randomMeat = data.meats[Math.floor(Math.random() * data.meats.length)];
      const meatType = getMeatType(randomMeat);
      
      // Check all constraints:
      // 1. Not used this week yet
      // 2. Different from previous day
      // 3. Within type limits
      const notUsedThisWeek = !usedMeats.has(randomMeat);
      const isDifferentFromPrevious = (previousMeat === null || randomMeat !== previousMeat);
      const isWithinLimits = (meatType === 'other' || meatCounts[meatType] < LIMITS[meatType]);
      
      if (notUsedThisWeek && isDifferentFromPrevious && isWithinLimits) {
        meat = randomMeat;
        usedMeats.add(randomMeat); // Mark this meat as used
        if (meatType !== 'other') {
          meatCounts[meatType]++;
        }
      }
    }
    
    // Fallback if we couldn't find a valid meat
    if (meat === null) {
      // Try to find any meat that hasn't been used and is different from previous
      for (let i = 0; i < data.meats.length; i++) {
        if (!usedMeats.has(data.meats[i]) && data.meats[i] !== previousMeat) {
          meat = data.meats[i];
          usedMeats.add(meat);
          break;
        }
      }
      // Second fallback: just find any unused meat
      if (meat === null) {
        for (let i = 0; i < data.meats.length; i++) {
          if (!usedMeats.has(data.meats[i])) {
            meat = data.meats[i];
            usedMeats.add(meat);
            break;
          }
        }
      }
      // Ultimate fallback (should rarely happen if you have enough meat options)
      if (meat === null) {
        meat = data.meats[0];
      }
    }
    
    previousMeat = meat; // Update previous meat for next iteration
    
    // Pick starch with max 3 times per week limit
    starch = null;
    attempts = 0;
    while (starch === null && attempts < maxAttempts) {
      attempts++;
      const randomStarch = data.starches[Math.floor(Math.random() * data.starches.length)];
      if (starchCounts[randomStarch] < 3) {
        starch = randomStarch;
        starchCounts[randomStarch]++;
      }
    }
    // Fallback: find any starch under the limit
    if (starch === null) {
      for (let i = 0; i < data.starches.length; i++) {
        if (starchCounts[data.starches[i]] < 3) {
          starch = data.starches[i];
          starchCounts[starch]++;
          break;
        }
      }
    }
    // Ultimate fallback
    if (starch === null) {
      starch = data.starches[0];
    }
    
    // Pick veggie with max 2 times per week limit
    veggie = null;
    attempts = 0;
    while (veggie === null && attempts < maxAttempts) {
      attempts++;
      const randomVeggie = data.veggies[Math.floor(Math.random() * data.veggies.length)];
      if (veggieCounts[randomVeggie] < 2) {
        veggie = randomVeggie;
        veggieCounts[randomVeggie]++;
      }
    }
    // Fallback: find any veggie under the limit
    if (veggie === null) {
      for (let i = 0; i < data.veggies.length; i++) {
        if (veggieCounts[data.veggies[i]] < 2) {
          veggie = data.veggies[i];
          veggieCounts[veggie]++;
          break;
        }
      }
    }
    // Ultimate fallback
    if (veggie === null) {
      veggie = data.veggies[0];
    }
    
    // Try to avoid recently used combinations (best effort)
    let combinationAttempts = 0;
    while (wasRecentlyUsed(meat, starch, veggie) && combinationAttempts < 20) {
      // Try to swap out one component
      if (combinationAttempts % 3 === 0 && data.starches.length > 1) {
        starch = data.starches[Math.floor(Math.random() * data.starches.length)];
        if (starchCounts[starch] >= 3) starch = data.starches[0]; // Fallback
      } else if (combinationAttempts % 3 === 1 && data.veggies.length > 1) {
        veggie = data.veggies[Math.floor(Math.random() * data.veggies.length)];
        if (veggieCounts[veggie] >= 2) veggie = data.veggies[0]; // Fallback
      }
      combinationAttempts++;
    }
    
    weeklyMenu.push({
      day: DAYS_OF_WEEK[day],
      date: currentDate.toLocaleDateString(),
      meat: meat,
      starch: starch,
      veggie: veggie,
      isSpecial: false
    });
  }
  
  // Save this menu to history
  saveMealHistory(weeklyMenu);
  
  return weeklyMenu;
}

/**
 * Formats the weekly menu as HTML for email (mobile-friendly)
 */
function formatMenuAsHTML(menu) {
  let html = '<html><head>';
  html += '<meta name="viewport" content="width=device-width, initial-scale=1.0">';
  html += '<style>';
  html += 'body { font-family: Arial, sans-serif; margin: 0; padding: 10px; max-width: 600px; }';
  html += 'h2 { color: #4CAF50; margin-bottom: 10px; }';
  html += 'table { width: 100%; border-collapse: collapse; font-size: 14px; }';
  html += 'th { background-color: #4CAF50; color: white; padding: 8px; text-align: left; }';
  html += 'td { padding: 8px; border-bottom: 1px solid #ddd; }';
  html += '.special-row { background-color: #FFD700 !important; }';
  html += '.day-cell { font-weight: bold; min-width: 80px; }';
  html += '.special-name { font-size: 0.85em; font-style: italic; color: #666; }';
  html += '@media screen and (max-width: 600px) {';
  html += '  table { font-size: 12px; }';
  html += '  th, td { padding: 6px 4px; }';
  html += '  .date-col { display: none; }';
  html += '}';
  html += '</style>';
  html += '</head><body>';
  html += '<h2>📅 Weekly Menu</h2>';
  html += '<p>Here\'s your meal plan for the upcoming week:</p>';
  html += '<table>';
  html += '<thead><tr>';
  html += '<th class="day-cell">Day</th>';
  html += '<th class="date-col">Date</th>';
  html += '<th>Meat</th>';
  html += '<th>Starch</th>';
  html += '<th>Veggie</th>';
  html += '</tr></thead>';
  html += '<tbody>';
  
  menu.forEach((meal, index) => {
    let bgColor = index % 2 === 0 ? '#f9f9f9' : 'white';
    const rowClass = meal.isSpecial ? 'special-row' : '';
    
    html += `<tr class="${rowClass}" style="background-color: ${meal.isSpecial ? '#FFD700' : bgColor};">`;
    
    // Day column
    const dayDisplay = meal.isSpecial ? `${meal.day} 🎉` : meal.day;
    html += `<td class="day-cell">${dayDisplay}`;
    if (meal.isSpecial) {
      html += `<br><span class="special-name">${meal.specialName}</span>`;
    }
    html += '</td>';
    
    // Date column (hidden on mobile)
    html += `<td class="date-col">${meal.date || ''}</td>`;
    
    // Food columns
    html += `<td>${meal.meat}</td>`;
    html += `<td>${meal.starch}</td>`;
    html += `<td>${meal.veggie}</td>`;
    html += '</tr>';
  });
  
  html += '</tbody></table>';
  html += '<p style="margin-top: 20px; font-size: 0.9em; color: #666;">✨ <em>Bon appétit!</em></p>';
  html += '</body></html>';
  
  return html;
}

/**
 * Formats the weekly menu as plain text
 */
function formatMenuAsText(menu) {
  let text = 'Weekly Menu\n';
  text += '===========\n\n';
  text += 'Here\'s your meal plan for the upcoming week:\n\n';
  
  menu.forEach(meal => {
    const dayDisplay = meal.isSpecial ? `${meal.day} 🎉 (${meal.specialName})` : meal.day;
    text += `${dayDisplay}`;
    if (meal.date) {
      text += ` - ${meal.date}`;
    }
    text += ':\n';
    text += `  Meat: ${meal.meat}\n`;
    text += `  Starch: ${meal.starch}\n`;
    text += `  Veggie: ${meal.veggie}\n\n`;
  });
  
  text += 'Bon appétit!';
  
  return text;
}

/**
 * Sends the weekly menu via email to all recipients
 */
function sendWeeklyMenuEmail() {
  try {
    // Check if we should send emails yet based on start date
    const startDate = getEmailStartDate();
    const today = new Date();
    
    if (startDate && today < startDate) {
      Logger.log(`Email not sent. Start date is ${startDate.toLocaleDateString()}, today is ${today.toLocaleDateString()}`);
      // Don't show alert when running from trigger
      if (typeof SpreadsheetApp !== 'undefined') {
        try {
          SpreadsheetApp.getUi().alert(`Emails will not be sent until ${startDate.toLocaleDateString()}.\n\nCurrent date: ${today.toLocaleDateString()}`);
        } catch (e) {
          // Running from trigger, can't show UI
        }
      }
      return;
    }
    
    const menu = pickWeeklyMenu();
    const htmlBody = formatMenuAsHTML(menu);
    const textBody = formatMenuAsText(menu);
    
    // Get all email recipients
    const recipients = getEmailRecipients();
    const recipientList = recipients.join(', ');
    
    MailApp.sendEmail({
      to: recipientList,
      subject: '📅 Weekly Menu Plan',
      body: textBody,
      htmlBody: htmlBody
    });
    
    Logger.log('Weekly menu email sent successfully to: ' + recipientList);
    
    // Try to show alert (will fail silently if running from trigger)
    try {
      SpreadsheetApp.getUi().alert(`Email sent successfully to:\n${recipients.join('\n')}`);
    } catch (e) {
      // Running from trigger, can't show UI
    };
    
  } catch (error) {
    Logger.log('Error sending email: ' + error.toString());
    SpreadsheetApp.getUi().alert('Error sending email: ' + error.toString());
  }
}

/**
 * Displays the menu in the spreadsheet (for testing)
 */
function generateAndDisplayMenu() {
  try {
    const menu = pickWeeklyMenu();
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Find a clear area to display the menu (starting from column E)
    const startRow = 1;
    const startCol = 5; // Column E
    
    // Clear previous menu
    sheet.getRange(startRow, startCol, 20, 6).clear();
    
    // Write headers
    sheet.getRange(startRow, startCol, 1, 6).setValues([['Day', 'Date', 'Meat', 'Starch', 'Veggie', 'Special']]);
    sheet.getRange(startRow, startCol, 1, 6).setFontWeight('bold');
    sheet.getRange(startRow, startCol, 1, 6).setBackground('#4CAF50');
    sheet.getRange(startRow, startCol, 1, 6).setFontColor('white');
    
    // Write menu data
    for (let i = 0; i < menu.length; i++) {
      const meal = menu[i];
      const specialText = meal.isSpecial ? meal.specialName : '';
      
      sheet.getRange(startRow + 1 + i, startCol, 1, 6).setValues([[
        meal.day,
        meal.date || '',
        meal.meat,
        meal.starch,
        meal.veggie,
        specialText
      ]]);
      
      // Highlight special dates
      if (meal.isSpecial) {
        sheet.getRange(startRow + 1 + i, startCol, 1, 6).setBackground('#FFD700');
      }
    }
    
    SpreadsheetApp.getUi().alert('Weekly menu generated! Check columns E-J.');
    
  } catch (error) {
    SpreadsheetApp.getUi().alert('Error: ' + error.toString());
  }
}

/**
 * Gets the configured email start date
 */
function getEmailStartDate() {
  const props = PropertiesService.getScriptProperties();
  const startDateStr = props.getProperty('EMAIL_START_DATE');
  
  if (startDateStr) {
    return new Date(startDateStr);
  }
  return null;
}

/**
 * Saves the email start date
 */
function saveEmailStartDate(date) {
  const props = PropertiesService.getScriptProperties();
  props.setProperty('EMAIL_START_DATE', date.toISOString());
}

/**
 * Clears the email start date
 */
function clearEmailStartDate() {
  const props = PropertiesService.getScriptProperties();
  props.deleteProperty('EMAIL_START_DATE');
}

/**
 * Configures the start date for email sending
 */
function configureEmailStartDate() {
  const ui = SpreadsheetApp.getUi();
  
  const currentStartDate = getEmailStartDate();
  let message = 'Configure Email Start Date\n\n';
  
  if (currentStartDate) {
    message += `Current start date: ${currentStartDate.toLocaleDateString()}\n\n`;
  } else {
    message += 'No start date configured (emails send immediately).\n\n';
  }
  
  message += 'Enter a start date (MM/DD/YYYY) or leave blank to send immediately:\n';
  message += 'Example: 12/25/2025';
  
  const response = ui.prompt(
    'Email Start Date',
    message,
    ui.ButtonSet.OK_CANCEL
  );
  
  if (response.getSelectedButton() !== ui.Button.OK) return;
  
  const input = response.getResponseText().trim();
  
  if (!input) {
    // Clear start date
    clearEmailStartDate();
    ui.alert('Start date cleared. Emails will be sent starting immediately on the next scheduled Friday.');
    return;
  }
  
  // Parse the date
  try {
    const dateParts = input.split('/');
    if (dateParts.length !== 3) {
      throw new Error('Invalid format');
    }
    
    const month = parseInt(dateParts[0]) - 1; // Month is 0-indexed
    const day = parseInt(dateParts[1]);
    const year = parseInt(dateParts[2]);
    
    const startDate = new Date(year, month, day);
    
    if (isNaN(startDate.getTime())) {
      throw new Error('Invalid date');
    }
    
    saveEmailStartDate(startDate);
    ui.alert(`Email start date set to: ${startDate.toLocaleDateString()}\n\nEmails will only be sent on or after this date.`);
    
  } catch (error) {
    ui.alert('Invalid date format. Please use MM/DD/YYYY format (e.g., 12/25/2025).');
  }
}

/**
 * Sets up a weekly trigger to send email every Friday at 9 AM
 */
function setupWeeklyTrigger() {
  // Delete existing triggers for this function
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'sendWeeklyMenuEmail') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  
  // Create new weekly trigger for Friday at 9 AM
  ScriptApp.newTrigger('sendWeeklyMenuEmail')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.FRIDAY)
    .atHour(9)
    .create();
  
  const startDate = getEmailStartDate();
  let message = 'Weekly email trigger set up successfully!\nEmails will be sent every Friday at 9 AM';
  
  if (startDate) {
    message += `\n\nStart date: ${startDate.toLocaleDateString()}\nEmails will only be sent on or after this date.`;
  } else {
    message += '.\n\nNo start date configured. Emails will begin immediately.';
  }
  
  SpreadsheetApp.getUi().alert(message);
}

/**
 * Function to manually delete all triggers (useful for cleanup)
 */
function deleteAllTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    ScriptApp.deleteTrigger(trigger);
  });
  
  SpreadsheetApp.getUi().alert('All triggers deleted.');
}
