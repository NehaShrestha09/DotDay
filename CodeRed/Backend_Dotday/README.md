# DotDay Backend - Partner Email Notifications

This backend provides Firebase Cloud Functions to send email notifications to partners when a user's period is approaching or has started.

## 🚀 Features

- **Scheduled Period Alerts**: Daily checks for upcoming periods (3 days in advance)
- **Immediate Notifications**: Instant alerts when period is logged
- **Beautiful Email Templates**: Professional, supportive email designs
- **Partner Connection Management**: Only sends to connected partners
- **Notification Preferences**: Respects user notification settings
- **Comprehensive Logging**: Tracks all sent notifications

## 📧 Email Notifications

### 1. Period Alert (3 days before)
- Sent when period is expected to start within 3 days
- Includes supportive suggestions for partners
- Personalized with user and partner names

### 2. Period Started (immediate)
- Sent immediately when user logs period start
- Provides support suggestions
- Acknowledges the start of the period

## 🛠️ Setup Instructions

### 1. Install Dependencies
```bash
cd Backend_Dotday
npm install
```

### 2. Firebase Configuration
```bash
# Login to Firebase
firebase login

# Initialize Firebase Functions
firebase init functions

# Set email configuration
firebase functions:config:set email.user="your-email@gmail.com" email.password="your-app-password"
```

### 3. Gmail App Password Setup
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use this password in the Firebase config

### 4. Deploy Functions
```bash
firebase deploy --only functions
```

## 📋 Environment Variables

Set these in Firebase Functions config:
```bash
firebase functions:config:set email.user="your-email@gmail.com"
firebase functions:config:set email.password="your-app-password"
```

## 🔧 Functions Overview

### `checkUpcomingPeriods`
- **Trigger**: Scheduled (every 24 hours)
- **Purpose**: Checks all users for upcoming periods
- **Action**: Sends alerts to partners 3 days before expected period

### `onPeriodLogged`
- **Trigger**: Firestore document update
- **Purpose**: Detects when period is logged
- **Action**: Sends immediate notification to partner

### `manualPeriodCheck`
- **Trigger**: HTTP request
- **Purpose**: Manual testing of period checks
- **Action**: Runs the same logic as scheduled function

## 📊 Data Requirements

The functions expect user documents with this structure:
```javascript
{
  notificationSettings: {
    partnerUpdates: true
  },
  partnerConnection: {
    partnerEmail: "partner@email.com",
    connectionStatus: "connected",
    partnerName: "Partner Name"
  },
  selectedMode: "normal", // or "tricycling"
  normalMode: {
    periodDates: ["2024-01-15T00:00:00.000Z"],
    onboarding: {
      cycleLength: "28"
    }
  }
}
```

## 🧪 Testing

### Manual Testing
```bash
# Deploy functions
firebase deploy --only functions

# Test manual period check
curl https://your-project.cloudfunctions.net/manualPeriodCheck
```

### Local Testing
```bash
# Start emulator
firebase emulators:start --only functions

# Test with sample data
curl http://localhost:5001/your-project/us-central1/manualPeriodCheck
```

## 📈 Monitoring

### Firebase Console
- Go to Firebase Console → Functions
- View logs and execution metrics
- Monitor function performance

### Notifications Collection
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

## 🔒 Security Considerations

1. **Email Credentials**: Use app passwords, not regular passwords
2. **Rate Limiting**: Functions include built-in rate limiting
3. **Data Privacy**: Only sends to verified partner emails
4. **User Consent**: Respects notification preferences

## 🐛 Troubleshooting

### Common Issues

1. **Email not sending**
   - Check Gmail app password is correct
   - Verify 2FA is enabled
   - Check Firebase function logs

2. **Functions not triggering**
   - Verify deployment was successful
   - Check Firebase Console for errors
   - Ensure user data structure is correct

3. **Partner not receiving emails**
   - Check partner email is correct
   - Verify connection status is "connected"
   - Check notification settings are enabled

### Debug Commands
```bash
# View function logs
firebase functions:log

# Check function status
firebase functions:list

# Test specific function
firebase functions:shell
```

## 📝 Email Templates

The system includes two beautiful email templates:

1. **Period Alert Template**: Professional design with supportive suggestions
2. **Period Started Template**: Immediate notification with support tips

Both templates include:
- DotDay branding
- Personalized content
- Supportive suggestions
- Professional styling
- Unsubscribe information

## 🔄 Integration with Frontend

The frontend should:
1. Set `notificationSettings.partnerUpdates` to `true`
2. Configure `partnerConnection` with partner email
3. Ensure period data is properly logged
4. Handle notification preferences in settings

## 📞 Support

For issues or questions:
1. Check Firebase Console logs
2. Verify email configuration
3. Test with manual function trigger
4. Review user data structure
