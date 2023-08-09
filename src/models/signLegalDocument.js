const mongoose = require("mongoose");
let {Schema}  = mongoose;
const signLegalDocumentSchema = mongoose.Schema({
    // PCM_Program , PCM_Receive ,PCM_Services ,PCM_Cancel
    PCM_Program: {
        _id: {
            type: Schema.Types.ObjectId, // use ObjectId data type for _id
            default: mongoose.Types.ObjectId // set default value to generate new ObjectId
          },
        content: [
            {
                Head: {
                    type: String
                },
                body: {
                    type: String
                }
            }
        ]

    },
    PCM_Receive: {
        _id: {
            type: Schema.Types.ObjectId, // use ObjectId data type for _id
            default: mongoose.Types.ObjectId // set default value to generate new ObjectId
          },
        content: [
            {
                Head: {
                    type: String
                },
                body: {
                    type: String
                }
            }
        ]
    },
    PCM_Services: {
        _id: {
            type: Schema.Types.ObjectId, // use ObjectId data type for _id
            default: mongoose.Types.ObjectId // set default value to generate new ObjectId
          },
        content: [
            {
                Head: {
                    type: String
                },
                body: {
                    type: String
                }
            }
        ]
    },
    PCM_Cancel: {
        _id: {
            type: Schema.Types.ObjectId, // use ObjectId data type for _id
            default: mongoose.Types.ObjectId // set default value to generate new ObjectId
          },
        content: [
            {
                Head: {
                    type: String
                },
                body: {
                    type: String
                }
            }
        ]
    },

    // 
    PCM_Agree: {
        type: Boolean
    },
    Sign_PCM_Name: {
        type: String
    },
    Sign_PCM_DOB: {
        type: String
    },
    Sign_PCM_Date_Signature: {
        type: String
    },
    Sign_PCM_Email: {
        type: String
    },
    Sign_PCM_Signature: {
        type: String
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

const signLegalDocument = mongoose.model("signLegalDocument", signLegalDocumentSchema);

module.exports = signLegalDocument;