# Menu Picker - Google Sheets Extension

A Google Sheets Add-on that automatically generates a weekly menu by selecting items from three categories (meat, starch, and veggie) while respecting weekly limits for specific meat types. The extension sends a formatted email every Friday at 9 AM with the upcoming week's menu.

## Features

- 📋 Picks one item from each category: Meat, Starch, and Veggie
- 🔢 Enforces weekly limits:
  - Chicken: Maximum 3 times per week
  - Pork: Maximum 2 times per week
  - Fish: Maximum 1 time per week
  - Shrimp: Maximum 1 time per week
  - Beef: Maximum 0 times per week (configurable)
  - Starches: Maximum 3 times per week each
  - Veggies: Maximum 2 times per week each
- 🎉 **Special Dates Support**: Set specific meals for birthdays, anniversaries, or other special occasions
- � **Meal History Tracking**: Remembers past 8 weeks and avoids repetitive meal combinations
- 👥 **Multiple Email Recipients**: Send to family members, roommates, or anyone on your list
- 📱 **Mobile-Friendly**: Responsive email design that looks great on phones and tablets
- �📧 Automatically emails the weekly menu every Friday at 9 AM
- 🎨 Formatted HTML email with a clean table layout highlighting special dates
- 📅 Menu starts on Sunday and covers 7 days
- 🚫 No meat repeated on consecutive days
- ✅ Each specific meat item used only once per week

## Installation Instructions

### Step 1: Set Up Your Google Sheet

1. Create a new Google Sheet
2. Set up your data with the following structure:
   - **Column A (Meat)**: List your meat options (e.g., "Chicken Breast", "Pork Chops", "Fish Fillet", "Shrimp")
   - **Column B (Starch)**: List your starch options (e.g., "Rice", "Pasta", "Potatoes")
   - **Column C (Veggie)**: List your vegetable options (e.g., "Broccoli", "Carrots", "Green Beans")
3. Add headers in Row 1 (optional but recommended): "Meat", "Starch", "Veggie"
4. Start your data from Row 2

**Example:**
```
|   A (Meat)      |   B (Starch)   |   C (Veggie)    |
|-----------------|----------------|-----------------|
| Meat            | Starch         | Veggie          |
| Chicken Breast  | Rice           | Broccoli        |
| Pork Chops      | Pasta          | Carrots         |
| Fish Fillet     | Potatoes       | Green Beans     |
| Shrimp          | Quinoa         | Asparagus       |
| Chicken Thighs  | Sweet Potato   | Brussels Sprouts|
| Pork Tenderloin | Couscous       | Spinach         |
```

### Step 2: Add the Apps Script Code

1. In your Google Sheet, click **Extensions** → **Apps Script**
2. Delete any default code in the editor
3. Copy the entire contents of `Code.gs` and paste it into the Apps Script editor
4. Click the **Save** icon (💾) or press `Cmd+S` (Mac) / `Ctrl+S` (Windows)
5. Name your project (e.g., "Menu Picker")

### Step 3: Configure the Script Settings

1. In the Apps Script editor, click on the **Project Settings** (⚙️ gear icon)
2. Scroll down to **Script Properties** (optional - for advanced configuration)
3. Go back to the **Editor** tab

### Step 4: Add the Configuration File

1. In the Apps Script editor, click the **+** next to Files
2. Select **Script**
3. Actually, for `appsscript.json`:
   - Click on **Project Settings** (⚙️)
   - Check the box "Show 'appsscript.json' manifest file in editor"
   - Go back to **Editor**
   - You should now see `appsscript.json` in the files list
4. Click on `appsscript.json` and replace its contents with the contents from the `appsscript.json` file
5. **Important:** Update the `timeZone` field to match your timezone (e.g., "America/Los_Angeles", "Europe/London", "Asia/Tokyo")

### Step 5: Authorize the Script

1. In the Apps Script editor, select the `onOpen` function from the dropdown at the top
2. Click the **Run** button (▶️)
3. A dialog will appear asking for authorization - click **Review Permissions**
4. Choose your Google account
5. Click **Advanced** → **Go to [Your Project Name] (unsafe)**
6. Click **Allow** to grant the necessary permissions

### Step 6: Set Up the Weekly Email Trigger

1. Close the Apps Script editor and return to your Google Sheet
2. Refresh the page - you should see a new menu called **Menu Picker**
3. Click **Menu Picker** → **Setup Weekly Email Trigger**
4. A confirmation message will appear

## Usage

### Manual Menu Generation

To test the menu picker without sending an email:
1. Click **Menu Picker** → **Generate Weekly Menu**
2. The weekly menu will appear in columns E-H of your sheet

### Test Email

To test sending an email:
1. Click **Menu Picker** → **Test Email**
2. You'll receive an email with the weekly menu at your Google account email

### Automatic Weekly Emails

Once you've set up the trigger (Step 6), the extension will automatically:
- Generate a new weekly menu every Friday at 9:00 AM
- Send it to your email address
- The menu will cover the upcoming week starting from Sunday
- Check for special dates and include special meals automatically

## Managing Special Dates

### Adding a Special Date

1. Click **Menu Picker** → **Add Special Date**
2. Enter the date in MM-DD format (e.g., 12-25 for December 25)
3. Enter a name for the special occasion (e.g., "Mom's Birthday", "Anniversary")
4. Enter the specific meat, starch, and veggie for that special meal
5. The special meal will automatically appear in your weekly menu when that date occurs

### Viewing Special Dates

1. Click **Menu Picker** → **View Special Dates**
2. See a list of all saved special dates and their meals

### Removing a Special Date

1. Click **Menu Picker** → **Remove Special Date**
2. Enter the date (MM-DD) you want to remove

**Note:** Special dates are stored permanently and will be used every year on that date. Special meals are highlighted in gold in the email and display.

## Managing Email Recipients

### Setting Up Recipients

1. Click **Menu Picker** → **Manage Email Recipients**
2. View current recipients list
3. Enter new email addresses separated by commas (e.g., `mom@email.com, dad@email.com, me@email.com`)
4. Click OK to save

**Default:** If no recipients are set, emails will be sent to the Google account running the script.

**Tip:** You can add as many recipients as you want. Everyone will receive the same weekly menu.

## Meal History Tracking

The menu picker automatically tracks your last 8 weeks of menus and tries to avoid repeating the exact same meal combinations (meat + starch + veggie) within the last 4 weeks.

### View History

1. Click **Menu Picker** → **View Meal History**
2. See a summary of your past 8 weeks of menus

### Clear History

1. Click **Menu Picker** → **Clear Meal History**
2. Confirm to reset the history (useful if you want to start fresh)

**Note:** History is used to provide variety but won't prevent a menu if it's the only valid option based on all the constraints.

## Customization

### Change Email Recipients (Programmatically)

**Recommended:** Use **Menu Picker → Manage Email Recipients** from the UI instead.

### Mobile Email Display

Emails are automatically optimized for mobile devices:
- On desktop/tablets: Full table with all columns visible
- On mobile phones: Date column is hidden to fit smaller screens
- Responsive fonts and padding adjust to screen size
- Special dates highlighted in gold on all devices

### Modify Meat Type Limits

To change the weekly limits for meat types:

1. Open the Apps Script editor
2. Find the `LIMITS` constant at the top of the code
3. Modify the values:
   ```javascript
   const LIMITS = {
     'chicken': 3,  // Change this number
     'pork': 2,     // Change this number
     'fish': 1,     // Change this number
     'shrimp': 1,   // Change this number
     'beef': 0      // Change to 2 or more to allow beef
   };
   ```

### Change Email Schedule

To change when the email is sent:

1. Open the Apps Script editor
2. Find the `setupWeeklyTrigger()` function
3. Modify these lines:
   ```javascript
   .onWeekDay(ScriptApp.WeekDay.FRIDAY)  // Change the day
   .atHour(9)  // Change the hour (0-23)
   ```

### Change Timezone

1. Open `appsscript.json` in the Apps Script editor
2. Update the `timeZone` value to your timezone
3. Find valid timezone strings here: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones

## Troubleshooting

### Menu Not Generating

- **Check your data**: Ensure you have items in columns A, B, and C starting from row 2
- **Check for empty rows**: Make sure there are no completely empty rows in your data

### Email Not Sending

- **Check authorization**: Re-run the authorization process (Step 5)
- **Check trigger**: Go to Apps Script → **Triggers** (⏰) to verify the trigger is set up
- **Check email address**: Verify the email address in the code

### Limits Not Working

- **Check meat names**: The script identifies meat types by looking for keywords in the item names:
  - Items containing "chicken" → counted as chicken
  - Items containing "pork" → counted as pork
  - Items containing "fish" → counted as fish
  - Items containing "shrimp" → counted as shrimp
- **Case insensitive**: "Chicken", "chicken", and "CHICKEN" all work
- **Be specific**: If you want items counted properly, include the meat type in the name

### Deleting All Triggers

If you need to remove all automatic triggers:
1. Open the Apps Script editor
2. Click on **Triggers** (⏰) in the left sidebar
3. Delete triggers manually, OR
4. Run the `deleteAllTriggers()` function from the editor

## File Structure

```
menu_picker/
├── Code.gs              # Main Google Apps Script code
├── appsscript.json      # Project configuration and permissions
└── README.md            # This file
```

## Privacy & Permissions

This extension requires the following permissions:
- **Spreadsheets**: To read your menu data
- **Send Email**: To send the weekly menu via Gmail
- **Script App**: To set up time-based triggers

Your data never leaves Google's servers and is not shared with any third parties.

## Support

If you encounter any issues or have questions, please check the troubleshooting section above or review the code comments in `Code.gs`.

## License

Free to use and modify for personal or commercial purposes.

---

**Enjoy your automated meal planning! 🍽️**
