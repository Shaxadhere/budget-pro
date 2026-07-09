import nodemailer from "nodemailer";
import User from "../models/user.model.js";
import { ApiResponse, errorHandler } from "../utils/response.utils.js";
import { sanitizeUser, generateToken } from "../utils/auth.utils.js";

// Helper to send email
const sendIsmail = async (email, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: process.env.SMTP_PORT || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER, // your email
                pass: process.env.SMTP_PASS, // your password
            },
        });

        await transporter.sendMail({
            from: '"InvoicingPro" <no-reply@invoicingpro.com>',
            to: email,
            subject: subject,
            text: text,
        });
        return true;
    } catch (error) {
        console.error("Email send failed:", error);
        return false;
    }
};

// Forgot Password - Generate OTP
export function forgotPassword(req, res) {
    const { email } = req.body;
    User.findOne({ email }).then(async (user) => {
        if (!user) {
            return res.status(404).json(ApiResponse({ message: "User not found", status: false }));
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();

        const sent = await sendIsmail(email, "Password Reset OTP", `Your OTP for password reset is: ${otp}`);

        if (sent) {
            return res.status(200).json(ApiResponse({ message: "OTP sent to email", status: true }));
        } else {
            return res.status(500).json(ApiResponse({ message: "Failed to send OTP", status: false }));
        }
    }).catch(err => {
        return res.status(500).json(ApiResponse({ message: errorHandler(err), status: false }));
    });
}

// Verify OTP
export function verifyOtp(req, res) {
    const { email, otp } = req.body;
    User.findOne({ email }).then((user) => {
        if (!user) {
            return res.status(404).json(ApiResponse({ message: "User not found", status: false }));
        }

        if (user.otp !== otp || user.otpExpiry < Date.now()) {
            return res.status(400).json(ApiResponse({ message: "Invalid or expired OTP", status: false }));
        }

        return res.status(200).json(ApiResponse({ message: "OTP Verified", status: true }));
    }).catch(err => {
        return res.status(500).json(ApiResponse({ message: errorHandler(err), status: false }));
    });
}

// Reset Password
export function resetPassword(req, res) {
    const { email, otp, newPassword } = req.body;
    User.findOne({ email }).then((user) => {
        if (!user) {
            return res.status(404).json(ApiResponse({ message: "User not found", status: false }));
        }

        if (user.otp !== otp || user.otpExpiry < Date.now()) {
            return res.status(400).json(ApiResponse({ message: "Invalid or expired OTP", status: false }));
        }

        user.password = newPassword; // Virtual setter will hash it
        user.otp = undefined;
        user.otpExpiry = undefined;

        user.save().then(() => {
            return res.status(200).json(ApiResponse({ message: "Password reset successfully", status: true }));
        }).catch(err => {
            return res.status(500).json(ApiResponse({ message: errorHandler(err), status: false }));
        });

    }).catch(err => {
        return res.status(500).json(ApiResponse({ message: errorHandler(err), status: false }));
    });
}

//login with email and password
export function login(req, res) {
    const { email, password } = req.body;
    User.findOne({ email })
        .then((user) => {
            if (!user) {
                return res.status(400).json(ApiResponse({ message: "Invalid email or password", status: false }));
            }
            if (!user.authenticate(password)) {
                return res.status(400).json(ApiResponse({ message: "Invalid password!", status: false }));
            }

            const token = generateToken(user)
            return res.status(200).json(ApiResponse({ data: { user: sanitizeUser(user), token }, message: `Welcome ${user.name}` }));

        })
        .catch((err) => {
            return res.status(400).json(ApiResponse({ message: errorHandler(err), status: false }));
        });
}

//registering a new user then sending them otp to verify and logging them in
export function register(req, res) {
    const { name, email, password } = req.body;

    User.findOne({ email }).then((user) => {
        if (user) {
            return res.status(400).json(ApiResponse({ message: "User with this email already exists", status: false }));
        }

        const newUser = new User({ name, email, password });

        newUser
            .save()
            .then((data) => {
                const token = generateToken(data);
                const response = { user: sanitizeUser(data), token }
                return res.status(200).json(ApiResponse({ data: response, message: "User registered successfully" }));
            })
            .catch((error) => {
                if (error) {
                    return res.status(400).json(ApiResponse({ message: errorHandler(error), status: false }));
                }
            })
    });

}
