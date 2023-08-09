const checked = require('../models/checkmodel');

const checkedClt = {
    createchecked: (async(req, res) => {
        try {
            const { healthAndDeviceCheck, healthAndResearchCheck, newsLetterCheck } = req.body;
            const checkedData = await checked.create({
                healthAndDeviceCheck,
                healthAndResearchCheck,
                newsLetterCheck,
                user: req.user._id
            });
            res.status(201).json({
                success: true,
                checkedData: checkedData
            })
        } catch (err) {
            res.status(201).json({
                success: false,
                Error: err.message
            })
        }
    }),
    getchecked: (async(req, res) => {
        try {
            const checkUserData = await checked.find({ user: req.user._id })
            res.status(201).json({
                success: true,
                checkUserData: checkUserData
            })
        } catch (err) {
            res.status(201).json({
                success: false,
                Error: err.message
            })
        }
    })
}
module.exports = checkedClt;