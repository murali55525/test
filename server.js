const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/config', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  picture: String,
});

const User = mongoose.model('User', userSchema);

// Save User Route
app.post('/saveUser', async (req, res) => {
  const { name, email, picture } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ name, email, picture });
      await user.save();
      return res.status(201).send('User created');
    } else {
      return res.status(200).send('User already exists');
    }
  } catch (error) {
    console.error('Error saving user:', error);
    return res.status(500).send('Error saving user');
  }
});

// Workout Schema
const workoutSchema = new mongoose.Schema({
  userId: String,
  workoutType: String,
  duration: Number,
  caloriesBurned: Number,
  date: { type: Date, default: Date.now },
});

const Workout = mongoose.model('Workout', workoutSchema);

// Save Workout Route
app.post('/saveWorkout', async (req, res) => {
  const { userId, workoutType, duration, caloriesBurned, date } = req.body;
  try {
    const workout = new Workout({ userId, workoutType, duration, caloriesBurned, date });
    await workout.save();
    res.status(201).send('Workout saved');
  } catch (error) {
    console.error('Error saving workout:', error);
    res.status(500).send('Error saving workout');
  }
});

// Get Workouts by UserId Route
app.get('/workouts/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const workouts = await Workout.find({ userId }).sort({ date: -1 });
    res.status(200).json(workouts);
  } catch (error) {
    console.error('Error fetching workout history:', error);
    res.status(500).send('Error fetching workout history');
  }
});

// Get Total Workouts by Date
app.get('/workouts/totalByDate/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const workouts = await Workout.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          totalWorkouts: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } }
    ]);
    res.status(200).json(workouts);
  } catch (error) {
    console.error('Error fetching total workouts:', error);
    res.status(500).send('Error fetching total workouts');
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
