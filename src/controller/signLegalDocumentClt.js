const LegalDocumentModel = require('../models/signLegalDocument');

const LegalDocumentClt = {
    createLegalDocument: async (req, res) => {
        try {
            const {
                PCM_Program, PCM_Receive, PCM_Services, PCM_Cancel
            } = req.body;
            const legalDocument = await LegalDocumentModel.create({
                PCM_Program, PCM_Receive, PCM_Services, PCM_Cancel
            });
            res.status(200).json({
                success: true,
                legalDocument
            });
        } catch (err) {
            res.status(400).json({
                success: false,
                Error: err.message,
            });
        }
    },
    getLegalDocument: async (req, res) => {
        try {
            const legalDocument = await LegalDocumentModel.findOne({
                PCM_Program: { $exists: true }
            });
            let legalData = [];
            legalData.push(legalDocument.PCM_Program.content[0])
            legalData.push(legalDocument.PCM_Receive.content[0])
            legalData.push(legalDocument.PCM_Services.content[0])
            legalData.push(legalDocument.PCM_Cancel.content[0])
            res.status(200).json(
                {
                    _id: legalDocument.PCM_Program._id,
                    content: legalData
                }
            );
        } catch (err) {
            res.status(400).json({
                success: false,
                Error: err.message,
            });
        }
    },
    checkLegalDocument: async (req, res) => {
        try {
            let legalDocument = await LegalDocumentModel.findOne({
                user: req.user._id
            });
            let check;
            if (legalDocument === null) {
                check = false
            } else {
                check = legalDocument.PCM_Agree === false ? false : true;
            }
            res.status(200).json(
                { check: check },
            );
        } catch (err) {
            res.status(400).json({
                success: false,
                Error: err.message,
            });
        }
    },
    updateLegalDocument: async (req, res) => {
        try {
            const { id } = req.params
            let { PCM_Agree,
                Sign_PCM_Name,
                Sign_PCM_DOB,
                Sign_PCM_Date_Signature,
                Sign_PCM_Email,
                Sign_PCM_Signature, } = req.body
            let getDocData = await LegalDocumentModel.findOne({ user: req.user._id })

            if (getDocData === null) {
                await LegalDocumentModel.create({
                    PCM_Agree,
                    Sign_PCM_Name,
                    Sign_PCM_DOB,
                    Sign_PCM_Date_Signature,
                    Sign_PCM_Email,
                    Sign_PCM_Signature,
                    user: req.user._id
                });
                res.status(200).json(
                    { msg: "LegalDocument created" }
                );
            } else {
                await LegalDocumentModel.findOneAndUpdate({ user: req.user._id }, req.body, { new: true });
                res.status(200).json(
                    { msg: "LegalDocument Updated" }
                );
            }

        } catch (err) {
            res.status(400).json({
                success: false,
                Error: err.message,
            });
        }
    },
};
module.exports = LegalDocumentClt;