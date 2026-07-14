# 🌸 EmailJS Setup Guide - Partner Notifications

This guide will help you set up EmailJS to send beautiful partner notification emails without requiring Firebase Cloud Functions.

## 🚀 Step-by-Step Setup

### **Step 1: Create EmailJS Account**
1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Click **"Sign Up"** and create a free account
3. Verify your email address

### **Step 2: Set Up Email Service**
1. In EmailJS dashboard, go to **"Email Services"**
2. Click **"Add New Service"**
3. Choose **"Gmail"** from the list
4. Connect your Gmail account (nehachrasta09@gmail.com)
5. Click **"Create Service"**
6. **Copy the Service ID** (you'll need this later)

### **Step 3: Create Email Templates**

#### **Template 1: Period Alert (3 days before)**
1. Go to **"Email Templates"**
2. Click **"Create New Template"**
3. Name it: **"Period Alert"**
4. Use this HTML template:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Period Alert</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fefefe;">
    <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #FF4D8F; margin: 0;">🌸 DotDay</h1>
        <p style="color: #666; margin: 10px 0;">Breaking Silence, Building Support</p>
    </div>
    
    <div style="background-color: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h2 style="color: #333; margin-bottom: 20px;">Period Alert</h2>
        
        <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
            Hi {{partner_name}},
        </p>
        
        <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
            This is a friendly reminder that <strong>{{user_name}}</strong>'s period is expected to start in approximately <strong>{{days_until_period}} days</strong>.
        </p>
        
        <div style="background-color: #FFF5F7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FF4D8F;">
            <h3 style="color: #FF4D8F; margin: 0 0 10px 0;">💡 How you can help:</h3>
            <ul style="color: #555; margin: 0; padding-left: 20px;">
                <li>Be extra understanding and supportive</li>
                <li>Offer to help with daily tasks if needed</li>
                <li>Listen without trying to fix everything</li>
                <li>Respect their need for space or comfort</li>
            </ul>
        </div>
        
        <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
            Remember, this is a natural part of their cycle and your support makes a big difference.
        </p>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; margin: 0;">
                This notification was sent from DotDay app.<br>
                You can manage your notification preferences in the app settings.
            </p>
        </div>
    </div>
</body>
</html>
```

5. **Copy the Template ID** (you'll need this later)

#### **Template 2: Period Started (immediate)**
1. Click **"Create New Template"** again
2. Name it: **"Period Started"**
3. Use this HTML template:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Period Started</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fefefe;">
    <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #FF4D8F; margin: 0;">🌸 DotDay</h1>
        <p style="color: #666; margin: 10px 0;">Breaking Silence, Building Support</p>
    </div>
    
    <div style="background-color: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h2 style="color: #333; margin-bottom: 20px;">Period Started</h2>
        
        <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
            Hi {{partner_name}},
        </p>
        
        <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
            <strong>{{user_name}}</strong> has logged that their period has started today.
        </p>
        
        <div style="background-color: #FFF5F7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FF4D8F;">
            <h3 style="color: #FF4D8F; margin: 0 0 10px 0;">💡 Support suggestions:</h3>
            <ul style="color: #555; margin: 0; padding-left: 20px;">
                <li>Offer comfort and understanding</li>
                <li>Help with household tasks if needed</li>
                <li>Be patient with mood changes</li>
                <li>Respect their comfort needs</li>
            </ul>
        </div>
        
        <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
            Your support during this time is greatly appreciated.
        </p>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; margin: 0;">
                This notification was sent from DotDay app.<br>
                You can manage your notification preferences in the app settings.
            </p>
        </div>
    </div>
</body>
</html>
```

4. **Copy the Template ID** (you'll need this later)

### **Step 4: Get Your User ID**
1. In EmailJS dashboard, go to **"Account"** → **"API Keys"**
2. **Copy your Public Key** (this is your User ID)

### **Step 5: Update Configuration**
1. Open `src/services/emailService.js`
2. Replace the placeholder values with your actual IDs:

```javascript
const EMAILJS_CONFIG = {
  SERVICE_ID: 'YOUR_SERVICE_ID', // Replace with your EmailJS service ID
  TEMPLATE_ID_PERIOD_ALERT: 'YOUR_TEMPLATE_ID_ALERT', // Replace with Period Alert template ID
  TEMPLATE_ID_PERIOD_STARTED: 'YOUR_TEMPLATE_ID_STARTED', // Replace with Period Started template ID
  USER_ID: 'YOUR_USER_ID' // Replace with your EmailJS public key
};
```

## 📧 How It Works

### **Automatic Notifications:**
- ✅ **Period Alert**: Sent when period is expected within 3 days
- ✅ **Period Started**: Sent immediately when user logs period start
- ✅ **Beautiful Design**: Professional, supportive email templates
- ✅ **Personalized**: Includes user and partner names

### **Integration Points:**
1. **Calendar Page**: Check for upcoming periods and send alerts
2. **Period Logging**: Send immediate notification when period is logged
3. **Settings Page**: Manage notification preferences

## 🧪 Testing

### **Test Email Sending:**
```javascript
// In your browser console or component
import { sendPeriodAlertEmail } from './src/services/emailService';

// Test period alert
sendPeriodAlertEmail(
  'partner@email.com',
  'Partner Name',
  'User Name',
  3
);

// Test period started
sendPeriodStartedEmail(
  'partner@email.com',
  'Partner Name',
  'User Name'
);
```

## 🆓 Free Tier Limits

EmailJS Free Plan includes:
- ✅ **200 emails per month**
- ✅ **2 email templates**
- ✅ **1 email service**
- ✅ **Perfect for testing and small apps**

## 🎯 Success Indicators

You'll know it's working when:
- ✅ EmailJS account is set up
- ✅ Service and templates are created
- ✅ Configuration is updated in code
- ✅ Test emails are sent successfully
- ✅ Partner receives beautiful notification emails

## 🐛 Troubleshooting

### **Common Issues:**
1. **Email not sending**: Check service connection and template IDs
2. **Template not found**: Verify template IDs are correct
3. **Authentication error**: Check your EmailJS public key
4. **Gmail connection**: Ensure Gmail service is properly connected

### **Debug Steps:**
1. Check browser console for errors
2. Verify EmailJS configuration
3. Test with simple email first
4. Check EmailJS dashboard for logs

---

**Need help?** Check EmailJS documentation or contact their support team. 