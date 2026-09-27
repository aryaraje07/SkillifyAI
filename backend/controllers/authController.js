/**
 * REGISTER
 */
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import { generateRoleId } from "../utils/generateUserId.js";
import { generateCompetencyProfile } from "../services/competencyProfileService.js";


export const registerUser = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      password,
      role,
      employeeId,
      officialId,
      designation,
      jobRole,
      department,
      organization,
      currentAssignment,
      qualification,
      yearsOfExperience,
      targetRole,
      previousTraining,
    } = req.body;

    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedPhone = String(phone || "").trim();
    if (!String(fullName || "").trim() || !normalizedEmail || !normalizedPhone || !String(password || "").trim()) {
      return res.status(400).json({ message: "Full name, email, phone number, and password are required." });
    }
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) return res.status(400).json({ message: "Enter a valid email address." });
    if (String(password).length < 6) return res.status(400).json({ message: "Password must contain at least 6 characters." });

    const roleAliases = { student: "learner", faculty: "trainer" };
    const normalizedRole = roleAliases[role] || role;
    if (!["learner", "trainer", "admin"].includes(normalizedRole)) {
      return res.status(400).json({ message: "Role must be learner, trainer, or admin" });
    }

    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔹 Generate Role ID
    const roleId = generateRoleId(normalizedRole);

    const userData = {
      fullName,
      email: normalizedEmail,
      phone: normalizedPhone,
      password: hashedPassword,
      role: normalizedRole,
      employeeId,
      officialId,
      designation,
      jobRole,
      department,
      organization,
      currentAssignment,
      qualification,
      yearsOfExperience,
      targetRole,
      previousTraining,
    };

    // 🔹 Attach role-specific fields
    if (normalizedRole === "learner") {
      userData.studentId = roleId;
      userData.officialId = officialId || roleId;
      userData.faceVerified = false;
    }

    if (normalizedRole === "trainer") {
      userData.facultyId = roleId;
    }

    if (role === "admin") {
      // Admin doesn't need a specific ID field
    }

    let user;
    for (let attempt = 0; attempt < 3 && !user; attempt += 1) {
      const roleId = generateRoleId(normalizedRole);
      const candidate = { ...userData };
      if (normalizedRole === "learner") {
        candidate.studentId = roleId;
        candidate.officialId = officialId || roleId;
        candidate.faceVerified = false;
      }
      if (normalizedRole === "trainer") candidate.facultyId = roleId;
      try { user = await User.create(candidate); }
      catch (createError) { if (createError?.code !== 11000 || attempt === 2) throw createError; }
    }

    // Identify relevant competencies without creating assessment evidence.
    if (normalizedRole === "learner") {
      setImmediate(async () => {
        try {
          await generateCompetencyProfile(user);
        } catch (profileError) {
          console.error("Competency relevance identification failed during registration:", profileError.message);
        }
      });
    }

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        role: user.role,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        designation: user.designation,
        jobRole: user.jobRole,
        department: user.department,
        organization: user.organization,
        currentAssignment: user.currentAssignment,
        qualification: user.qualification,
        yearsOfExperience: user.yearsOfExperience,
        previousTraining: user.previousTraining,
        targetRole: user.targetRole,
        officialId: user.officialId,
        employeeId: user.employeeId,
      },
    });

  } catch (error) {
    console.error("Registration error:", error.message);
    if (error?.code === 11000) return res.status(409).json({ message: "An account with this email or official ID already exists." });
    if (error?.name === "ValidationError") return res.status(400).json({ message: Object.values(error.errors).map((item) => item.message).join(" ") });
    if (error?.name === "MongooseServerSelectionError" || /buffering timed out|not connected/i.test(error?.message || "")) return res.status(503).json({ message: "Database is not connected. Please try again after the backend reports MongoDB connected." });
    res.status(500).json({ message: "Registration could not be completed. Check the backend connection and logs." });
  }
};


/**
 * LOGIN
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        officialId: user.officialId || null,
        employeeId: user.employeeId || null,
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/*
============================
GET PROFILE
============================
*/
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

/*
============================
UPDATE PROFILE
============================
*/
export const updateProfile = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      educationLevel,
      employeeId,
      officialId,
      designation,
      department,
      organization,
      currentAssignment,
      qualification,
      yearsOfExperience,
      targetRole,
      previousTraining,
    } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.phone = phone || user.phone;

    if (user.role === "student" || user.role === "learner") {
      user.educationLevel =
        educationLevel || user.educationLevel;
    }

    Object.assign(user, {
      employeeId: employeeId || user.employeeId,
      officialId: officialId || user.officialId,
      designation: designation || user.designation,
      department: department || user.department,
      organization: organization || user.organization,
      currentAssignment: currentAssignment || user.currentAssignment,
      qualification: qualification || user.qualification,
      yearsOfExperience: yearsOfExperience ?? user.yearsOfExperience,
      targetRole: targetRole || user.targetRole,
      previousTraining: previousTraining || user.previousTraining,
    });

    await user.save();

    // Regenerate competency profile on profile update (non-blocking)
    if (user.role === "learner" || user.role === "student") {
      setImmediate(async () => {
        try {
          await generateCompetencyProfile(user);
        } catch (profileError) {
          console.error("Competency profile regeneration failed during profile update:", profileError.message);
        }
      });
    }

    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update profile" });
  }
};
