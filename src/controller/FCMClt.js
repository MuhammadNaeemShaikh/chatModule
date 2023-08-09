

const admin = require('firebase-admin');
const serviceAccount = require('../../notification.json');
const medication = require('../models/medicationModel');
const User = require('../models/user');

const FCM_Clt = {
    createFCM: async (req, res) => {
        try {
            const { fcmToken } = req.body;
            const getFCM = await FCM.findOne({ user: req.user._id });
            if (getFCM) {
                throw new Error("FCM already exists");
            } else {
                await FCM.create({
                    fcmToken, user: req.user._id
                })
                res.status(200).json({
                    msg: "Created!"
                });
            }
        } catch (err) {
            res.status(400).json({
                success: false,
                Error: err.message,
            });
        }
    },

    pushNot: async (arg, message) => {

        const fcmToken = await User.find({
            $and : [
                {fcmToken: { $exists: true }}, // Check if fcmToken field exists
                {fcmToken: { $ne: null }} ,// Check if fcmToken field is not null
                {type: "Patient"}
            ]
        });
           for (let k = 0; k < fcmToken.length; k++) {
            let  token = fcmToken[k].fcmToken;
            let userId = fcmToken[k]._id;
                const getMedication = await medication.find({
                    user: userId
                });
                const timesArrays = getMedication.map(medication => medication.Times);
                // Step 2: Flatten all "Times" arrays into a single array of time objects
                const allTimes = [].concat(...timesArrays);
                // Step 3: Use a Set to remove duplicates and convert it back to an array
                const uniqueTimes = Array.from(new Set(allTimes.map(time => time.time)));

                // Optional: Sort the array based on the "time" property
                uniqueTimes.sort((a, b) => a.localeCompare(b));

                console.log(uniqueTimes)
                for (let j = 0; j < uniqueTimes.length; j++) {
                    if (arg == "AM") {
                        if (uniqueTimes[j] === "AM") {
                            console.log("time",uniqueTimes[j])
                           FcmNotify(token, message);
                        }
                    } else if (arg == "PM") {
                        if (uniqueTimes[j] === "PM") {
                            console.log("time",uniqueTimes[j])
                            FcmNotify(token, message);
                        }
                    } else if (arg == "AFT") {
                        if (uniqueTimes[j] === "AFT") {
                           console.log("time",uniqueTimes[j])
                           FcmNotify(token, message);
                        }
                    }
                }
            
           }
    }
    //     pushNotify: async (req, res, next) => {
    //         try {
    //             // const fcmToken = await FCM.find();
    //             // const tokens = [
    //             //     "fP7SemcjRVWIXAec0V3UoM:APA91bF8vMqNHsOYS7etlCY3wYdSMJO4BaPlbGRfNj9NDTeJKQ_DUTMmTjCwXDXFCmk2jbmIf-p4EiNJWIH2qoUp4jx6ItzkCtWF5NRycCLUUEPPx3CHUs57mzkiOEPgor83XeaDh_Vb",
    //             //     "c4Es16B7RRuCLeCEizVIWo:APA91bGx9YO8PBk76osamTLAM695_adF339yhSxKA37PUGA7wbykwoeMpf4SM4sdKqPKSYWDvU8oKuE7keocNBJzaXGw7DMIspL-74K7C8NPotghdcn520pokaAFO52TjI6P7cGH8UAq",
    //             //     "cpmzumURRt6JyAzJG3nUM7:APA91bE6hTgNKmaaSBCCvAf7KSp8nEljBvsyhxsPP3j906iWs2Ujvssky0N39XVZwCehaQnQDmaU6JvX-uMy493Hkc0bCCtksdT8NGAMKHZccZtwrdd-Ob6lleGMDatsRPWKFW7541cu"
    //             // ];

    //             const token = "cac-mwA5S7afpmdDACWgi1:APA91bGOB8_FEB1c9CzM7KaE7J9ZAr7Ar9bOB3WDoHoOwXU7KR7DTGCx0FAqBbraSPVxkGVzvtAQSSzBlcl_e6rutRcl2tGEjJj85mB6xJ9OFOs54ciXO5itZhDYIXZJbsXJKB2uKCaI";
    //             admin.initializeApp({
    //                 credential: admin.credential.cert(serviceAccount),
    //                 messagingSenderId: '314005293340'
    //             });

    //             let message = {
    //                 notification: {
    //                     title: 'FCM Notification',
    //                     body: 'You have a new message from John'
    //                 },

    //                 token: req.body.fcm_Token,
    //                 data: {
    //                     orderId: "353463",
    //                     orderDate: '54236456'
    //                 },
    //             };

    //             admin.messaging().send(message)
    //                 .then((response) => {
    //                     console.log('Notification sent successfully:', response);
    //                 })
    //                 .catch((error) => {
    //                     console.error('Error sending notification:', error.message);
    //                 });


    //             // const fcmToken = await User.find({
    //             //     fcmToken: { $exists: true }  // Check if fcmToken field exists
    //             // });

    //             // admin.initializeApp({
    //             //     credential: admin.credential.cert(serviceAccount),
    //             //     messagingSenderId: '314005293340'
    //             // });

    //             // let message = {
    //             //     notification: {
    //             //         title: 'medication Notification',
    //             //         body: `Medication Time kch`
    //             //     },
    //             //     token: token,
    //             //     data: {
    //             //         orderId: "353463",
    //             //         orderDate: '54236456'
    //             //     },
    //             // };
    //             // admin.messaging().send(message)
    //             //     .then((response) => {
    //             //         console.log('Notification sent successfully:', response);
    //             //     })
    //             //     .catch((error) => {
    //             //         console.error('Error sending notification:', error.message);
    //             //     });


    //             // for (let i = 0; i < tokens.length; i++) {
    //             //     const getMedication = await medicationHistory.find();
    //             //     let lastData = getMedication[0].medicationDose.length - 1;
    //             //     // console.log(getMedication[0].medicationDose[lastData][0].Times);
    //             //     getMedication[0].medicationDose[lastData][0].Times.forEach((time) => {
    //             //         // Check if the time is selected (isTimeChecked is true)
    //             //         if (time.isTimeChecked) {
    //             //             // Set the cron schedule based on the time value
    //             //             switch (time.time) {
    //             //                 case 'AM':
    //             //                     cron.schedule('* * * * *', () => {
    //             //                         // This function will run at 9:00 AM every day
    //             //                         // console.log('Cron job for AM');
    //             //                         let message = {
    //             //                             notification: {
    //             //                                 title: 'medication Notification',
    //             //                                 body: `Medication Time :  ${getMedication[0].medicationDose[lastData][0].medicatioName}`
    //             //                             },
    //             //                             token: tokens[0].fcmToken,
    //             //                             data: {
    //             //                                 orderId: "353463",
    //             //                                 orderDate: '54236456'
    //             //                             },
    //             //                         };
    //             //                         admin.messaging().send(message)
    //             //                             .then((response) => {
    //             //                                 console.log('Notification sent successfully:', response);
    //             //                             })
    //             //                             .catch((error) => {
    //             //                                 console.error('Error sending notification:', error.message);
    //             //                             });
    //             //                     });
    //             //                     break;
    //             //                 case 'AFT':
    //             //                     cron.schedule('* * * * *', () => {
    //             //                         // This function will run at 2:00 PM every day
    //             //                         // console.log('Cron job for AFT');
    //             //                         let message = {
    //             //                             notification: {
    //             //                                 title: 'medication Notification',
    //             //                                 body: `Medication Time ${getMedication[0].medicationDose[lastData][0].medicatioName}`
    //             //                             },
    //             //                             token: tokens[0].fcmToken,
    //             //                             data: {
    //             //                                 orderId: "353463",
    //             //                                 orderDate: '54236456'
    //             //                             },
    //             //                         };
    //             //                         admin.messaging().send(message)
    //             //                             .then((response) => {
    //             //                                 console.log('Notification sent successfully:', response);
    //             //                             })
    //             //                             .catch((error) => {
    //             //                                 console.error('Error sending notification:', error.message);
    //             //                             });
    //             //                     });
    //             //                     break;
    //             //                 case 'PM':
    //             //                     cron.schedule('0 0 18 * * *', () => {
    //             //                         // This function will run at 6:00 PM every day
    //             //                         // console.log('Cron job for PM');
    //             //                         let message = {
    //             //                             notification: {
    //             //                                 title: 'medication Notification',
    //             //                                 body: `Medication Time ${getMedication[0].medicationDose[lastData][0].medicatioName}`
    //             //                             },
    //             //                             token: fcmToken[0].fcmToken,
    //             //                             data: {
    //             //                                 orderId: "353463",
    //             //                                 orderDate: '54236456'
    //             //                             },
    //             //                         };
    //             //                         admin.messaging().send(message)
    //             //                             .then((response) => {
    //             //                                 console.log('Notification sent successfully:', response);
    //             //                             })
    //             //                             .catch((error) => {
    //             //                                 console.error('Error sending notification:', error.message);
    //             //                             });
    //             //                     });
    //             //                     break;
    //             //                 default:
    //             //                     break;
    //             //             }
    //             //         }
    //             //     });
    //             // }
    //             res.status(200).json({
    //             msg: "Notification sent successfully"
    //         });
    //     }
    //         catch(err) {
    //         console.log(err.message)
    //     }
    // }
}
function FcmNotify(token, data) {
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            messagingSenderId: '314005293340'
        });
    }
    message = {
        notification: {
            title: 'Medication Reminder',
            body: data
        },

        token: token,
        data: {
            orderId: "353463",
            orderDate: '54236456'
        },
    };
    admin.messaging().send(message)
        .then((response) => {
            console.log('Notification sent successfully:', response);
        })
        .catch((error) => {
            console.error('Error sending notification:', error.stack);
        });
}
module.exports = FCM_Clt;


                    // Set the cron schedule based on the time value
                    // switch (time.time) {
                    //     case 'AM':
                    //         // This function will run at 9:00 AM every day
                    //         // console.log('Cron job for AM');
                    //         if (!admin.apps.length) {
                    //             admin.initializeApp({
                    //                 credential: admin.credential.cert(serviceAccount),
                    //                 messagingSenderId: '314005293340'
                    //             });
                    //         }
                    //         message = {
                    //             notification: {
                    //                 title: 'FCM Notification',
                    //                 body: 'You have a new message from John'
                    //             },

                    //             token: arr[i],
                    //             data: {
                    //                 orderId: "353463",
                    //                 orderDate: '54236456'
                    //             },
                    //         };
                    //         admin.messaging().send(message)
                    //             .then((response) => {
                    //                 console.log('Notification sent successfully:', response);
                    //                 res.status(200).json({
                    //                     msg: "Notification sent successfully"
                    //                 });
                    //             })
                    //             .catch((error) => {
                    //                 console.error('Error sending notification:', error.message);
                    //             });
                    //         break;
                    //     case 'AFT':
                    //         // This function will run at 2:00 PM every day
                    //         // console.log('Cron job for AFT');
                    //         if (!admin.apps.length) {
                    //             admin.initializeApp({
                    //                 credential: admin.credential.cert(serviceAccount),
                    //                 messagingSenderId: '314005293340'
                    //             });
                    //         }
                    //         message = {
                    //             notification: {
                    //                 title: 'FCM Notification',
                    //                 body: 'You have a new message from John'
                    //             },

                    //             token: arr[i],
                    //             data: {
                    //                 orderId: "353463",
                    //                 orderDate: '54236456'
                    //             },
                    //         };

                    //         admin.messaging().send(message)
                    //             .then((response) => {
                    //                 console.log('Notification sent successfully:', response);
                    //                 res.status(200).json({
                    //                     msg: "Notification sent successfully"
                    //                 });
                    //             })
                    //             .catch((error) => {
                    //                 console.error('Error sending notification:', error.message);
                    //             });
                    //         break;
                    //     case 'PM':
                    //         // This function will run at 6:00 PM every day
                    //         // console.log('Cron job for PM');
                    //         if (!admin.apps.length) {
                    //             admin.initializeApp({
                    //                 credential: admin.credential.cert(serviceAccount),
                    //                 messagingSenderId: '314005293340'
                    //             });
                    //         }
                    //         message = {
                    //             notification: {
                    //                 title: 'FCM Notification',
                    //                 body: 'You have a new message from John'
                    //             },

                    //             token: arr[i],
                    //             data: {
                    //                 orderId: "353463",
                    //                 orderDate: '54236456'
                    //             },
                    //         };

                    //         admin.messaging().send(message)
                    //             .then((response) => {
                    //                 console.log('Notification sent successfully:', response);
                    //                 res.status(200).json({
                    //                     msg: "Notification sent successfully"
                    //                 });
                    //             })
                    //             .catch((error) => {
                    //                 console.error('Error sending notification:', error.message);
                    //             });
                    //         break;
                    //     default:
                    //         break;
                    // }



                    

            // if (!admin.apps.length) {
            //     admin.initializeApp({
            //         credential: admin.credential.cert(serviceAccount),
            //         messagingSenderId: '314005293340'
            //     });
            // }


            // let message = {
            //     notification: {
            //         title: 'FCM Notification',
            //         body: 'You have a new message from John'
            //     },

            //     token: token,
            //     data: {
            //         orderId: "353463",
            //         orderDate: '54236456'
            //     },
            // };

            // admin.messaging().send(message)
            //     .then((response) => {
            //         console.log('Notification sent successfully:', response);
            //         res.status(200).json({
            //             msg: "Notification sent successfully"
            //         });
            //     })
            //     .catch((error) => {
            //         console.error('Error sending notification:', error.message);
            //     });