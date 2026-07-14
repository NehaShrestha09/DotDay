const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const { addDays, differenceInDays, parseISO } = require('date-fns');

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();

// Email configuration
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: functions.config().email.user,
    pass: functions.config().email.password
  }
});

// Email templates
const emailTemplates = {
  periodNotification: (partnerName, userName, daysUntilPeriod) => ({
    subject: `🌸 Period Alert: ${userName}'s period is approaching`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fefefe;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #FF4D8F; margin: 0;">🌸 DotDay</h1>
          <p style="color: #666; margin: 10px 0;">Breaking Silence, Building Support</p>
        </div>
        
        <div style="background-color: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">Period Alert</h2>
          
          <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
            Hi ${partnerName},
          </p>
          
          <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
            This is a friendly reminder that <strong>${userName}</strong>'s period is expected to start in approximately <strong>${daysUntilPeriod} days</strong>.
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
      </div>
    `
  }),
  
  periodStarted: (partnerName, userName) => ({
    subject: `🌸 Period Started: ${userName} has started their period`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fefefe;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #FF4D8F; margin: 0;">🌸 DotDay</h1>
          <p style="color: #666; margin: 10px 0;">Breaking Silence, Building Support</p>
        </div>
        
        <div style="background-color: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">Period Started</h2>
          
          <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
            Hi ${partnerName},
          </p>
          
          <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
            <strong>${userName}</strong> has logged that their period has started today.
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
      </div>
    `
  })
};

// Helper function to calculate next period date
const calculateNextPeriod = (lastPeriodDate, cycleLength) => {
  const lastDate = parseISO(lastPeriodDate);
  return addDays(lastDate, cycleLength);
};

// Helper function to check if period is near
const isPeriodNear = (nextPeriodDate, daysThreshold = 3) => {
  const today = new Date();
  const daysUntilPeriod = differenceInDays(nextPeriodDate, today);
  return daysUntilPeriod >= 0 && daysUntilPeriod <= daysThreshold;
};

// Helper function to send email
const sendEmail = async (to, subject, html) => {
  const mailOptions = {
    from: functions.config().email.user,
    to: to,
    subject: subject,
    html: html
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

// Scheduled function to check for upcoming periods and send notifications
exports.checkUpcomingPeriods = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
  try {
    console.log('Starting daily period check...');
    
    const usersSnapshot = await db.collection('users').get();
    let notificationsSent = 0;
    let errors = 0;

    for (const userDoc of usersSnapshot.docs) {
      try {
        const userData = userDoc.data();
        const userId = userDoc.id;

        // Check if user has partner notifications enabled
        if (!userData.notificationSettings?.partnerUpdates) {
          continue;
        }

        // Check if user has a connected partner
        if (!userData.partnerConnection?.partnerEmail || 
            userData.partnerConnection?.connectionStatus !== 'connected') {
          continue;
        }

        // Get user's mode preference
        const selectedMode = userData.selectedMode || 'normal';
        const modeData = userData[selectedMode === 'normal' ? 'normalMode' : 'tricyclingMode'];

        if (!modeData) {
          continue;
        }

        // Get period data
        const periodDates = modeData.periodDates || [];
        const onboarding = modeData.onboarding || {};
        
        if (periodDates.length === 0 && !onboarding.lastPeriodDate) {
          continue;
        }

        // Calculate next period date
        let nextPeriodDate;
        if (periodDates.length > 0) {
          // Use the most recent period date
          const lastPeriodDate = new Date(Math.max(...periodDates.map(d => new Date(d))));
          const cycleLength = parseInt(onboarding.cycleLength) || (selectedMode === 'normal' ? 28 : 84);
          nextPeriodDate = calculateNextPeriod(lastPeriodDate.toISOString().split('T')[0], cycleLength);
        } else {
          // Use onboarding data
          const cycleLength = parseInt(onboarding.cycleLength) || (selectedMode === 'normal' ? 28 : 84);
          nextPeriodDate = calculateNextPeriod(onboarding.lastPeriodDate, cycleLength);
        }

        // Check if period is near
        if (isPeriodNear(nextPeriodDate, 3)) {
          const daysUntilPeriod = differenceInDays(nextPeriodDate, new Date());
          
          // Send notification email
          const template = emailTemplates.periodNotification(
            userData.partnerConnection.partnerName || 'Partner',
            userData.username || 'User',
            daysUntilPeriod
          );

          const emailSent = await sendEmail(
            userData.partnerConnection.partnerEmail,
            template.subject,
            template.html
          );

          if (emailSent) {
            notificationsSent++;
            
            // Log the notification
            await db.collection('notifications').add({
              userId: userId,
              type: 'period_alert',
              recipientEmail: userData.partnerConnection.partnerEmail,
              daysUntilPeriod: daysUntilPeriod,
              sentAt: admin.firestore.FieldValue.serverTimestamp(),
              status: 'sent'
            });
          }
        }

      } catch (error) {
        console.error(`Error processing user ${userDoc.id}:`, error);
        errors++;
      }
    }

    console.log(`Period check completed. Notifications sent: ${notificationsSent}, Errors: ${errors}`);
    return { notificationsSent, errors };

  } catch (error) {
    console.error('Error in checkUpcomingPeriods:', error);
    throw error;
  }
});

// HTTP function to manually trigger period check (for testing)
exports.manualPeriodCheck = functions.https.onRequest(async (req, res) => {
  try {
    const result = await exports.checkUpcomingPeriods();
    res.json({
      success: true,
      message: 'Period check completed',
      result: result
    });
  } catch (error) {
    console.error('Error in manual period check:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Function to send immediate notification when period is logged
exports.onPeriodLogged = functions.firestore
  .document('users/{userId}')
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const previousData = change.before.data();
    const userId = context.params.userId;

    // Check if period dates were added
    const selectedMode = newData.selectedMode || 'normal';
    const modeKey = selectedMode === 'normal' ? 'normalMode' : 'tricyclingMode';
    
    const newPeriodDates = newData[modeKey]?.periodDates || [];
    const previousPeriodDates = previousData[modeKey]?.periodDates || [];
    
    // Check if a new period date was added today
    const today = new Date().toISOString().split('T')[0];
    const newPeriodToday = newPeriodDates.some(date => 
      date.includes(today) && !previousPeriodDates.some(prevDate => prevDate.includes(today))
    );

    if (newPeriodToday && 
        newData.notificationSettings?.partnerUpdates &&
        newData.partnerConnection?.partnerEmail &&
        newData.partnerConnection?.connectionStatus === 'connected') {
      
      try {
        const template = emailTemplates.periodStarted(
          newData.partnerConnection.partnerName || 'Partner',
          newData.username || 'User'
        );

        const emailSent = await sendEmail(
          newData.partnerConnection.partnerEmail,
          template.subject,
          template.html
        );

        if (emailSent) {
          // Log the notification
          await db.collection('notifications').add({
            userId: userId,
            type: 'period_started',
            recipientEmail: newData.partnerConnection.partnerEmail,
            sentAt: admin.firestore.FieldValue.serverTimestamp(),
            status: 'sent'
          });
        }

        console.log(`Period started notification sent for user ${userId}`);
      } catch (error) {
        console.error(`Error sending period started notification for user ${userId}:`, error);
      }
    }
  });

module.exports = {
  checkUpcomingPeriods: exports.checkUpcomingPeriods,
  manualPeriodCheck: exports.manualPeriodCheck,
  onPeriodLogged: exports.onPeriodLogged
}; 