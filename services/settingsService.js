const SystemSettings = require('../models/SystemSettings');
const SystemSettingsHistory = require('../models/SystemSettingsHistory');
const ActivityLog = require('../models/ActivityLog');

let cachedSettings = null;

const settingsService = {
    getSettings: async () => {
        if (cachedSettings) return cachedSettings;
        
        let settings = await SystemSettings.findOne();
        if (!settings) {
            settings = await SystemSettings.create({
                credits: {
                    milestones: [
                        { views: 500, credits: 5, title: '500 Views Milestone' },
                        { views: 1000, credits: 10, title: '1,000 Views Milestone' },
                        { views: 5000, credits: 20, title: '5,000 Views Milestone' },
                        { views: 10000, credits: 50, title: '10,000+ Views Milestone' }
                    ]
                }
            });
        }
        cachedSettings = settings.toObject();
        return cachedSettings;
    },

    updateSettings: async (updates, userId) => {
        let settings = await SystemSettings.findOne();
        if (!settings) {
            settings = new SystemSettings({});
        }

        const previousValue = settings.toObject();
        
        // Handle Emergency Mode logic
        if (updates.emergencyMode === true && settings.emergencyMode === false) {
            updates.performanceCreditsEnabled = false;
            updates.documentExportEnabled = false;
            updates.weatherApiEnabled = false;
            updates.marketApiEnabled = false;
            updates.populationApiEnabled = false;
            updates.emailServiceEnabled = false;
            
            // Sync legacy keys
            updates.creditSystemEnabled = false;
            updates.exportSystemEnabled = false;
            updates.externalApisEnabled = false;
            updates.analyticsEnabled = false;
        }

        // Keep legacy fields in sync with the new primary fields
        if (updates.performanceCreditsEnabled !== undefined) {
            updates.creditSystemEnabled = updates.performanceCreditsEnabled;
        }
        if (updates.documentExportEnabled !== undefined) {
            updates.exportSystemEnabled = updates.documentExportEnabled;
        }

        Object.assign(settings, updates);
        settings.updatedBy = userId;
        settings.updatedAt = new Date();
        settings.version += 1;

        await settings.save();
        cachedSettings = settings.toObject();

        // Create History Snapshot
        await SystemSettingsHistory.create({
            settings: cachedSettings,
            updatedBy: userId,
            version: settings.version,
            timestamp: new Date()
        });

        // Audit Log
        const mapping = {
            performanceCreditsEnabled: 'PERFORMANCE_CREDITS',
            documentExportEnabled: 'DOCUMENT_EXPORT',
            weatherApiEnabled: 'WEATHER_API',
            marketApiEnabled: 'MARKET_API',
            populationApiEnabled: 'POPULATION_API',
            emailServiceEnabled: 'EMAIL_SERVICE',
            emergencyMode: 'EMERGENCY_MODE',
            
            creditSystemEnabled: 'CREDIT_SYSTEM',
            externalApisEnabled: 'EXTERNAL_APIS',
            analyticsEnabled: 'ANALYTICS',
            exportSystemEnabled: 'EXPORT_SYSTEM'
        };

        for (const [key, value] of Object.entries(updates)) {
            if (previousValue[key] !== value && mapping[key]) {
                const action = `${mapping[key]}_${value ? 'ENABLED' : 'DISABLED'}`;
                await ActivityLog.create({
                    userId,
                    action,
                    details: {
                        setting: key,
                        previousValue: previousValue[key],
                        newValue: value
                    }
                });
            }
        }

        return settings;
    }
};

module.exports = settingsService;
