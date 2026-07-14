# 🌸 DotDay Partner Email Notifications - Setup Guide

This guide will help you set up Firebase Cloud Functions to send email notifications to partners when a user's period is approaching or has started.

## 📋 Prerequisites

1. **Firebase Project**: You need a Firebase project with Firestore enabled
2. **Gmail Account**: A Gmail account for sending emails
3. **Firebase CLI**: Installed and logged in
4. **Node.js**: Version 18 or higher

## 🚀 Step-by-Step Setup

### Step 1: Install Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

### Step 2: Initialize Backend
```bash
cd CodeRed/Backend_Dotday
npm install
```

### Step 3: Configure Gmail App Password

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to [Google Account Settings](https://myaccount.google.com/)
   - Security → 2-Step Verification → App passwords
   - Select "Mail" and generate password
   - Copy the 16-character password

### Step 4: Set Firebase Configuration
```bash
# Set your Firebase project
firebase use YOUR_PROJECT_ID

# Configure email settings
firebase functions:config:set email.user="your-email@gmail.com"
firebase functions:config:set email.password="your-16-char-app-password"
```

### Step 5: Deploy Functions
```bash
firebase deploy --only functions
```

## 📧 How It Works

### Email Notifications Sent:

1. **Period Alert (3 days before)**
   - Triggered daily by scheduled function
   - Sends to partner when period is expected within 3 days
   - Includes supportive suggestions

2. **Period Started (immediate)**
   - Triggered when user logs period start
   - Sends immediate notification to partner
   - Acknowledges period start

### Email Template Features:
- ✅ Beautiful DotDay branding
- ✅ Personalized with user and partner names
- ✅ Supportive suggestions for partners
- ✅ Professional HTML design
- ✅ Unsubscribe information

## 🔧 Configuration Options

### Notification Timing
- **Alert Threshold**: 3 days before expected period
- **Check Frequency**: Every 24 hours
- **Immediate Notifications**: When period is logged

### User Requirements
For notifications to be sent, users must have:
```javascript
{
  notificationSettings: {
    partnerUpdates: true  // Must be enabled
  },
  partnerConnection: {
    partnerEmail: "partner@email.com",
    connectionStatus: "connected",  // Must be connected
    partnerName: "Partner Name"
  }
}
```

## 🧪 Testing

### Test Manual Period Check
```bash
# Deploy functions first
firebase deploy --only functions

# Test the function
curl https://YOUR_PROJECT_ID.cloudfunctions.net/manualPeriodCheck
```

### Test with Sample Data
1. Create a test user in Firestore with:
   - `notificationSettings.partnerUpdates: true`
   - `partnerConnection` with valid email
   - Period data that's within 3 days

2. Run manual check to test email sending

## 📊 Monitoring

### Firebase Console
- Go to Firebase Console → Functions
- View execution logs and metrics
- Monitor function performance

### Notification Logs
All sent notifications are logged in Firestore:
```javascript
notifications: {
  userId: "user_id",
  type: "period_alert" | "period_started",
  recipientEmail: "partner@email.com",
  daysUntilPeriod: 3, // for alerts only
  sentAt: Timestamp,
  status: "sent"
}
```

## 🔒 Security & Privacy

### Email Security
- Uses Gmail App Passwords (not regular passwords)
- Encrypted transmission
- No email content stored in database

### Data Privacy
- Only sends to verified partner emails
- Respects user notification preferences
- Logs only metadata, not email content

### Rate Limiting
- Built-in Firebase rate limiting
- Prevents spam and abuse
- Respects Gmail sending limits

## 🐛 Troubleshooting

### Common Issues

1. **Email not sending**
   ```
   ❌ Check: Gmail app password is correct
   ❌ Check: 2FA is enabled on Gmail
   ✅ Fix: Generate new app password
   ```

2. **Functions not deploying**
   ```
   ❌ Check: Firebase CLI is logged in
   ❌ Check: Project ID is correct
   ✅ Fix: firebase login && firebase use PROJECT_ID
   ```

3. **Partner not receiving emails**
   ```
   ❌ Check: Partner email is correct
   ❌ Check: Connection status is "connected"
   ❌ Check: partnerUpdates is enabled
   ✅ Fix: Verify all settings in app
   ```

### Debug Commands
```bash
# View function logs
firebase functions:log

# Check function status
firebase functions:list

# Test specific function
firebase functions:shell

# View config
firebase functions:config:get
```

## 📱 Frontend Integration

The frontend settings page already supports:
- ✅ Partner connection management
- ✅ Notification preferences
- ✅ Email configuration
- ✅ Connection status display

### Required User Data Structure
```javascript
{
  notificationSettings: {
    partnerUpdates: true,
    periodReminders: true,
    cycleInsights: true,
    wellnessTips: true
  },
  partnerConnection: {
    partnerEmail: "partner@email.com",
    connectionStatus: "connected",
    partnerName: "Partner Name",
    requestedAt: Timestamp
  },
  selectedMode: "normal",
  normalMode: {
    periodDates: ["2024-01-15T00:00:00.000Z"],
    onboarding: {
      cycleLength: "28"
    }
  }
}
```

## 🎯 Success Indicators

You'll know it's working when:
- ✅ Functions deploy without errors
- ✅ Manual test returns success
- ✅ Partner receives test email
- ✅ Firebase Console shows function executions
- ✅ Notifications collection has logged entries

## 📞 Support

If you encounter issues:
1. Check Firebase Console logs
2. Verify email configuration
3. Test with manual function trigger
4. Review user data structure
5. Check Gmail app password setup

## 🚀 Next Steps

After setup:
1. Test with real user data
2. Monitor function performance
3. Adjust notification timing if needed
4. Customize email templates if desired
5. Set up monitoring alerts

---

**Need help?** Check the main README.md for detailed documentation and troubleshooting tips. 