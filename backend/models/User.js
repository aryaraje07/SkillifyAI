import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["learner", "trainer", "admin", "student", "faculty", "parent"],
      required: true,
    },

    // Workforce profile fields for learners/officials and training officers.
    designation: String,

    jobRole: String,

    officialId: {
      type: String,
      unique: true,
      sparse: true,
    },

    employeeId: {
      type: String,
      unique: true,
      sparse: true,
    },

    organization: String,
    currentAssignment: String,
    qualification: String,
    yearsOfExperience: {
      type: Number,
      min: 0,
    },
    targetRole: String,
    previousTraining: [String],
    profile: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // 🔹 FACULTY-SPECIFIC FIELDS
    department: {
      type: String,
      required: false, // Make optional for existing faculty
    },

    specialization: {
      type: String,
      required: false, // Make optional for existing faculty
    },

    // 🔹 ROLE-BASED UNIQUE IDS
    studentId: {
      type: String,
      unique: true,
      sparse: true,
    },

    facultyId: {
      type: String,
      unique: true,
      sparse: true,
    },

    parentId: {
      type: String,
      unique: true,
      sparse: true,
    },

    // 🔹 STUDENT → multiple faculties
    faculties: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // 🔹 STUDENT → multiple parents
    parents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // 🔹 FACULTY → multiple students
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // 🔹 PARENT → multiple students
    children: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // 🔹 STUDENT-ONLY FIELDS
    educationLevel: {
      type: String,
      required: function () {
        return this.role === "student";
      },
    },

    // Face data is used for learner/student assessment proctoring.
    faceData: {
      embedding: {
        type: [Number], // Face embedding vector
        default: undefined,
      },
      model: {
        type: String, // e.g. "face-api.js"
      },
      registeredAt: {
        type: Date,
      },
    },

    faceVerified: {
      type: Boolean,
      default: function () {
        return ["student", "learner"].includes(this.role) ? false : undefined;
      },
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
