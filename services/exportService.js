const { Document, Packer, Paragraph, TextRun, ImageRun, HeadingLevel, AlignmentType } = require('docx');
const axios = require('axios');
const ActivityLog = require('../models/ActivityLog');

const exportService = {
    /**
     * Helper to download image from Cloudinary and convert to Buffer
     */
    getImageBuffer: async (url) => {
        try {
            const response = await axios.get(url, { responseType: 'arraybuffer' });
            return Buffer.from(response.data, 'binary');
        } catch (err) {
            console.error('[ExportService] Image Download Error:', err);
            return null;
        }
    },

    /**
     * Generate DOCX for a single article
     */
    generateArticleDoc: async (article, user) => {
        try {
            const children = [
                new Paragraph({
                    text: article.title,
                    heading: HeadingLevel.HEADING_1,
                    alignment: AlignmentType.CENTER,
                }),
                new Paragraph({
                    text: `By ${article.authorName} | Published: ${new Date(article.publishedAt || article.createdAt).toLocaleDateString()}`,
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 },
                }),
            ];

            // Add Image if exists
            if (article.featuredImage) {
                const imageBuffer = await exportService.getImageBuffer(article.featuredImage);
                if (imageBuffer) {
                    children.push(new Paragraph({
                        children: [
                            new ImageRun({
                                data: imageBuffer,
                                transformation: {
                                    width: 600,
                                    height: 337,
                                },
                            }),
                        ],
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 400 },
                    }));
                }
            }

            // Add Content (Simple strip tags for now, as TiP-Tap sends HTML)
            const cleanContent = article.content.replace(/<[^>]*>/g, '\n').replace(/\n\s*\n/g, '\n\n');
            const lines = cleanContent.split('\n');
            
            lines.forEach(line => {
                if (line.trim()) {
                    children.push(new Paragraph({
                        children: [new TextRun(line.trim())],
                        spacing: { after: 200 },
                    }));
                }
            });

            const doc = new Document({
                sections: [{
                    properties: {},
                    children: children,
                }],
            });

            const buffer = await Packer.toBuffer(doc);

            // Log activity
            await ActivityLog.create({
                userId: user._id,
                userName: user.name,
                action: 'DOCX_EXPORT',
                details: { articleId: article._id, title: article.title }
            });

            return buffer;
        } catch (err) {
            console.error('[ExportService] DOCX Generation Error:', err);
            throw err;
        }
    }
};

module.exports = exportService;
