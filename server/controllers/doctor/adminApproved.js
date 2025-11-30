const Doctor = require("../../models/Doctor");

const getAllDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find().sort({ createdAt: -1 }); // latest first

        res.status(200).json({
            message: "Doctors fetched successfully",
            doctors,
        });
    } catch (error) {
        console.error("Error fetching doctors:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const getDoctor = async (req, res) => {
    try {
        const { id } = req.params;

        const doctor = await Doctor.findById(id);

        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        res.status(200).json({
            message: "Doctor fetched successfully",
            doctor,
        });
    } catch (error) {
        console.error("Error fetching doctor:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};



const approved = async (req, res) => {
    try {
        const { doctorId } = req.body;

        if (!doctorId) {
            return res.status(400).json({ message: "Doctor ID is required" });
        }

        const doctor = await Doctor.findByIdAndUpdate(
            doctorId,
            {
                is_approved: true,
                license_status: "verified",
                updatedAt: new Date()
            },
            { new: true }
        );

        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        res.status(200).json({ message: "Doctor approved successfully", doctor });
    } catch (error) {
        console.error("Error approving doctor:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


const reject = async (req, res) => {
    try {
        const { doctorId } = req.body;

        if (!doctorId) {
            return res.status(400).json({ message: "Doctor ID is required" });
        }

        const doctor = await Doctor.findByIdAndUpdate(
            doctorId,
            {
                is_approved: false,
                license_status: "rejected",
                updatedAt: new Date()
            },
            { new: true }
        );

        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        res.status(200).json({ message: "Doctor rejected successfully", doctor });
    } catch (error) {
        console.error("Error rejecting doctor:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


module.exports = { approved, reject, getAllDoctors, getDoctor };