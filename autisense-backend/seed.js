import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Load env vars
dotenv.config();

// Load models
import User from './models/User.js';
import Child from './models/Child.js';
import Screening from './models/Screening.js';
import Report from './models/Report.js';

// Connect to DB
mongoose.connect(process.env.MONGO_URI);

const users = [
  {
    name: 'Admin User',
    email: 'admin@autisense.com',
    password: 'Admin@123',
    role: 'admin'
  },
  {
    name: 'Dr. Ramesh Gupta',
    email: 'doctor1@hospital.com',
    password: 'Doctor@123',
    role: 'doctor'
  },
  {
    name: 'Dr. Anjali Rao',
    email: 'doctor2@hospital.com',
    password: 'Doctor@123',
    role: 'doctor'
  },
  {
    name: 'Priya Sharma',
    email: 'priya@gmail.com',
    password: 'Parent@123',
    role: 'parent'
  },
  {
    name: 'Sunita Patel',
    email: 'sunita@gmail.com',
    password: 'Parent@123',
    role: 'parent'
  }
];

const seedDB = async () => {
  try {
    await User.deleteMany();
    await Child.deleteMany();
    await Screening.deleteMany();
    await Report.deleteMany();

    // Insert Users (hashing passwords first)
    const salt = await bcrypt.genSalt(10);
    const hashedUsers = await Promise.all(users.map(async u => {
      return { ...u, password: await bcrypt.hash(u.password, salt) };
    }));

    const createdUsers = await User.insertMany(hashedUsers);

    const adminUser = createdUsers.find(u => u.role === 'admin');
    const doctorUser = createdUsers.find(u => u.role === 'doctor');
    const parent1 = createdUsers.find(u => u.email === 'priya@gmail.com');
    const parent2 = createdUsers.find(u => u.email === 'sunita@gmail.com');

    // Insert Children
    const children = [
      {
        parentId: parent1._id,
        name: 'Arjun Sharma',
        dob: new Date('2021-04-10'),
        gender: 'male',
        guardian: 'Priya Sharma'
      },
      {
        parentId: parent2._id,
        name: 'Meera Patel',
        dob: new Date('2020-08-22'),
        gender: 'female',
        guardian: 'Sunita Patel'
      }
    ];

    const createdChildren = await Child.insertMany(children);

    // Insert Screenings
    const c1 = createdChildren[0];
    const c2 = createdChildren[1];

    // Helper to generate answers
    const generateAnswers = (riskProfile) => {
      const arr = [];
      for (let i = 0; i < 20; i++) {
        // low risk means answers matching expected typical dev
        // Q 0-9: expected true. Q 10-19: expected false.
        let ans;
        if (riskProfile === 'Low') {
          ans = i <= 9 ? true : false;
        } else if (riskProfile === 'High') {
          ans = i <= 9 ? false : true;
        } else {
          // Medium: mix it up
          ans = Math.random() > 0.5;
        }
        arr.push({ questionId: i+1, questionText: `Question ${i+1}`, answer: ans });
      }
      return arr;
    };

    const screenings = [
      {
        childId: c1._id,
        parentId: parent1._id,
        answers: generateAnswers('Low'),
        score: 4,
        riskLevel: 'Low',
        riskPercentage: 20,
        categories: { social: 1, communication: 1, behavior: 1, sensory: 1, routine: 0 },
        flaggedQuestions: [1, 2, 11, 15],
        status: 'completed'
      },
      {
        childId: c2._id,
        parentId: parent2._id,
        answers: generateAnswers('High'),
        score: 16,
        riskLevel: 'High',
        riskPercentage: 80,
        categories: { social: 4, communication: 4, behavior: 4, sensory: 2, routine: 2 },
        flaggedQuestions: [1,2,3,4,5,6,7,8,11,12,13,14,15,16,17,18],
        status: 'pending'
      }
    ];

    const createdScreenings = await Screening.insertMany(screenings);

    // Insert Reports
    const reports = [
      {
        screeningId: createdScreenings[0]._id,
        childId: c1._id,
        parentId: parent1._id,
        riskLevel: 'Low',
        score: 4,
        aiAnalysis: 'Child is developing well.',
        sharedWithDoctor: true,
        sharedDoctorId: doctorUser._id
      },
      {
        screeningId: createdScreenings[1]._id,
        childId: c2._id,
        parentId: parent2._id,
        riskLevel: 'High',
        score: 16,
        aiAnalysis: 'High risk detected. Immediate consultation needed.',
        sharedWithDoctor: true,
        sharedDoctorId: doctorUser._id
      }
    ];

    await Report.insertMany(reports);

    console.log('✅ Database seeded!');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedDB();
