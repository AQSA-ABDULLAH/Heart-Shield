// server/controllers/doctor/doctorForgetPassword.js

const Doctor = require("../../models/Doctor"); // Make sure this path to your Doctor model is correct
const ForgetPassword = require("../../models/ForgetPassword");
const compileEmailTemplate = require("../../helpers/compile-email-template");
const mailer = require("../../libs/mailer");
const { hashPassword } = require("../../helpers/hashPassword");

class DoctorForgetPasswordController {
    
    // OTP GENERATION
    static async generateOTP() {
        return Math.floor(1000 + Math.random() * 9000); // 4-digit OTP
    } 

    // 1. FORGET PASSWORD (Send OTP)
    static forgetPassword = async (req, res) => {
        try {
            if (!req.body) {
                return res.status(400).json({ status: "error", message: "Missing request body" });
            }
            const { email } = req.body;

            // Check if the Doctor exists
            const doctorExist = await Doctor.findOne({ email });
            if (!doctorExist) {
                return res.status(400).json({ status: "error", message: "Doctor not found with the provided email." });
            }

            // Check/Create ForgetPassword entry
            let forgetPassword = await ForgetPassword.findOne({ email });
            if (!forgetPassword) {
                forgetPassword = new ForgetPassword({ email });
            }

            // Generate and Save OTP
            const OTP = await DoctorForgetPasswordController.generateOTP();
            forgetPassword.otp = OTP;
            await forgetPassword.save();

            // Compile Email
            const template = await compileEmailTemplate({
                fileName: "otp.mjml",
                data: { email, OTP },
            });

            // Send Email
            try {
                await mailer.sendMail(email, "OTP for Password Reset", template);
                return res.status(200).json({
                    status: "success",
                    message: "OTP sent successfully to your email.",
                });
            } catch (error) {
                console.error("Failed to send OTP email:", error);
                return res.status(500).json({ status: "error", message: "Failed to send OTP email." });
            }

        } catch (error) {
            console.error("Error in doctor forget password flow:", error.message);
            return res.status(500).json({ status: "error", message: "An error occurred." });
        }
    };

    // 2. RESET PASSWORD (Verify OTP)
    static async resetPassword(req, res) {
        try {
            const { email, otp } = req.body;

            const forgetPassword = await ForgetPassword.findOne({ email });

            if (!forgetPassword) {
                return res.status(400).json({ status: "error", message: "Request not found." });
            }

            // Verify OTP
            // Note: Ensure types match (string vs number)
            if (String(forgetPassword.otp) !== String(otp)) {
                return res.status(400).json({ status: "error", message: "Incorrect OTP." });
            }

            return res.status(200).json({ status: "success", message: "Account Verified Successfully!" });
        } catch (error) {
            console.error("Error verifying OTP:", error.message);
            return res.status(500).json({ status: "error", message: "Failed to verify OTP." });
        }
    }

    // 3. UPDATE PASSWORD
    static async updatePassword(req, res) {
        const { email, password, confirmPassword  } = req.body;

        if (password !== confirmPassword) {
            return res.status(422).json({ error: "Password and Confirm Password don't match" });
        }
    
        try {
            const hashedPassword = await hashPassword(password);
    
            // Update DOCTOR password
            const updatedDoctor = await Doctor.findOneAndUpdate(
                { email }, 
                { password: hashedPassword }, 
                { new: true }
            );
    
            if (!updatedDoctor) {
                return res.status(404).send({ status: "failed", message: `No doctor found with email: ${email}` });
            }
            
            // Clean up OTP
            await ForgetPassword.findOneAndDelete({ email });
    
            res.status(200).send({ status: "success", message: "Password updated successfully", data: updatedDoctor });
        } catch (error) {
            console.error("Error updating password:", error);
            res.status(500).send({ status: "failed", message: "Failed to update password" });
        }
    }
}

// *** THIS EXPORT MUST MATCH THE IMPORT IN YOUR ROUTE FILE ***
module.exports = { DoctorForgetPasswordController };