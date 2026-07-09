import { Schema, model } from "mongoose";
import { createHmac } from "crypto";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { v1 as uuid } from "uuid";

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            unique: true,
            required: true,
        },
        hashed_password: {
            type: String,
            required: true,
        },
        displayPicture: {
            type: String,
        },
        salt: String,
        otp: String,
        otpExpiry: Date,
    },
    { timestamps: true }
);

userSchema
    .virtual("password")
    .set(function (password) {
        this._password = password;
        this.salt = uuid();
        this.hashed_password = this.encryptPassword(password);
    })
    .get(function () {
        return this._password;
    });

userSchema.methods = {
    encryptPassword: function (password) {
        if (!password) return "";
        try {
            return createHmac("sha1", this.salt)
                .update(password)
                .digest("hex");
        } catch (err) {
            return "";
        }
    },
    authenticate: function (plainText) {
        return this.encryptPassword(plainText) === this.hashed_password;
    },
};

userSchema.plugin(mongooseAggregatePaginate);
const User = model("user", userSchema);

export default User;