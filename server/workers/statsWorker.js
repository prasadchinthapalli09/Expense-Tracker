const cron = require('node-cron');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// This worker runs every day at midnight to check for users due for a report
const startStatsWorker = () => {
    console.log('Stats Worker Started...');

    // Runs at 00:00 every day
    cron.schedule('0 0 * * *', async () => {
        console.log('Checking for users due for statistics reports...');

        try {
            const users = await User.find({ statsFrequency: { $ne: 'none' } });

            for (const user of users) {
                if (isDueForReport(user)) {
                    await sendStatsReport(user);
                }
            }
        } catch (error) {
            console.error('Error in stats worker:', error);
        }
    });
};

const isDueForReport = (user) => {
    const lastSent = new Date(user.lastReportSent || user.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - lastSent);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    switch (user.statsFrequency) {
        case 'weekly': return diffDays >= 7;
        case 'monthly': return diffDays >= 30;
        case '3months': return diffDays >= 90;
        case '6months': return diffDays >= 180;
        case 'yearly': return diffDays >= 365;
        default: return false;
    }
};

const sendStatsReport = async (user) => {
    console.log(`Generating report for ${user.email} (${user.statsFrequency})...`);

    // Calculate stats for the period
    const transactions = await Transaction.find({ userId: user._id });
    // ... logic to calculate totals, categories, etc.

    // TEMPLATE: In a real app, you'd use Nodemailer or SendGrid here
    console.log(`[MOCK] Sending email to ${user.email}: Your ${user.statsFrequency} Expense Report is ready!`);

    // Update lastSent
    user.lastReportSent = new Date();
    await user.save();
};

module.exports = { startStatsWorker };
