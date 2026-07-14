import emailjs from '@emailjs/browser';

// EmailJS Configuration
const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_5nct6ad',
  TEMPLATE_ID_PERIOD_ALERT: 'template_f04cm6q',
  TEMPLATE_ID_PERIOD_STARTED: 'template_vv4fdlq',
  USER_ID: 'Bed8rE2V07XM6juwO'
};

// Initialize EmailJS
emailjs.init(EMAILJS_CONFIG.USER_ID);

/**
 * Send period alert email to partner (3 days before expected period)
 */
export const sendPeriodAlertEmail = async (partnerEmail, partnerName, userName, daysUntilPeriod) => {
  try {
    const templateParams = {
      to_email: partnerEmail,
      partner_name: partnerName || 'Partner',
      user_name: userName || 'User',
      days_until_period: daysUntilPeriod,
      message: `This is a friendly reminder that ${userName}'s period is expected to start in approximately ${daysUntilPeriod} days.`,
      support_tips: [
        'Be extra understanding and supportive',
        'Offer to help with daily tasks if needed',
        'Listen without trying to fix everything',
        'Respect their need for space or comfort'
      ]
    };

    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID_PERIOD_ALERT,
      templateParams
    );

    console.log('Period alert email sent successfully:', response);
    return { success: true, message: 'Period alert email sent to partner' };
  } catch (error) {
    console.error('Error sending period alert email:', error);
    return { success: false, message: 'Failed to send period alert email' };
  }
};

/**
 * Send period started email to partner (immediate notification)
 */
export const sendPeriodStartedEmail = async (partnerEmail, partnerName, userName) => {
  try {
    const templateParams = {
      to_email: partnerEmail,
      partner_name: partnerName || 'Partner',
      user_name: userName || 'User',
      message: `${userName} has logged that their period has started today.`,
      support_tips: [
        'Offer comfort and understanding',
        'Help with household tasks if needed',
        'Be patient with mood changes',
        'Respect their comfort needs'
      ]
    };

    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID_PERIOD_STARTED,
      templateParams
    );

    console.log('Period started email sent successfully:', response);
    return { success: true, message: 'Period started email sent to partner' };
  } catch (error) {
    console.error('Error sending period started email:', error);
    return { success: false, message: 'Failed to send period started email' };
  }
};

/**
 * Check if period is near and send alert if needed
 */
export const checkAndSendPeriodAlert = async (userData) => {
  try {
    // Check if user has partner notifications enabled
    if (!userData.notificationSettings?.partnerUpdates) {
      return { success: false, message: 'Partner notifications disabled' };
    }

    // Check if user has a connected partner
    if (!userData.partnerConnection?.partnerEmail || 
        userData.partnerConnection?.connectionStatus !== 'connected') {
      return { success: false, message: 'No connected partner found' };
    }

    // Get user's mode preference and data
    const selectedMode = userData.selectedMode || 'normal';
    const modeData = userData[selectedMode === 'normal' ? 'normalMode' : 'tricyclingMode'];

    if (!modeData) {
      return { success: false, message: 'No mode data found' };
    }

    // Get period data
    const periodDates = modeData.periodDates || [];
    const onboarding = modeData.onboarding || {};
    
    if (periodDates.length === 0 && !onboarding.lastPeriodDate) {
      return { success: false, message: 'No period data available' };
    }

    // Calculate next period date
    let nextPeriodDate;
    if (periodDates.length > 0) {
      // Use the most recent period date
      const lastPeriodDate = new Date(Math.max(...periodDates.map(d => new Date(d))));
      const cycleLength = parseInt(onboarding.cycleLength) || (selectedMode === 'normal' ? 28 : 84);
      nextPeriodDate = new Date(lastPeriodDate.getTime() + (cycleLength * 24 * 60 * 60 * 1000));
    } else {
      // Use onboarding data
      const cycleLength = parseInt(onboarding.cycleLength) || (selectedMode === 'normal' ? 28 : 84);
      nextPeriodDate = new Date(new Date(onboarding.lastPeriodDate).getTime() + (cycleLength * 24 * 60 * 60 * 1000));
    }

    // Check if period is near (within 3 days)
    const today = new Date();
    const daysUntilPeriod = Math.ceil((nextPeriodDate - today) / (1000 * 60 * 60 * 24));

    if (daysUntilPeriod >= 0 && daysUntilPeriod <= 3) {
      // Send period alert email
      return await sendPeriodAlertEmail(
        userData.partnerConnection.partnerEmail,
        userData.partnerConnection.partnerName,
        userData.username || userData.displayName,
        daysUntilPeriod
      );
    }

    return { success: false, message: 'Period not near enough for alert' };
  } catch (error) {
    console.error('Error checking period alert:', error);
    return { success: false, message: 'Error checking period alert' };
  }
};

/**
 * Send welcome email to partner when they are connected
 */
export const sendPartnerWelcomeEmail = async (partnerEmail, userName) => {
    try {
        const templateParams = {
            to_email: partnerEmail,
            partner_name: 'Partner',
            user_name: userName || 'User',
            message: `${userName} has added you as their partner in DotDay. You will now receive notifications about their period cycle to help you provide better support.`,
            support_info: [
                'You will receive period alerts 3 days before expected start',
                'You will get immediate notifications when their period starts',
                'All emails include supportive suggestions for you',
                'You can manage your preferences through the app'
            ]
        };

        const response = await emailjs.send(
            EMAILJS_CONFIG.SERVICE_ID,
            EMAILJS_CONFIG.TEMPLATE_ID_PERIOD_STARTED, // Using existing template for now
            templateParams
        );

        console.log('Partner welcome email sent successfully:', response);
        return { success: true, message: 'Welcome email sent to partner' };
    } catch (error) {
        console.error('Error sending partner welcome email:', error);
        return { success: false, message: 'Failed to send welcome email' };
    }
};

/**
 * Send immediate notification when period is logged
 */
export const sendPeriodStartedNotification = async (userData) => {
    try {
        // Check if user has partner notifications enabled
        if (!userData.notificationSettings?.partnerUpdates) {
            return { success: false, message: 'Partner notifications disabled' };
        }

        // Check if user has a connected partner
        if (!userData.partnerConnection?.partnerEmail || 
            userData.partnerConnection?.connectionStatus !== 'connected') {
            return { success: false, message: 'No connected partner found' };
        }

        // Send period started email
        return await sendPeriodStartedEmail(
            userData.partnerConnection.partnerEmail,
            userData.partnerConnection.partnerName,
            userData.username || userData.displayName
        );
    } catch (error) {
        console.error('Error sending period started notification:', error);
        return { success: false, message: 'Error sending period started notification' };
    }
};

export default {
  sendPeriodAlertEmail,
  sendPeriodStartedEmail,
  checkAndSendPeriodAlert,
  sendPeriodStartedNotification
}; 