import Job from "../models/job.js"
import JobApplication from "../models/jobApplication.js"
import User from "../models/User.js"
import {v2 as cloudinary} from 'cloudinary'

//Get user data
export const getUserData = async(req,res)=>{
    const userId=req.auth.userId
    try {
        const user=await User.findById(userId)
        if(!user){
            res.json({success:false,message:"User not found!"})
        }
        res.json({success:true,user})
    } catch (error) {
        res.json({success:false,message:error.message})
        
    }

}



//Apply for a job
export const applyForJob = async (req, res) => {
    const { jobId } = req.body;
    const userId = req.auth.userId;
    try {
        const isAlreadyApplied = await JobApplication.find({ jobId, userId });
        if (isAlreadyApplied.length > 0) {  // Fix: Check length
            return res.json({ success: false, message: 'Already Applied' });
        }
        const jobData = await Job.findById(jobId);
        if (!jobData) {
            return res.json({ success: false, message: "Job not found" });
        }
        await JobApplication.create({
            companyId: jobData.companyId,
            userId,
            jobId,
            date: Date.now(),
        });
        res.json({ success: true, message: "Applied Successfully" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};


//Get user applied applications
export const getUserJobApplications = async(req,res)=>{

    try {
        const userId=req.auth.userId
        const application = await JobApplication.find({userId})
        .populate('companyId','name email image')
        .populate('jobId','title description location category level salary')
        .exec()
        if(!application){
            res.json({success:false,message:"No job applications found for this user"})
        }
        res.json({success:true, applications: application})
    } catch (error) {
        res.json({success:false,message:error.message})
    }


}

//Update user profile(resume)
export const updateUserResume = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const resumeFile = req.file;
        const userData = await User.findById(userId);
        if (resumeFile) {
            const resumeUpload = await cloudinary.uploader.upload(resumeFile.path);  // Fix: Correct variable name
            userData.resume = resumeUpload.secure_url;
        }
        await userData.save();
        return res.json({ success: true, message: "Resume Updated" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};