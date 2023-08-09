const express = require('express');
const signLegalDocument = require("../controller/signLegalDocumentClt");
const { protect } = require('../middleware/authChatMiddleware');

const router = express.Router();

router.route('/').post(protect, signLegalDocument.createLegalDocument);
router.route('/').get(protect, signLegalDocument.getLegalDocument);
router.route('/').put(protect, signLegalDocument.updateLegalDocument);
router.route('/check').get(protect, signLegalDocument.checkLegalDocument);

module.exports = router;