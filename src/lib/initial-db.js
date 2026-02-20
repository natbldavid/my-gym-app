export const initialDb = {
  passcode: {
    version: 1,
    passcode: "123654",
    updated_at: "2026-02-20T10:15:00.000Z",
  },
  gym_days_template: [ 
    {
      "day_number": 1,
      "day_name": "Lower + Posterior Chain",
      "area": "Legs/ Glutes/ Back Thickness",
      "exercises": [
        {
          "exercise_id": "ex_1",
          "exercise_name": "Romanian Deadlift",
          "start_weight": 40,
          "current_weight": 40,
          "category": "Compound Lifts",
          "reps": "3x8-10",
          "last_updated": "2026-02-20T09:30:00.000Z"
        },
        {
          "exercise_id": "ex_2",
          "exercise_name": "Seated Row",
          "start_weight": 32,
          "current_weight": 32,
          "category": "Compound Lifts",
          "reps": "3x8-12",
          "last_updated": "2026-02-20T09:30:00.000Z"
        },
        {
          "exercise_id": "ex_3",
          "exercise_name": "Walking Lunges",
          "start_weight": 6,
          "current_weight": 6,
          "category": "Compound Lifts",
          "reps": "2x10/leg",
          "last_updated": "2026-02-20T09:30:00.000Z"
        },
        {
          "exercise_id": "ex_4",
          "exercise_name": "Rear Deltoid Machine",
          "start_weight": 32,
          "current_weight": 32,
          "category": "Accessory",
          "reps": "2x12-15",
          "last_updated": "2026-02-20T09:30:00.000Z"
        },
        {
          "exercise_id": "ex_5",
          "exercise_name": "Hammer Curls",
          "start_weight": 8,
          "current_weight": 8,
          "category": "Accessory",
          "reps": "3x10-12",
          "last_updated": "2026-02-20T09:30:00.000Z"
        },
        {
          "exercise_id": "ex_6",
          "exercise_name": "Calf Raises",
          "start_weight": 45,
          "current_weight": 45,
          "category": "Accessory",
          "reps": "3x12-15",
          "last_updated": "2026-02-20T09:30:00.000Z"
        },
        {
          "exercise_id": "ex_7",
          "exercise_name": "Hanging Leg Raises",
          "start_weight": null,
          "current_weight": null,
          "category": "Abs",
          "reps": "3x8-12",
          "last_updated": "2026-02-20T09:30:00.000Z"
        }
      ]
    },
    {
      "day_number": 2,
      "day_name": "Push Dominant",
      "area": "Chest/ Shoulders/ Quads",
      "exercises": [
        {
          "exercise_id": "ex_8",
          "exercise_name": "Dumbbell Bench Press",
          "start_weight": 14,
          "current_weight": 14,
          "category": "Compound Lifts",
          "reps": "3x8-12",
          "last_updated": "2026-02-20T09:30:00.000Z"
        },
        {
          "exercise_id": "ex_9",
          "exercise_name": "Leg Press",
          "start_weight": 45,
          "current_weight": 45,
          "category": "Compound Lifts",
          "reps": "3x8-12",
          "last_updated": "2026-02-20T09:30:00.000Z"
        },
        {
          "exercise_id": "ex_10",
          "exercise_name": "Dumbbell Shoulder Press",
          "start_weight": 12,
          "current_weight": 12,
          "category": "Compound Lifts",
          "reps": "3x8-12",
          "last_updated": "2026-02-20T09:30:00.000Z"
        },
        {
          "exercise_id": "ex_11",
          "exercise_name": "Cable Chest Fly",
          "start_weight": 7.5,
          "current_weight": 7.5,
          "category": "Accessory",
          "reps": "2x12-15",
          "last_updated": "2026-02-20T09:30:00.000Z"
        },
        {
          "exercise_id": "ex_12",
          "exercise_name": "Tricep Pushdown",
          "start_weight": 8,
          "current_weight": 8,
          "category": "Accessory",
          "reps": "3x10-12",
          "last_updated": "2026-02-20T09:30:00.000Z"
        },
        {
          "exercise_id": "ex_13",
          "exercise_name": "Lateral Raises",
          "start_weight": 6,
          "current_weight": 6,
          "category": "Accessory",
          "reps": "2x12-15",
          "last_updated": "2026-02-20T09:30:00.000Z"
        },
        {
          "exercise_id": "ex_14",
          "exercise_name": "Sit-Ups",
          "start_weight": null,
          "current_weight": null,
          "category": "Abs",
          "reps": "3x12-15",
          "last_updated": "2026-02-20T09:30:00.000Z"
        }
      ]
    },
    {
      "day_number": 3,
      "day_name": "Pull Dominant",
      "area": "Backs/ Arms/ Upper Chest",
      "exercises": [
        {
          "exercise_id": "ex_15",
          "exercise_name": "Lat Pulldown",
          "start_weight": 32,
          "current_weight": 32,
          "category": "Compound Lifts",
          "reps": "3x8-12",
          "last_updated": "2026-02-20T09:30:00.000Z"
        },
        {
          "exercise_id": "ex_16",
          "exercise_name": "Incline Dumbbell Press",
          "start_weight": 10,
          "current_weight": 10,
          "category": "Compound Lifts",
          "reps": "3x8-12",
          "last_updated": "2026-02-20T09:30:00.000Z"
        },
        {
          "exercise_id": "ex_17",
          "exercise_name": "Squats",
          "start_weight": 6,
          "current_weight": 6,
          "category": "Compound Lifts",
          "reps": "3x10",
          "last_updated": "2026-02-20T09:30:00.000Z"
        },
        {
          "exercise_id": "ex_18",
          "exercise_name": "Barbell Curls",
          "start_weight": 15,
          "current_weight": 15,
          "category": "Accessory",
          "reps": "3x8-12",
          "last_updated": "2026-02-20T09:30:00.000Z"
        },
        {
          "exercise_id": "ex_19",
          "exercise_name": "Tricep Overhead Cable",
          "start_weight": 5.25,
          "current_weight": 5.25,
          "category": "Accessory",
          "reps": "2x12",
          "last_updated": "2026-02-20T09:30:00.000Z"
        },
        {
          "exercise_id": "ex_20",
          "exercise_name": "Shrugs",
          "start_weight": 12,
          "current_weight": 12,
          "category": "Accessory",
          "reps": "2x12",
          "last_updated": "2026-02-20T09:30:00.000Z"
        },
        {
          "exercise_id": "ex_21",
          "exercise_name": "Plank",
          "start_weight": null,
          "current_weight": null,
          "category": "Abs",
          "reps": "3x45-60secs",
          "last_updated": "2026-02-20T09:30:00.000Z"
        }
      ]
    }
  ],
  gym_sessions: [
    {
      session_id: "gs_1",
      session_date: "2026-02-19",
      gym_day: { day_number: 1, day_name: "Lower + Posterior Chain" },
      duration_minutes: 12,
      exercises: [
        {
          exercise_id: "ex_1",
          exercise_name: "Romanian Deadlift",
          sets: [
            { weight: 40, reps: 10 },
            { weight: 40, reps: 9 },
            { weight: 40, reps: 8 },
          ],
        },
      ],
      created_at: "2026-02-19T20:10:00.000Z",
    },
  ],
  protein_intake: [
    {
      entry_id: "pi_1",
      date: "2026-02-19",
      grams: 10,
      created_at: "2026-02-19T20:00:00.000Z",
    },
  ],
  football_sessions: [
    {
      entry_id: "fb_1",
      date: "2026-02-17",
      duration_minutes: 9,
      created_at: "2026-02-17T20:05:00.000Z",
    },
  ],
  squash_sessions: [
    {
      entry_id: "sq_1",
      date: "2026-02-16",
      duration_minutes: 45,
      created_at: "2026-02-16T21:10:00.000Z",
    },
  ],
};