const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs')
const crypto = require('crypto');
const axios = require('axios');
var nodemailer = require('nodemailer');
const fs = require("fs");
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_KEY, { expiresIn: '7d' });
};

// const loginUser = async (req, res) => {
//   const {email, password} = req.body;

//   try {
//     const user = await User.login(email, password);

//     // create a token
//     const token = createToken(user._id);
//     const type = user.type;
//     const id = user._id;
//     const fhirid = user.fhirid;
//     const name = user.name;
//     const profilePic = user.profilePic;
//     const clinitionCode = user.clinitionCode;

//     res.status(200).json({email, token, type, id, fhirid, name, profilePic, clinitionCode});

//   } catch (error) {
//     res.status(400).json({msg: error.message});
//   }
// };

// signup a user
// const signupUser = async (req, res) => {
//   const {email, password, type} = req.body;

//   try {
//     const user = await User.signup(email, password, type);
//     // create a token
//     const token = createToken(user._id);
//     const id = user._id;

//     res.status(200).json({email, token, id, type});
//   } catch (error) {
//     res.status(400).json({msg: error.message});
//   }
// }; 

//=====imran==
//===== getting keycloack accesstoekn
const getKeycloackToken = async () => {
  return await axios.post('https://usw2.auth.ac/auth/realms/ncai-/protocol/openid-connect/token', {
    client_id: "frontend",
    client_secret: "DlcDcyiyLR5hUGrlPgrntYN8z9cdkR6D",
    grant_type: "password",
    username: "admin",
    password: "123456"
  }, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
};

const signupUser = async (req, res) => {
  //=====get token from keycoak admin
  // get token from Keycloak admin
  try {
    let keycloackTokenResponse = await getKeycloackToken();
    let keyclockAdmintoken = keycloackTokenResponse.data.access_token;
    //console.log(keyclockAdmintoken);
    const { email, password, type } = req.body;
    // const {username} = req.params;
    // let id;
    let token;
    let userData;
    let keyclockUserId;
    const existEmail = await User.find({ email: email });
    const existEmailInKeyclock = await axios.get(
      `https://usw2.auth.ac/auth/admin/realms/ncai-/users?username=${email}`, {
      headers: {
        Authorization: 'Bearer ' + keyclockAdmintoken,
      },
      //add header for scopes here
    }
    );
    if (existEmail.length === 0 && existEmailInKeyclock.data.length === 0) {
      const keyclockData = await axios.post(
        `https://usw2.auth.ac/auth/admin/realms/ncai-/users`, {
        username: email,
        email: email,
        credentials: [{
          type: 'password',
          value: '123456',
          temporary: false,
        },],
        enabled: true,
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + keyclockAdmintoken,
        },

      }
      );

      // res.status(200).json({ email, token, id, type });
      userData = await axios.get(
        `https://usw2.auth.ac/auth/admin/realms/ncai-/users?username=${email}`, {
        headers: {
          Authorization: 'Bearer ' + keyclockAdmintoken,
        },
      }
      );
      keyclockUserId = userData.data[0].id;
      const user = await User.signup(email, password, type, keyclockUserId);
      // const user = await User.signup(email, password, type);
      // create a token
      token = createToken(user._id);
      id = user._id;
      res.status(200).json({
        email,
        token,
        id,
        type,
        datakeyclcok: userData.data[0].id,
      });

    } else {
      throw new Error("This e-mail already in use !")
    }
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }

  // setTimeout(async() => {

  // }, 4000);
};
const loginUser = async (req, res) => {
  const { email, password, lastlogin } = req.body;

  try {
    const user = await User.login(email, password);
    // create a token
    const keycloackTokenResponse = await getKeycloackToken();
    const keyclockAdmintoken = keycloackTokenResponse.data.access_token;
    console.log(keyclockAdmintoken);

    const token = createToken(user._id);
    const type = user.type;
    const id = user._id;
    const fhirid = user.fhirid;
    const name = user.name;
    const profilePic = user.profilePic;
    const lastlogin = user.lastlogin;
    const practiceName = user.practiceName;
    const getUserToken = await axios.post('https://usw2.auth.ac/auth/realms/ncai-/protocol/openid-connect/token', {
      client_id: "frontend",
      client_secret: "DlcDcyiyLR5hUGrlPgrntYN8z9cdkR6D",
      grant_type: "password",
      username: email,
      password: "123456"
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Bearer ' + keyclockAdmintoken
      }
    });

    res.status(200).json({ practiceName, email, token, type, id, fhirid, name, profilePic, data: getUserToken.data, lastlogin, });
    // res.status(200).json({ email, token, type,lastlogin});

  } catch (error) {
    res.status(400).json({ msg: error.message });
    console.log(error)
  }
};
//delete Email Api
const deleteUserEmail = async (req, res) => {
  try {
    const keycloackTokenResponse = await getKeycloackToken();
    const keyclockAdmintoken = keycloackTokenResponse.data.access_token;
    const userEmailData = await User.find({ email: req.user.email });
    await axios.delete(
      `https://usw2.auth.ac/auth/admin/realms/ncai-/users/${userEmailData[0].keyKlockUserID}`, {
      headers: {
        Authorization: 'Bearer ' + keyclockAdmintoken,
      },
    }
    );
    await User.findOneAndDelete({ _id: userEmailData[0]._id });
    res.status(200).json({ msg: 'Delete Successfully ! ' });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};
//node mailer code

// const mailer = (email, otp) => {
//   var transporter = nodemailer.createTransport({
//       service: 'gmail',
//       host: 'smtp.gmail.com',
//       port: 465,
//       secure: false,
//       auth: {
//           user: 'aqibkhan@aineurocare.com',
//           pass: 'mynameiskhan12',
//       },
//   });
//   var mailOptions = {
//       from: 'aqibkhan@aineurocare.com',
//       to: email,
//       subject: 'Sending Email using Node.js',
//       text: `Your Otp is ${otp}`
//   };
//   transporter.sendMail(mailOptions, function(error, info) {
//       if (error) {
//           console.log(error);
//       } else {
//           console.log('Email sent: from nodemailer' + info.response);
//       }
//   });
// }
/* refresh token = 1//048vOu_AhoEvVCgYIARAAGAQSNwF-L9IrCayOIs2DTMW-Vm2dSdLY83sr8nOZ6uKMhlava2a0izgiYM9rFpq71Pu8fJ6GEjsEjbU */
/* Access token = ya29.a0AVvZVsoB2_nywWGn90AihgEVW3z5lDGEqKZtcTFFB2nOehoCOmFUXknWpUG8RvXW5pT1tl904KtiLjWsEDT1zs9uA61z2APET4Xg6U-JpyfiO1njmvMG_UKv_2rVa3aQ4tU_v90VsyWmrohVUMqcVfCo8b9BaCgYKAUASARMSFQGbdwaIOV5GHTRIxWFk-GyZ1DxjDQ0163 */




//aqib.kk999@gmail.com
//llmoknxbxzlzvqcx
// Send Email

// Verify OTP



//forgot password 

module.exports = { signupUser, loginUser, deleteUserEmail };

