const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const validator = require('validator')

const Schema = mongoose.Schema

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  lastlogin: {
    type: String,
    required: false
  },
  patientEnrollnDate: {
    type: String,
    required: false
  },
  type: {
    type: String,
    // required: true
  },
  name: {
    type: String,
    default: ""
  },
  fhirid: {
    type: String,
    required: false
  },
  fcmToken : {
    type: String,
  },
  dob: {
    type: String,
    required: false
  },
  gender: {
    type: String,
    required: false
  },
  mobNumber: {
    type: String,
    required: false
  },
  profilePic: {
    type: "String",
  },
  practiceName: [
    {
      type: String,
      required: false
    }
  ],
  clinitionId: {
    type: String,
    required: false
  },

  medicationfhirid: [{
    type: String,
    required: false
  }],
  clinitionCode: {
    type: String,
    required: false
  },
  PatientData: [{

    _id: false,
    patientEnrollnDate: {
      type: String,
      required: false
    },
    patid: {
      type: String,
      required: false
    },
    fhiridpat: {
      type: String,
      required: false
    },
    patname: {
      type: String,
      required: false
    },
    patage: {
      type: String,
      required: false
    },
    patgender: {
      type: String,
      required: false
    },
    patdisease: {
      type: String,
      required: false
    },
    patpic: {
      type: String,
      required: false
    }
  }
  ],
  clinitionFhirId: {
    type: String,
    required: false
  },
  keyKlockUserID: {
    type: String,
    required: true
  }
},
  //  { "_id": false }
)
// static signup method
userSchema.statics.signup = async function (email, password, type, keyKlockUserID) {

  // validation
  if (!email || !password) {
    throw Error('All fields must be  filled')
  }
  if (!validator.isEmail(email)) {
    throw Error('Email not valid')
  }
  // if (!validator.isStrongPassword(password)) {
  //   throw Error('Password not strong enough')
  // }

  const exists = await this.findOne({ email })

  if (exists) {
    throw Error('Email already in use')
  }

  const salt = await bcrypt.genSalt(10)
  const hash = await bcrypt.hash(password, salt)

  const user = await this.create({ email, password: hash, type, keyKlockUserID })

  return user
}

// static login method
userSchema.statics.login = async function (email, password) {

  if (!email || !password) {
    throw Error('All fields must be filled')
  }

  const user = await this.findOne({ email })
  if (!user) {
    throw Error('Email does not exist')
  }

  const match = await bcrypt.compare(password, user.password)
  if (!match) {
    throw Error('Incorrect password')
  }
  user.lastlogin = new Date().toISOString();
  await user.save();

  return user
}

// userSchema.statics.updateID = async function(fhirid) {

//   if (!fhirid) {
//     throw Error('did not get fhir id')
//   }
//   const user = await this.updateMany({fhirid})
//   return user
// }




module.exports = mongoose.model('User', userSchema)