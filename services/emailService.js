const nodemailer = require('nodemailer');
const settingsService = require('./settingsService');

const transporter = nodemailer.createTransport({
    service: 'gmail', // or use host/port for other services
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const emailService = {
    sendOTP: async (email, otp) => {
        console.log(`[SMTP] Attempting to send OTP to: ${email}`);
        const settings = await settingsService.getSettings();
        if (!settings.emailServiceEnabled) {
            console.log(`=================================================`);
            console.log(`[SMTP] [DISABLED] OTP Bypass Code for ${email}: ${otp}`);
            console.log(`=================================================`);
            return { messageId: 'skipped-by-admin', response: '250 Ok: Skipped by admin', skipped: true };
        }

        let userRole = 'author'; // fallback
        try {
            const User = require('../models/User');
            const user = await User.findOne({ email });
            if (user) {
                userRole = user.role;
            }
        } catch (err) {
            console.error('[SMTP] Failed to look up user role for OTP email:', err.message);
        }

        let headerText = 'NEWSPERCENT AUTHENTICATION';
        if (['super_admin', 'admin', 'editor', 'reviewer'].includes(userRole)) {
            headerText = 'NEWSPERCENT ADMIN AUTHENTICATION';
        } else if (userRole === 'author') {
            headerText = 'NEWSPERCENT AUTHOR AUTHENTICATION';
        }

        const mailOptions = {
            from: `"NewsPercent Accounts" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `Authentication Code [${otp}] - NewsPercent`,
            html: `
                <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 500px; margin: auto; padding: 40px 30px; border: 1px solid #E5E7EB; border-radius: 16px; background-color: #FFFFFF; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
                    <!-- Logo -->
                    <div style="text-align: center; margin-bottom: 24px;">
                        <img src="https://newspercent.com/logo.webp" height="50" style="display: inline-block; border-radius: 8px;" alt="NewsPercent Logo" onerror="this.style.display='none'; document.getElementById('logo-text').style.display='block';" />
                        <div id="logo-text" style="display: none; font-size: 24px; font-weight: bold; color: #111111; letter-spacing: -0.5px;">NEWS<span style="color: #FFD84D;">PERCENT</span></div>
                    </div>
                    
                    <h2 style="color: #FF4D2D; font-size: 18px; font-weight: 800; text-align: center; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 20px 0;">
                        ${headerText}
                    </h2>
                    
                    <div style="border-top: 1px solid #E5E7EB; border-bottom: 1px solid #E5E7EB; padding: 20px 0; margin-bottom: 20px;">
                        <p style="font-size: 14px; color: #4B5563; margin: 0 0 16px 0; line-height: 1.5;">
                            A login verification request was initiated for your NewsPercent account.
                        </p>
                        <p style="font-size: 14px; color: #4B5563; margin: 0 0 8px 0;">
                            <strong>User Role:</strong> <span style="text-transform: capitalize; color: #111111; font-weight: bold;">${userRole.replace('_', ' ')}</span>
                        </p>
                        <p style="font-size: 14px; color: #4B5563; margin: 0 0 8px 0;">
                            <strong>Verification Target:</strong> <span style="color: #111111;">${email}</span>
                        </p>
                    </div>
                    
                    <div style="background: #F9FAFB; border: 1px solid #E5E7EB; padding: 24px; text-align: center; border-radius: 12px; margin-bottom: 24px;">
                        <p style="font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; color: #6B7280; margin: 0 0 10px 0;">One-Time Password (OTP)</p>
                        <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #111111; font-family: monospace; display: block; margin-left: 8px;">${otp}</span>
                    </div>
                    
                    <p style="font-size: 13px; color: #4B5563; line-height: 1.5; margin: 0 0 24px 0;">
                        This authentication code is valid for exactly <strong>5 minutes</strong>. Only the most recently generated code can be used to authorize this session.
                    </p>
                    
                    <div style="background-color: #FFF5F5; border: 1px solid #FEE2E2; border-radius: 12px; padding: 16px; margin-top: 24px;">
                        <p style="font-size: 12px; color: #B91C1C; font-weight: bold; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 0.5px;">Security Warning</p>
                        <p style="font-size: 11px; color: #991B1B; line-height: 1.5; margin: 0;">
                            If you did not initiate this login request, please ignore this transmission or immediately flag this occurrence with the security administrator. Never share this authorization code with anyone.
                        </p>
                    </div>
                </div>
            `
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            console.log(`[SMTP] OTP sent successfully to ${email}. Response: ${info.response}`);
            return info;
        } catch (err) {
            console.error(`[SMTP] FAILED to send OTP to ${email}:`, err);
            throw err;
        }
    },

    sendLoginAlert: async (email, details) => {
        console.log(`[SMTP] Attempting to send login alert to: ${email}`);
        const settings = await settingsService.getSettings();
        if (!settings.emailServiceEnabled) {
            console.log(`[SMTP] [DISABLED] Skipping login alert to: ${email}`);
            return { messageId: 'skipped-by-admin', response: '250 Ok: Skipped by admin', skipped: true };
        }

        const mailOptions = {
            from: `"N% Security" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'New Login Alert - N%',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #FF453A;">Security Alert</h2>
                    <p>A new login was detected for your account.</p>
                    <ul style="list-style: none; padding: 0;">
                        <li><strong>Time:</strong> ${details.time}</li>
                        <li><strong>IP Address:</strong> ${details.ip}</li>
                        <li><strong>Device:</strong> ${details.userAgent}</li>
                    </ul>
                    <p>If this was not you, please disable your account immediately.</p>
                </div>
            `
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            console.log(`[SMTP] Login alert sent to ${email}`);
            return info;
        } catch (err) {
            console.error(`[SMTP] FAILED login alert for ${email}:`, err);
            throw err;
        }
    },

    sendAccountCreated: async (email, name, role) => {
        console.log(`[SMTP] Attempting to send account creation email to: ${email}`);
        const settings = await settingsService.getSettings();
        if (!settings.emailServiceEnabled) {
            console.log(`[SMTP] [DISABLED] Skipping account creation email to: ${email}`);
            return { messageId: 'skipped-by-admin', response: '250 Ok: Skipped by admin', skipped: true };
        }

        const mailOptions = {
            from: `"N% Admin" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Welcome to N% News Platform',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #FF453A;">Account Created</h2>
                    <p>Hello ${name},</p>
                    <p>Your account has been created on the N% News Platform.</p>
                    <p><strong>Clearance Role:</strong> ${role}</p>
                    <p>You can now sign in using your email address via OTP authentication.</p>
                    <a href="https://newspercent.com" style="display: inline-block; padding: 10px 20px; background: #FF453A; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px;">Go to Portal</a>
                </div>
            `
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            console.log(`[SMTP] Account email sent to ${email}`);
            return info;
        } catch (err) {
            console.error(`[SMTP] FAILED account email for ${email}:`, err);
            throw err;
        }
    },

    sendArticleReviewNotification: async (article) => {
        try {
            const settings = await settingsService.getSettings();
            if (!settings.emailServiceEnabled) {
                console.log(`[SMTP] [DISABLED] Skipping article review notification email for article: ${article.title}`);
                return 0;
            }

            const User = require('../models/User');
            const admins = await User.find({ role: { $in: ['admin', 'super_admin'] } });
            const adminEmails = admins.map(admin => admin.email).filter(email => !!email);
            
            if (adminEmails.length === 0) {
                console.log('[SMTP] No admin or super_admin found to notify.');
                return 0;
            }

            const authorName = article.authorName || 'Unknown Author';
            const articleTitle = article.title || 'Untitled';
            const category = article.category || 'Uncategorized';
            const submissionDate = article.updatedAt ? new Date(article.updatedAt).toLocaleString() : new Date().toLocaleString();

            let sentCount = 0;
            for (const email of adminEmails) {
                const mailOptions = {
                    from: `"N% Admin Portal" <${process.env.EMAIL_USER}>`,
                    to: email,
                    subject: '📰 New Article Submitted For Review',
                    text: `A new article has been submitted and is awaiting editorial review.\n\nAuthor:\n${authorName}\n\nTitle:\n${articleTitle}\n\nCategory:\n${category}\n\nSubmission Time:\n${submissionDate}\n\nPlease log in to NewsPercent CMS to review this article.`
                };
                
                try {
                    await transporter.sendMail(mailOptions);
                    sentCount++;
                } catch (emailErr) {
                    console.error(`[SMTP] Failed to send article review email to ${email}:`, emailErr);
                }
            }

            console.log(`[ARTICLE REVIEW]\n\nAuthor:\n${authorName}\n\nTitle:\n${articleTitle}\n\nEmails Sent:\n${sentCount}`);
            return sentCount;
        } catch (err) {
            console.error('[ARTICLE REVIEW] Failed to fetch admins or send review notifications:', err);
            return 0;
        }
    },

    sendArticleApprovedEmail: async (toEmail, articleTitle, category, adminName) => {
        console.log(`[SMTP] Attempting to send Article Approved email to: ${toEmail}`);
        const settings = await settingsService.getSettings();
        if (!settings.emailServiceEnabled) {
            console.log(`[SMTP] [DISABLED] Skipping Article Approved email to: ${toEmail}`);
            return { messageId: 'skipped-by-admin', response: '250 Ok: Skipped by admin', skipped: true };
        }

        const mailOptions = {
            from: `"N% Admin Portal" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: '🎉 Your Article Has Been Approved',
            text: `Congratulations.\n\nYour article has successfully passed editorial review.\n\nTitle:\n${articleTitle}\n\nCategory:\n${category}\n\nReviewed By:\n${adminName}\n\nStatus:\nApproved\n\nYour article is now eligible for publication or has already been published.`
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            console.log(`[SMTP] Approved email sent successfully to ${toEmail}. Response: ${info.response}`);
            return info;
        } catch (err) {
            console.error(`[SMTP] FAILED to send Approved email to ${toEmail}:`, err);
            throw err;
        }
    },

    sendRevisionRequestEmail: async (toEmail, articleTitle, category, adminName, reviewComments) => {
        console.log(`[SMTP] Attempting to send Revision Requested email to: ${toEmail}`);
        const settings = await settingsService.getSettings();
        if (!settings.emailServiceEnabled) {
            console.log(`[SMTP] [DISABLED] Skipping Revision Requested email to: ${toEmail}`);
            return { messageId: 'skipped-by-admin', response: '250 Ok: Skipped by admin', skipped: true };
        }

        const mailOptions = {
            from: `"N% Admin Portal" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: '📝 Revision Requested For Your Article',
            text: `Your article requires revisions before it can be approved.\n\nTitle:\n${articleTitle}\n\nCategory:\n${category}\n\nReviewed By:\n${adminName}\n\nReviewer Comments:\n${reviewComments}\n\nPlease update the article and resubmit it for editorial review.`
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            console.log(`[SMTP] Revision email sent successfully to ${toEmail}. Response: ${info.response}`);
            return info;
        } catch (err) {
            console.error(`[SMTP] FAILED to send Revision email to ${toEmail}:`, err);
            throw err;
        }
    },

    sendArticleRejectedEmail: async (toEmail, articleTitle, category, adminName, reviewComments) => {
        console.log(`[SMTP] Attempting to send Article Rejected email to: ${toEmail}`);
        const settings = await settingsService.getSettings();
        if (!settings.emailServiceEnabled) {
            console.log(`[SMTP] [DISABLED] Skipping Article Rejected email to: ${toEmail}`);
            return { messageId: 'skipped-by-admin', response: '250 Ok: Skipped by admin', skipped: true };
        }

        const mailOptions = {
            from: `"N% Admin Portal" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: '❌ Article Review Decision',
            text: `Your submitted article has not been approved for publication.\n\nTitle:\n${articleTitle}\n\nCategory:\n${category}\n\nReviewed By:\n${adminName}\n\nReason:\n${reviewComments}\n\nIf applicable, you may create a revised version and submit it again.`
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            console.log(`[SMTP] Rejection email sent successfully to ${toEmail}. Response: ${info.response}`);
            return info;
        } catch (err) {
            console.error(`[SMTP] FAILED to send Rejection email to ${toEmail}:`, err);
            throw err;
        }
    },

    checkAndSendArticleStatusEmail: async (article, oldStatus, newStatus, reviewerName, reviewComments) => {
        if (!oldStatus || !newStatus) return;
        
        const normOld = oldStatus.toLowerCase();
        const normNew = newStatus.toLowerCase();
        
        if (normOld === normNew) return;
        
        // Define groupings
        const isApproved = (s) => ['approved', 'published'].includes(s);
        const isRevision = (s) => ['revision_required', 'sent_for_revision', 'revision_requested'].includes(s);
        const isRejected = (s) => ['rejected', 'terminated'].includes(s);
        
        let emailType = null; // 'approved' | 'revision' | 'rejected'
        
        if (isApproved(normNew) && !isApproved(normOld)) {
            emailType = 'approved';
        } else if (isRevision(normNew) && !isRevision(normOld)) {
            emailType = 'revision';
        } else if (isRejected(normNew) && !isRejected(normOld)) {
            emailType = 'rejected';
        }
        
        if (!emailType) return;
        
        console.log(`[ARTICLE STATUS UPDATE] Detected transition for "${article.title}": ${oldStatus} -> ${newStatus}`);
        
        let emailSent = 'NO';
        try {
            const User = require('../models/User');
            const author = await User.findById(article.authorId);
            if (!author || !author.email) {
                console.error(`[SMTP] Cannot send email. Author not found or lacks email for ID: ${article.authorId}`);
            } else {
                const authorEmail = author.email;
                const title = article.title || 'Untitled';
                const category = article.category || 'Uncategorized';
                const adminName = reviewerName || 'Admin';
                const comments = reviewComments || article.revisionMessage || 'No comments provided.';
                
                if (emailType === 'approved') {
                    await emailService.sendArticleApprovedEmail(authorEmail, title, category, adminName);
                } else if (emailType === 'revision') {
                    await emailService.sendRevisionRequestEmail(authorEmail, title, category, adminName, comments);
                } else if (emailType === 'rejected') {
                    await emailService.sendArticleRejectedEmail(authorEmail, title, category, adminName, comments);
                }
                emailSent = 'YES';
            }
        } catch (err) {
            console.error(`[SMTP] Error processing/sending article status email:`, err);
        }
        
        const authorLabel = article.authorName || 'Unknown';
        console.log(`[ARTICLE STATUS UPDATE]\n\nTitle:\n${article.title || 'Untitled'}\n\nAuthor:\n${authorLabel}\n\nStatus:\n${newStatus}\n\nEmail Sent:\n${emailSent}\n`);
    }
};

module.exports = emailService;
