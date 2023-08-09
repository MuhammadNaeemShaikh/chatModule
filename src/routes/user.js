const express = require('express');
const User = require('../models/user');
const { protect } = require('../middleware/authChatMiddleware')


// controller functions
const { loginUser, signupUser, deleteUserEmail } = require('../controller/user');


const router = express.Router()



router.post('/signup', signupUser);
router.post('/login', loginUser);
router.delete('/deleteUser', protect, deleteUserEmail);



//====add medication fhir id in user table



// api for get cliniton fhir id in 

router.get('/users/type', protect, async function (req, res) {
    let type = ["Clinician", "Patient", "Clinical Staff"];
    let getTypeData = [];
    let Clinician = await User.find({ type: { $in: type[0] } }).select('-password  -__v  -lastlogin  -createdAt  -updatedAt  -fhirid  -keyKlockUserID  -medicationfhirid  -PatientData -cliniacianData -cliDetails')
    let Patient = await User.find({ type: { $in: type[1] } }).select('-password  -__v  -lastlogin  -createdAt  -updatedAt  -fhirid  -keyKlockUserID  -medicationfhirid  -PatientData -cliniacianData -cliDetails')
    let ClinicalStaff = await User.find({ type: { $in: type[2] } }).select('-password  -__v  -lastlogin  -createdAt  -updatedAt  -fhirid  -keyKlockUserID  -medicationfhirid  -PatientData -cliniacianData -cliDetails')

    res.json({
        Clinician: Clinician,
        Patient: Patient,
        ClinicalStaff: ClinicalStaff
    })
});
router.post('/users', async function (req, res) {
    const { practiceName } = req.body
    console.log(practiceName);
    const users = await User.find({
        "practiceName": practiceName,
    }).select("-password")
    res.json({ users: users })
});
router.get('/practice/list', protect, async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.user._id })
        res.status(200).json({ practiceName: user.practiceName });
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})
// add patients to clinician user
router.post('/postpatienttoclinician', async (req, res) => {
    const { fhiridclin, fhiridpat, patname, patage, patgender, patdisease, patpic, patid } = req.body;
    try {
        const user = await User.findOne({ fhirid: fhiridclin });
        if (user.PatientData.some(data => data.fhiridpat === fhiridpat)) {
            // If the fhiridpat already exists in the PatientData array, send an error response
            return res.status(400).json({ error: "Patient already exists" });
        }
        // Otherwise, push the new data to the PatientData array
        user.PatientData.push({ patid, fhiridpat, patname, patage, patgender, patdisease, patpic });
        await user.save(); // Save the updated user document
        const type = user.type;
        const email = user.email;
        const name = user.name;
        const PatientData = user.PatientData;
        res.json({ PatientData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/getpatients', protect, async (req, res) => {
    try {
        const id = req.user._id
        const user = await User.findById(id);
        // res.json({user})
        const PatientFhirId = user.PatientFhirId;
        res.json({ PatientFhirId })
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



// const getFhirId = 
module.exports = router
// router.post("/login", userController.loginUser );