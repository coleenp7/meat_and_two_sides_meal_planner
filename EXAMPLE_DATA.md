# Example Data for Menu Picker

Copy this data into your Google Sheet to get started quickly!

**Tip:** You can add header labels in Row 1 (like "Meat", "Starch", "Veggie") and the script will automatically ignore them. The script filters out common header words: meat, starch, veggie, veggies, vegetable, vegetables.

## Column A - Meat
```
Chicken Breast
Chicken Thighs
Grilled Chicken
Pork Chops
Pork Tenderloin
Fish Fillet
Salmon
Shrimp
Ground Turkey
Chicken Wings
Turkey Breast
Tilapia
```

**Note:** Beef is currently set to 0 times per week (disabled). To enable beef, edit the LIMITS in Code.gs and change `'beef': 0` to your desired limit (e.g., `'beef': 2`).

**Important:** You need at least 7 different meats since each specific meat can only be used once per week!

## Column B - Starch
```
White Rice
Brown Rice
Pasta
Mashed Potatoes
Baked Potato
Sweet Potato
Quinoa
Couscous
Bread
Risotto
Polenta
Noodles
```

**Note:** Each starch can appear up to 3 times per week. Having at least 4 different starches ensures good variety.

## Column C - Veggie
```
Broccoli
Carrots
Green Beans
Asparagus
Brussels Sprouts
Spinach
Mixed Salad
Corn
Peas
Zucchini
Bell Peppers
Cauliflower
```

**Note:** Each veggie can appear up to 2 times per week. Having at least 4 different veggies ensures good variety.

## Quick Setup Instructions

1. Open your Google Sheet
2. Put "Meat" in cell A1, "Starch" in B1, "Veggie" in C1
3. Copy the items from each section above into the respective columns starting at row 2
4. Follow the installation instructions in README.md

## Sample Output

When you run the menu picker, you'll get something like this:

| Day       | Date       | Meat           | Starch        | Veggie          | Special |
|-----------|------------|----------------|---------------|-----------------|---------|
| Sunday    | 10/20/2025 | Chicken Breast | Rice          | Broccoli        |         |
| Monday    | 10/21/2025 | Fish Fillet    | Pasta         | Green Beans     |         |
| Tuesday   | 10/22/2025 | Pork Chops     | Potatoes      | Carrots         |         |
| Wednesday | 10/23/2025 | Grilled Chicken| Quinoa        | Asparagus       |         |
| Thursday  | 10/24/2025 | Ground Turkey  | Sweet Potato  | Brussels Sprouts|         |
| Friday    | 10/25/2025 | Chicken Thighs | Couscous      | Spinach         |         |
| Saturday  | 10/26/2025 | Pork Tenderloin| Risotto       | Mixed Salad     |         |

### Constraint Verification:
- ✅ Chicken appears 3 times (Chicken Breast, Grilled Chicken, Chicken Thighs) - within the 3-time limit
- ✅ Pork appears 2 times (Pork Chops, Pork Tenderloin) - within the 2-time limit
- ✅ Fish appears 1 time (Fish Fillet) - within the 1-time limit
- ✅ Shrimp appears 0 times - within the 1-time limit
- ✅ Beef appears 0 times - limit is set to 0
- ✅ No meat repeated on consecutive days
- ✅ Each specific meat used only once
- ✅ No starch appears more than 3 times
- ✅ No veggie appears more than 2 times

## Example Special Dates

Here are some special dates you might want to add:

### Birthday Examples
```
Date: 03-15
Name: Dad's Birthday
Meat: Ribeye Steak
Starch: Loaded Baked Potato
Veggie: Grilled Asparagus
```

```
Date: 07-22
Name: Mom's Birthday
Meat: Lobster Tail
Starch: Garlic Butter Rice
Veggie: Roasted Brussels Sprouts
```

### Holiday Examples
```
Date: 12-25
Name: Christmas Dinner
Meat: Prime Rib
Starch: Garlic Mashed Potatoes
Veggie: Green Bean Casserole
```

```
Date: 11-28
Name: Thanksgiving (approx)
Meat: Roasted Turkey
Starch: Stuffing
Veggie: Cranberry Glazed Carrots
```

### Anniversary Example
```
Date: 06-14
Name: Wedding Anniversary
Meat: Filet Mignon
Starch: Truffle Risotto
Veggie: Roasted Asparagus
```

## Sample Output with Special Date

When a special date falls in your menu week:

| Day       | Date       | Meat           | Starch           | Veggie            | Special           |
|-----------|------------|----------------|------------------|-------------------|-------------------|
| Sunday    | 03/10/2025 | Chicken Breast | Rice             | Broccoli          |                   |
| Monday    | 03/11/2025 | Fish Fillet    | Pasta            | Green Beans       |                   |
| Tuesday   | 03/12/2025 | Pork Chops     | Potatoes         | Carrots           |                   |
| Wednesday | 03/13/2025 | Grilled Chicken| Quinoa           | Asparagus         |                   |
| Thursday  | 03/14/2025 | Shrimp         | Sweet Potato     | Spinach           |                   |
| Friday    | 03/15/2025 | **Ribeye Steak** | **Loaded Baked Potato** | **Grilled Asparagus** | **🎉 Dad's Birthday** |
| Saturday  | 03/16/2025 | Pork Tenderloin| Risotto          | Mixed Salad       |                   |

**Note:** The special date (Friday) is highlighted in gold in the email and spreadsheet display!

## Managing Multiple Recipients

### Example Setup
```
Menu Picker → Manage Email Recipients
Enter: mom@family.com, dad@family.com, sister@family.com

Result: All three people will receive the weekly menu email every Friday at 9 AM
```

### Use Cases
- **Family**: Send to all family members so everyone knows the meal plan
- **Roommates**: Share the weekly menu with people you live with
- **Meal Prep Group**: Coordinate meals with friends who meal prep together
- **Caregivers**: Keep caregivers informed of meal plans

## How Meal History Works

### Automatic Tracking
- The system remembers your last 8 weeks of menus
- When generating a new menu, it checks the last 4 weeks
- If a meal combination (meat + starch + veggie) was used recently, it tries to pick different sides
- This ensures variety without repeating the same meals too often

### Example
**Week 1:** Chicken Breast + Rice + Broccoli
**Week 2:** The system will avoid "Chicken Breast + Rice + Broccoli" but could use:
- Chicken Breast + Pasta + Carrots ✅
- Chicken Thighs + Rice + Broccoli ✅
- Grilled Chicken + Rice + Green Beans ✅

### Viewing Your History
Click **Menu Picker → View Meal History** to see what you've eaten in the past 8 weeks.

## Mobile-Friendly Email Features

The email automatically adapts to your device:

### On Desktop/Tablet
- Full 5-column table (Day, Date, Meat, Starch, Veggie)
- Comfortable 14px font size
- Generous padding for easy reading

### On Mobile Phone
- Date column automatically hidden to save space
- Smaller 12px font to fit more content
- Tighter padding optimized for touch
- Still shows all important information (day, meat, starch, veggie)
- Special dates still highlighted in gold

### All Devices
- Responsive width (max 600px for optimal reading)
- Easy-to-read fonts
- Color-coded special occasions
- Emoji indicators (🎉) for special dates

## Configuring Email Start Date

### Default Behavior
**By default, emails start immediately on the next scheduled Friday.** You don't need to configure a start date unless you want to delay sending.

### When to Use
This optional feature is useful if you want to:
- **Setup in advance**: Configure the system now but start sending emails later
- **Vacation mode**: Temporarily pause emails by setting a future start date
- **Seasonal planning**: Start meal planning when school/work schedule changes

### Example Scenarios

**Scenario 1: Set up now, start next month**
```
Menu Picker → Configure Email Start Date
Enter: 11/01/2025
Result: Trigger is active but emails won't send until November 1st
```

**Scenario 2: Pause for vacation**
```
Current: Emails sending weekly
Action: Set start date to 12/20/2025
Result: No emails sent until December 20th, then resumes
```

**Scenario 3: Resume immediately (Default)**
```
Current: Start date set to future
Action: Menu Picker → Configure Email Start Date → Leave blank and click OK
Result: Start date cleared - emails resume on next Friday (immediate/default mode)
```

### How It Works
1. **Default**: No start date is configured, emails send immediately
2. The weekly trigger runs every Friday at 9 AM (always active)
3. **If start date configured**: Checks if today's date >= configured start date
4. Before start date: No email is sent (logged only)
5. After start date: Emails send normally every Friday
6. **Most users don't need to set a start date** - it's only for delayed/paused scenarios
