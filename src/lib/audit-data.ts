export interface AnswerOption {
  text: string;
  points: number;
  hint?: string;
  badge?: string;
}

export interface Question {
  id: string;
  sectionId: string;
  numberStr: string; // e.g. "1.1", "1.2"
  text: string;
  description: string;
  options: AnswerOption[];
}

export interface AuditSection {
  id: string;
  name: string;
  shortName: string;
  pillarNumber: number;
  icon: string;
  maxPoints: number;
  subtitle: string;
  questions: Question[];
}

export interface ProspectDetails {
  name: string; // Prospect Full Name: Aakash Verma
  clientName?: string;
  category: string; // Primary Fitness Goal: Burn Belly Fat & Lose Extra Weight
  locality: string; // Summary of Target Horizon, Age & Sex
  phone?: string;
  whatsappNumber?: string;
  mapsUrl?: string;
  auditorName?: string; // Rethink Coach
  age?: string;
  biologicalSex?: "Male" | "Female";
  targetHorizon?: string; // Structured 12 Weeks (Recommended)
  heightCm?: string;
  heightFt?: string;
  heightIn?: string;
  heightUnit?: "cm" | "ft";
  weightKg?: string;
  targetWeightKg?: string;
  bmi?: string;
  bmiCategory?: string;
  optimalMinKg?: string;
  optimalMaxKg?: string;
  weightGapKg?: string;
  goal?: string;
}

export type BusinessDetails = ProspectDetails;
export type ClientDetails = ProspectDetails;
export type MemberDetails = ProspectDetails;

export function formatTitleCase(input: string): string {
  if (!input) return "";
  return input
    .trim()
    .split(/\s+/)
    .map((word) => {
      if (!word) return "";
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

export function cleanPhoneNumber(rawPhone: string): string {
  const digits = (rawPhone || "").replace(/\D/g, "");
  if (digits.length === 10) return "91" + digits;
  if (digits.length === 11 && digits.startsWith("0")) return "91" + digits.slice(1);
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  return digits;
}

export function isValidIndianMobile(rawPhone: string): boolean {
  const digits = (rawPhone || "").replace(/\D/g, "");
  return digits.length === 10 || (digits.length === 12 && digits.startsWith("91"));
}

export function formatWhatsAppUrl(rawPhone: string, message: string): string {
  const cleanNumber = cleanPhoneNumber(rawPhone);
  const encodedText = encodeURIComponent(message);
  if (cleanNumber && cleanNumber.length >= 10) {
    return `https://wa.me/${cleanNumber}?text=${encodedText}`;
  }
  return `https://wa.me/?text=${encodedText}`;
}

// ==========================================
// BIOMETRICS & BMI CALCULATION ENGINE
// ==========================================

export interface BmiAnalysis {
  bmi: number;
  formattedBmi: string;
  category: "Underweight" | "Normal" | "Overweight" | "Obese";
  categoryColor: string;
  optimalMinKg: number;
  optimalMaxKg: number;
  idealRangeText: string;
  deltaKg: number;
  weightGapText: string;
  summary: string;
}

export function calculateBmi(
  heightCmRaw: number | string,
  weightKgRaw: number | string,
  targetWeightRaw?: number | string
): BmiAnalysis | null {
  const hCm = typeof heightCmRaw === "string" ? parseFloat(heightCmRaw) : heightCmRaw;
  const wKg = typeof weightKgRaw === "string" ? parseFloat(weightKgRaw) : weightKgRaw;

  if (!hCm || hCm <= 50 || hCm > 250 || !wKg || wKg <= 20 || wKg > 300) {
    return null;
  }

  const hMeters = hCm / 100;
  const rawBmi = wKg / (hMeters * hMeters);
  const bmi = Math.round(rawBmi * 10) / 10;

  // Safe optimal target weight range based on standard 18.5 - 24.9 BMI
  const optimalMinKg = Math.round(18.5 * hMeters * hMeters);
  const optimalMaxKg = Math.round(24.9 * hMeters * hMeters);
  const idealRangeText = `Ideal: ${optimalMinKg} - ${optimalMaxKg} kg`;

  // Weight Gap calculation: Target Wt - Current Wt
  let weightGapText = "";
  let deltaKg = 0;
  if (targetWeightRaw) {
    const tKg = typeof targetWeightRaw === "string" ? parseFloat(targetWeightRaw) : targetWeightRaw;
    if (tKg && tKg > 0) {
      const diff = Math.round((tKg - wKg) * 10) / 10;
      deltaKg = diff;
      weightGapText = diff > 0 ? `+${diff.toFixed(1)} kg` : `${diff.toFixed(1)} kg`;
    }
  }

  if (!weightGapText) {
    if (wKg > optimalMaxKg) {
      const excess = Math.round((wKg - optimalMaxKg) * 10) / 10;
      deltaKg = -excess;
      weightGapText = `-${excess.toFixed(1)} kg`;
    } else if (wKg < optimalMinKg) {
      const deficit = Math.round((optimalMinKg - wKg) * 10) / 10;
      deltaKg = deficit;
      weightGapText = `+${deficit.toFixed(1)} kg`;
    } else {
      weightGapText = "0.0 kg";
    }
  }

  let category: BmiAnalysis["category"] = "Normal";
  let categoryColor = "#10B981"; // Emerald
  let summary = "Optimal body mass index within recommended athletic health ranges.";

  if (bmi < 18.5) {
    category = "Underweight";
    categoryColor = "#F59E0B"; // Amber
    summary = "Below athletic baseline. Lean muscle hyper-growth protocol recommended.";
  } else if (bmi <= 24.9) {
    category = "Normal";
    categoryColor = "#10B981"; // Emerald
    summary = "Ideal metabolic BMI index. Focus on body recomposition & progressive overload.";
  } else if (bmi <= 29.9) {
    category = "Overweight";
    categoryColor = "#F97316"; // Orange
    summary = "Elevated BMI index. Controlled visceral fat-loss & progressive resistance training needed.";
  } else {
    category = "Obese";
    categoryColor = "#EF4444"; // Rose
    summary = "High joint loading and metabolic drag. Supervised 1-on-1 coaching protocol needed.";
  }

  return {
    bmi,
    formattedBmi: bmi.toFixed(1),
    category,
    categoryColor,
    optimalMinKg,
    optimalMaxKg,
    idealRangeText,
    deltaKg,
    weightGapText,
    summary,
  };
}

export function convertFtInToCm(feet: number, inches: number): number {
  const totalInches = (feet || 0) * 12 + (inches || 0);
  return Math.round(totalInches * 2.54);
}

export function convertCmToFtIn(cm: number): { feet: number; inches: number } {
  if (!cm || cm <= 0) return { feet: 0, inches: 0 };
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
}

// ==========================================
// FITNESS GOALS & TARGET HORIZONS
// ==========================================

export const FITNESS_GOALS = [
  {
    name: "Burn Belly Fat & Lose Extra Weight",
    icon: "Flame",
    subtitle: "Visceral fat reduction, metabolic acceleration & body recomposition",
  },
  {
    name: "Build Lean Muscle Mass & Hypertrophy",
    icon: "Dumbbell",
    subtitle: "Progressive overload, high-protein surplus & muscle mass",
  },
  {
    name: "Postural Alignment & Chronic Back Relief",
    icon: "ShieldCheck",
    subtitle: "Spinal decompression, thoracic mobility & hip flexor release",
  },
  {
    name: "Athletic Strength & Functional Conditioning",
    icon: "Zap",
    subtitle: "Compound lift mechanics, power output & injury resilience",
  },
  {
    name: "Cardiovascular Endurance & Daytime Stamina",
    icon: "Heart",
    subtitle: "Aerobic capacity, energy stabilization & fatigue elimination",
  },
];

export const TARGET_HORIZONS = [
  "Structured 12 Weeks (Recommended)",
  "16-Week Recomposition",
  "24-Week Complete Transformation",
  "8-Week Kickstart Sprint",
];

export const BUSINESS_CATEGORIES = FITNESS_GOALS;

// ==========================================
// 6 FITNESS PILLARS & 18 QUESTIONS (100 PTS)
// ==========================================

export const AUDIT_SECTIONS: AuditSection[] = [
  {
    id: "posture",
    name: "Body Posture & Biomechanics Screen",
    shortName: "Posture & Mechanics",
    pillarNumber: 1,
    icon: "Activity",
    maxPoints: 17,
    subtitle: "Squat mechanics, daily desk load, and overhead shoulder mobility.",
    questions: [
      {
        id: "p1_1",
        sectionId: "posture",
        numberStr: "1.1",
        text: "What happens when you do a bodyweight squat (sitting down deep)?",
        description: "Assess lumbar-pelvic control and ankle dorsiflexion under bodyweight.",
        options: [
          {
            text: "Lower Back Curves / Rounds",
            hint: "Tailbone tucks under (butt-wink). High risk of spine injury under weights.",
            badge: "High Risk Flag",
            points: 0,
          },
          {
            text: "Half Squat Only (Tight Hips)",
            hint: "Can't hit parallel depth without heels lifting off or leaning forward heavily.",
            badge: "Limited Range",
            points: 3,
          },
          {
            text: "Straight Spine & Flat Feet",
            hint: "Can sit deep past parallel with an upright chest and planted heels.",
            badge: "Optimal Mobility",
            points: 6,
          },
        ],
      },
      {
        id: "p1_2",
        sectionId: "posture",
        numberStr: "1.2",
        text: "Daily Sitting Posture & Desk Load",
        description: "Total daily hours spent seated and resultant spinal tightness.",
        options: [
          {
            text: "8–10+ Hours Seated Desk Lock",
            hint: "Hunched neck, shoulders rolled forward, severe hip flexor tightness.",
            badge: "Severe Stagnation",
            points: 0,
          },
          {
            text: "5–7 Hours Desk Work",
            hint: "Moderate sitting with occasional breaks, but shoulders feel stiff by evening.",
            badge: "Moderate Drag",
            points: 3,
          },
          {
            text: "Active / Upright Daily Posture",
            hint: "Take frequent standing breaks and accumulate 8,000+ daily steps.",
            badge: "High Daily Movement",
            points: 6,
          },
        ],
      },
      {
        id: "p1_3",
        sectionId: "posture",
        numberStr: "1.3",
        text: "Overhead Reach & Shoulder Flexibility",
        description: "Scapular clearance and thoracic extension during vertical arm elevation.",
        options: [
          {
            text: "Sharp Pinch or Clicking",
            hint: "Pinching in front shoulders when raising arms straight up overhead.",
            badge: "Impingement Risk",
            points: 0,
          },
          {
            text: "Tight Upper Back Arch",
            hint: "Have to arch lower back excessively to get arms straight past ears.",
            badge: "Thoracic Restriction",
            points: 2,
          },
          {
            text: "Smooth Pain-Free Reach",
            hint: "Can touch biceps to ears with zero neck or shoulder tension.",
            badge: "Full Scapular Clearance",
            points: 5,
          },
        ],
      },
    ],
  },
  {
    id: "pain_joints",
    name: "Pain & Joint Safety Screen",
    shortName: "Pain & Joint Safety",
    pillarNumber: 2,
    icon: "ShieldAlert",
    maxPoints: 17,
    subtitle: "Lower back aches, knee tracking stability, and orthopedic history.",
    questions: [
      {
        id: "p2_1",
        sectionId: "pain_joints",
        numberStr: "2.1",
        text: "Do you experience Lower Back stiffness, dull aches, or pain?",
        description: "Frequency and severity of lumbar or sacral discomfort during daily activities.",
        options: [
          {
            text: "Frequent Morning / Seated Ache",
            hint: "Aches after prolonged sitting, standing, or bending forward.",
            badge: "High PT Need",
            points: 0,
          },
          {
            text: "Occasional Fatigue / Tightness",
            hint: "Tight on stressful work days, but no sharp medical pinch or sciatica.",
            badge: "Muscular Fatigue",
            points: 3,
          },
          {
            text: "Completely Pain-Free",
            hint: "Back feels strong, flexible, and comfortable all day long.",
            badge: "Zero Symptoms",
            points: 6,
          },
        ],
      },
      {
        id: "p2_2",
        sectionId: "pain_joints",
        numberStr: "2.2",
        text: "Do your knees cave inward or ache when climbing stairs or squatting?",
        description: "Valgus knee collapse and patellofemoral tracking under load.",
        options: [
          {
            text: "Yes, Knees Wobble / Cave Inward",
            hint: "Puts heavy twisting shear on knees during loaded gym movements.",
            badge: "Ligament Strain Risk",
            points: 0,
          },
          {
            text: "Occasional Clicking on Stairs",
            hint: "Clicking sounds without sharp pain, but feel hesitant on heavy sets.",
            badge: "Patellar Tracking Flag",
            points: 3,
          },
          {
            text: "Solid & Stable Knee Tracking",
            hint: "Knees track cleanly over toes with zero wobble or clicking.",
            badge: "Stable Joint Mechanics",
            points: 6,
          },
        ],
      },
      {
        id: "p2_3",
        sectionId: "pain_joints",
        numberStr: "2.3",
        text: "History of Past Joint Sprains, Disc Bulge, or Ligament Tears",
        description: "Past orthopedic trauma or structural diagnoses that require guarded loading.",
        options: [
          {
            text: "Past Disc Slip / Ligament Injury",
            hint: "Prior diagnosed injury; unguided floor lifting is medically risky.",
            badge: "Medical Red Flag",
            points: 0,
          },
          {
            text: "Old Sprain (Healed But Guarded)",
            hint: "Healed ankle/wrist sprain, but subconsciously avoid certain exercises.",
            badge: "Guarded Movement",
            points: 2,
          },
          {
            text: "Clean Medical & Orthopedic Record",
            hint: "No bone, disc, or tendon injuries. Full clearance to train.",
            badge: "Clean Clearance",
            points: 5,
          },
        ],
      },
    ],
  },
  {
    id: "gym_habits",
    name: "Gym Floor Habits & Technique",
    shortName: "Gym Technique",
    pillarNumber: 3,
    icon: "Dumbbell",
    maxPoints: 17,
    subtitle: "Free-weight confidence, workout tracking, and dynamic joint preparation.",
    questions: [
      {
        id: "p3_1",
        sectionId: "gym_habits",
        numberStr: "3.1",
        text: "How confident are you using free weights & barbells on the gym floor?",
        description: "Self-efficacy executing compound barbell and dumbbell movements.",
        options: [
          {
            text: "Total Guesswork / Lost on Floor",
            hint: "Stick to treadmills or wander around randomly copying strangers.",
            badge: "Needs Supervised Guidance",
            points: 0,
          },
          {
            text: "Machines Only / Avoid Free Weights",
            hint: "Comfortable on guided machines, but avoid deadlifts and squat racks.",
            badge: "Free Weight Hesitation",
            points: 3,
          },
          {
            text: "Confident With Written Plan",
            hint: "Follow a periodized workout log with safe progressive overload.",
            badge: "High Floor Autonomy",
            points: 6,
          },
        ],
      },
      {
        id: "p3_2",
        sectionId: "gym_habits",
        numberStr: "3.2",
        text: "Do you track your weights, sets, and reps every workout?",
        description: "Systematic logging of exercise volume and progressive overload stimulus.",
        options: [
          {
            text: "Never Track (Repeat Same Weights)",
            hint: "Lift whatever looks open. No structured progressive overload.",
            badge: "Plateau Guaranteed",
            points: 0,
          },
          {
            text: "Mental Guesswork Tracking",
            hint: "Try to remember last week's weight in head, but frequently forget.",
            badge: "Inconsistent Progression",
            points: 3,
          },
          {
            text: "Logged Logbook / App Tracking",
            hint: "Record exact poundages and reps to ensure progressive stimulus.",
            badge: "Systematic Periodization",
            points: 6,
          },
        ],
      },
      {
        id: "p3_3",
        sectionId: "gym_habits",
        numberStr: "3.3",
        text: "What is your Warm-up & Joint Preparation Protocol?",
        description: "Structure of pre-workout dynamic mobility and neuromuscular activation.",
        options: [
          {
            text: "Zero Prep / Lift Heavy While Cold",
            hint: "Jump straight into working sets. Cold muscles tear easily.",
            badge: "Acute Injury Risk",
            points: 0,
          },
          {
            text: "5 Mins Treadmill Only",
            hint: "Gets heart rate up, but does zero dynamic mobility for hips or shoulders.",
            badge: "Incomplete Preparation",
            points: 2,
          },
          {
            text: "Dynamic Mobility & Muscle Activation",
            hint: "Perform specific joint prep, rotator cuff drills, and ramp-up sets.",
            badge: "Optimal CNS Prep",
            points: 5,
          },
        ],
      },
    ],
  },
  {
    id: "nutrition_fuel",
    name: "Daily Nutrition & Fuel Quality",
    shortName: "Nutrition & Fuel",
    pillarNumber: 4,
    icon: "Utensils",
    maxPoints: 17,
    subtitle: "Daily protein intake, sweet chai/beverages, and weekend portion control.",
    questions: [
      {
        id: "p4_1",
        sectionId: "nutrition_fuel",
        numberStr: "4.1",
        text: "Daily Protein Intake (Eggs, Paneer, Chicken, Soya, Whey)?",
        description: "Adequacy of daily amino acid intake for muscular repair and recovery.",
        options: [
          {
            text: "Severe Deficit / Mostly Carbs & Fats",
            hint: "Mostly roti, rice, snacks. Muscles can't repair, leaving you tired.",
            badge: "<0.6g / kg Bodyweight",
            points: 0,
          },
          {
            text: "Only 1 Meal Has Some Protein",
            hint: "Eat eggs or paneer once a day, but total daily amount is insufficient.",
            badge: "Sub-optimal Synthesis",
            points: 3,
          },
          {
            text: "High Protein in Every Single Meal",
            hint: "Hit daily target (1.6g-2g/kg). Muscles recover quickly with minimal soreness.",
            badge: "Optimal Hypertrophy & Fat Loss",
            points: 6,
          },
        ],
      },
      {
        id: "p4_2",
        sectionId: "nutrition_fuel",
        numberStr: "4.2",
        text: "Sweet Chai, Coffee, Soda & Sugary Drinks Frequency",
        description: "Empty liquid calories and glycemic spikes throughout the day.",
        options: [
          {
            text: "3–4+ Cups Sweet Chai / Soda Daily",
            hint: "350–500 empty calories daily spiking insulin and causing belly fat storage.",
            badge: "Hidden Calorie Leak",
            points: 0,
          },
          {
            text: "1–2 Cups Sweet Beverages",
            hint: "Moderate sugar intake with biscuits, but slows down fat loss.",
            badge: "Moderate Drag",
            points: 3,
          },
          {
            text: "Clean Drinks & Black Coffee",
            hint: "Strictly 3+ liters of water, black coffee, or unsweetened green tea.",
            badge: "Zero Liquid Sugar",
            points: 6,
          },
        ],
      },
      {
        id: "p4_3",
        sectionId: "nutrition_fuel",
        numberStr: "4.3",
        text: "Weekend Eating & Dining Out Discipline",
        description: "Caloric control from Friday evening through Sunday night.",
        options: [
          {
            text: "Heavy Weekend Blowout",
            hint: "Friday to Sunday binging completely wipes out Mon-Thu gym progress.",
            badge: "Deficit Destroyer",
            points: 0,
          },
          {
            text: "1–2 Social Cheat Meals",
            hint: "Moderate treat meal with family, but try not to overeat excessively.",
            badge: "Controlled Splurge",
            points: 2,
          },
          {
            text: "Disciplined 7-Day Portion Control",
            hint: "Maintain consistent caloric balance 7 days a week including weekends.",
            badge: "High Satiety Control",
            points: 5,
          },
        ],
      },
    ],
  },
  {
    id: "recovery_sleep",
    name: "Sleep, Stress & Daily Energy",
    shortName: "Recovery & Sleep",
    pillarNumber: 5,
    icon: "Moon",
    maxPoints: 16,
    subtitle: "Nightly sleep duration, afternoon energy crashes, and stress snacking.",
    questions: [
      {
        id: "p5_1",
        sectionId: "recovery_sleep",
        numberStr: "5.1",
        text: "How many hours of restful sleep do you get every night?",
        description: "Uninterrupted restorative sleep and central nervous system recovery.",
        options: [
          {
            text: "<5.5 Hours / Broken Sleep",
            hint: "Wake up exhausted; high cortisol levels block fat-loss and recovery.",
            badge: "Chronic Sleep Debt",
            points: 0,
          },
          {
            text: "6 to 7 Hours Inconsistent",
            hint: "Moderate sleep, but late screen time causes delayed sleep onset.",
            badge: "Marginal Rest",
            points: 3,
          },
          {
            text: "7.5 to 8.5 Hours Deep Sleep",
            hint: "Wake up naturally refreshed with high physical stamina all day.",
            badge: "Optimal Recovery",
            points: 6,
          },
        ],
      },
      {
        id: "p5_2",
        sectionId: "recovery_sleep",
        numberStr: "5.2",
        text: "Afternoon Energy Crash & Caffeine Need",
        description: "Midday glucose crashes, heavy eyelids, and caffeine dependency.",
        options: [
          {
            text: "Severe 3 PM Crash & Brain Fog",
            hint: "Need chai/coffee/sugary snacks just to stay awake through work.",
            badge: "Adrenal & Blood Sugar Dip",
            points: 0,
          },
          {
            text: "Mild Mid-Day Dip",
            hint: "Feel a bit sluggish after lunch, but can push through without extra coffee.",
            badge: "Normal Post-Prandial",
            points: 2,
          },
          {
            text: "Sustained Stamina All Day",
            hint: "Clean natural alertness from morning until evening with zero crashes.",
            badge: "Stable Metabolic Energy",
            points: 5,
          },
        ],
      },
      {
        id: "p5_3",
        sectionId: "recovery_sleep",
        numberStr: "5.3",
        text: "Stress Cravings & Late-Night Snacking",
        description: "Emotional cortisol-driven snacking and post-dinner kitchen grazing.",
        options: [
          {
            text: "High Stress & Late Night Munching",
            hint: "Work stress triggers cravings for sweets or namkeen late at night.",
            badge: "Emotional Eating",
            points: 0,
          },
          {
            text: "Occasional Stress Eating",
            hint: "Only crave sweet treats when sleep-deprived or under strict deadlines.",
            badge: "Fatigue Induced",
            points: 2,
          },
          {
            text: "Complete Appetite Satiety",
            hint: "Feel completely full after dinner; zero urge to graze or snack late.",
            badge: "High Leptin Control",
            points: 5,
          },
        ],
      },
    ],
  },
  {
    id: "history_commitment",
    name: "Past Gym History & Commitment",
    shortName: "History & Consistency",
    pillarNumber: 6,
    icon: "Target",
    maxPoints: 16,
    subtitle: "Solo dropout history, workout resilience under deadlines, and coach accountability.",
    questions: [
      {
        id: "p6_1",
        sectionId: "history_commitment",
        numberStr: "6.1",
        text: "In the past, what happened when you tried going to the gym alone?",
        description: "Historical adherence and drop-off patterns when training unguided.",
        options: [
          {
            text: "Quit Within 2–4 Weeks Solo",
            hint: "Missed 2 days due to work or soreness, lost steam, and stopped completely.",
            badge: "The Solo Dropout Wall",
            points: 0,
          },
          {
            text: "Quit After 2–3 Months (Plateau)",
            hint: "Exercised hard, but didn't see waist changes, lost motivation and quit.",
            badge: "Plateau Frustration",
            points: 3,
          },
          {
            text: "Regular for 6+ Continuous Months",
            hint: "High natural self-discipline; never miss workouts regardless of mood.",
            badge: "High Autonomous Habit",
            points: 6,
          },
        ],
      },
      {
        id: "p6_2",
        sectionId: "history_commitment",
        numberStr: "6.2",
        text: "What happens to your workout routine when work deadlines get busy?",
        description: "Resilience of fitness schedule under heavy professional stress.",
        options: [
          {
            text: "Workout Habit Collapses Completely",
            hint: "Work stress wipes out gym attendance for weeks at a time.",
            badge: "Extreme Friction",
            points: 0,
          },
          {
            text: "Skip a Few Days, But Struggle Back",
            hint: "Gym drops down to 1 day/week, losing muscle conditioning and momentum.",
            badge: "Inconsistent Adherence",
            points: 2,
          },
          {
            text: "Workouts are Non-Negotiable",
            hint: "Use training as stress relief; workouts stay protected on calendar.",
            badge: "Unbreakable Discipline",
            points: 5,
          },
        ],
      },
      {
        id: "p6_3",
        sectionId: "history_commitment",
        numberStr: "6.3",
        text: "Do you need a dedicated coach waiting for you on the gym floor?",
        description: "Need for scheduled 1-on-1 appointment-based external accountability.",
        options: [
          {
            text: "Yes, Need an Appointment with a Coach",
            hint: "If a trainer is waiting for me, I show up 100% of the time. Alone, I make excuses.",
            badge: "High Accountability Need",
            points: 2,
          },
          {
            text: "Hybrid / Occasional Check-ins",
            hint: "Need a coach to review form, progressive overload, and bi-weekly milestones.",
            badge: "Guided Progression",
            points: 4,
          },
          {
            text: "No, Can Motivate Myself Alone",
            hint: "Happy to execute independently as long as I have a written exercise roadmap.",
            badge: "Independent Execution",
            points: 5,
          },
        ],
      },
    ],
  },
];

// ==========================================
// SCORING BANDS & RETHINK PROTOCOLS
// ==========================================

export interface SectionScore {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  score: number;
  maxScore: number;
  percentage: number;
}

export interface ScoreBand {
  title: string;
  range: string;
  badgeClass: string;
  accentColor: string;
  headline: string;
  description: string;
  sprintRecommendation: string;
  sprintDetails: string;
}

export interface AuditRecord {
  id: string;
  createdAt: string;
  business: ProspectDetails;
  answers: Record<string, number>;
  sectionScores: SectionScore[];
  totalScore: number;
  maxScore: number;
  percentage?: number;
  band: ScoreBand;
  findings: Array<{
    questionText: string;
    chosenOptionText: string;
    pointsAwarded: number;
    maxPoints: number;
    sectionName: string;
    hint?: string;
    badge?: string;
  }>;
  diagnosis?: {
    headline: string;
    laggingPillars: string[];
    diagnosisText: string;
  };
}

export function getScoreBand(score: number): ScoreBand {
  if (score < 40) {
    return {
      title: "High Injury & Dropout Risk",
      range: "0–39",
      badgeClass: "bg-rose-500/10 text-rose-400 border-rose-500/30",
      accentColor: "#EF4444",
      headline: "Severe Biomechanical Restrictions & High Solo Dropout Risk",
      description:
        "Your diagnostic screen indicates significant lumbar butt-wink during squats, high sedentary sitting load, uneven protein intake, and an acute risk of gym dropout without supervised 1-on-1 coaching.",
      sprintRecommendation: "12-Week Guided Transformation (1-on-1 Onboarding)",
      sprintDetails:
        "Dedicated 1-on-1 floor coach, progressive mobility rehab, baseline macro nutrition plan, and daily habit accountability.",
    };
  }
  if (score < 70) {
    return {
      title: "Moderate Drag / Needs Structure",
      range: "40–69",
      badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      accentColor: "#F59E0B",
      headline: "Good Foundation With Critical Progression & Nutrition Gaps",
      description:
        "You have strong motivation, but unlogged workouts, lack of dynamic warmup, and weekend caloric blowouts are stalling visible fat loss and body recomposition.",
      sprintRecommendation: "Rethink Strength & Body Recomp Accelerator",
      sprintDetails:
        "Hypertrophy-focused training split, structured protein targets, and bi-weekly body composition scans.",
    };
  }
  if (score < 90) {
    return {
      title: "Strong Foundation",
      range: "70–89",
      badgeClass: "bg-sky-500/10 text-sky-400 border-sky-500/30",
      accentColor: "#0EA5E9",
      headline: "High Performing Presence Ready For Progressive Overload",
      description:
        "Consistent workout discipline with good joint health. Fine-tuning periodization, peri-workout nutrition, and progressive overload will break stubborn plateaus.",
      sprintRecommendation: "Rethink Performance & Hypertrophy Sprint",
      sprintDetails:
        "Advanced periodized split, deload protocols, targeted micronutrient stacking, and 1RM benchmark progression.",
    };
  }
  return {
    title: "Peak Athletic Conditioning",
    range: "90–100",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    accentColor: "#10B981",
    headline: "Elite Movement Mastery & Biomechanical Integrity",
    description:
      "Outstanding consistency across all 6 biomechanical and lifestyle pillars. Maintain movement variability, prevent overuse strain, and sustain lifelong peak vitality.",
    sprintRecommendation: "Rethink VIP Athletic Retainer",
    sprintDetails:
      "Long-term athletic maintenance, advanced biometric tracking, and sports performance optimization.",
  };
}

export function getImprovementVectors(sectionScores: SectionScore[]): {
  headline: string;
  laggingPillars: string[];
  diagnosisText: string;
} {
  const sorted = [...sectionScores].sort((a, b) => a.score - b.score);
  const lowest = sorted.filter((s) => s.percentage < 65);

  if (lowest.length === 0) {
    return {
      headline: "All 6 Fitness Pillars Balanced",
      laggingPillars: ["Peak Athletic Maintenance"],
      diagnosisText:
        "Your baseline movement and lifestyle screen is exceptionally balanced. Focus on progressive overload without joint wear.",
    };
  }

  const laggingPillars = lowest.map((l) => l.name);
  const headline = laggingPillars.slice(0, 3).join(" & ");

  return {
    headline,
    laggingPillars,
    diagnosisText:
      "Your intake indicates significant biomechanical friction, unlogged training, or nutritional leaks. Supervised 1-on-1 coaching will eliminate injury risk and guarantee 12-week body transformation.",
  };
}

export function calculateAudit(
  business: ProspectDetails,
  answers: Record<string, number>,
  auditId?: string
): AuditRecord {
  // Sync live BMI & status into prospect
  if (business.heightCm && business.weightKg) {
    const bmiRes = calculateBmi(business.heightCm, business.weightKg, business.targetWeightKg);
    if (bmiRes) {
      business.bmi = bmiRes.formattedBmi;
      business.bmiCategory = bmiRes.category;
      business.optimalMinKg = bmiRes.optimalMinKg.toString();
      business.optimalMaxKg = bmiRes.optimalMaxKg.toString();
      business.weightGapKg = bmiRes.weightGapText;
    }
  }

  const sectionScores: SectionScore[] = AUDIT_SECTIONS.map((section) => {
    let score = 0;
    section.questions.forEach((q) => {
      const chosenIdx = answers[q.id];
      if (chosenIdx !== undefined && q.options[chosenIdx]) {
        score += q.options[chosenIdx].points;
      }
    });
    return {
      id: section.id,
      name: section.name,
      shortName: section.shortName,
      icon: section.icon,
      score,
      maxScore: section.maxPoints,
      percentage: Math.round((score / section.maxPoints) * 100),
    };
  });

  const totalScore = sectionScores.reduce((sum, s) => sum + s.score, 0);
  const band = getScoreBand(totalScore);
  const diagnosis = getImprovementVectors(sectionScores);

  const findings: AuditRecord["findings"] = [];
  AUDIT_SECTIONS.forEach((section) => {
    section.questions.forEach((q) => {
      const chosenIdx = answers[q.id];
      const opt = chosenIdx !== undefined ? q.options[chosenIdx] : null;
      findings.push({
        questionText: q.text,
        chosenOptionText: opt ? opt.text : "Not answered",
        pointsAwarded: opt ? opt.points : 0,
        maxPoints: Math.max(...q.options.map((o) => o.points)),
        sectionName: section.name,
        hint: opt?.hint,
        badge: opt?.badge,
      });
    });
  });

  const finalId =
    auditId ||
    `RFA-${new Date().toISOString().slice(2, 10).replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`;

  return {
    id: finalId,
    createdAt: new Date().toISOString(),
    business,
    answers,
    sectionScores,
    totalScore,
    maxScore: 100,
    percentage: totalScore,
    band,
    findings,
    diagnosis,
  };
}

// ==========================================
// SAMPLE PROSPECT: AAKASH VERMA
// ==========================================

export const SAMPLE_AUDIT: AuditRecord = {
  id: "RFA-261119-3240",
  createdAt: "2026-11-19T10:30:00.000Z",
  business: {
    name: "Aakash Verma",
    clientName: "Aakash Verma",
    phone: "+91 98765 01234",
    whatsappNumber: "9876501234",
    age: "32",
    biologicalSex: "Male",
    category: "Burn Belly Fat & Lose Extra Weight",
    targetHorizon: "Structured 12 Weeks (Recommended)",
    locality: "32 yrs • Male • Structured 12 Weeks (Recommended)",
    heightCm: "175",
    heightUnit: "cm",
    weightKg: "86",
    targetWeightKg: "73",
    bmi: "28.1",
    bmiCategory: "Overweight",
    optimalMinKg: "57",
    optimalMaxKg: "76",
    weightGapKg: "-13.0 kg",
    auditorName: "Rethink Coach",
    goal: "Burn Belly Fat & Lose Extra Weight",
  },
  answers: {
    // Pillar 1: Body Posture & Biomechanics
    p1_1: 0, // Lower Back Curves / Rounds (0 pts)
    p1_2: 0, // 8-10+ Hours Seated Desk Lock (0 pts)
    p1_3: 1, // Tight Upper Back Arch (2 pts) -> 2/17

    // Pillar 2: Pain & Joint Safety
    p2_1: 1, // Occasional Fatigue / Tightness (3 pts)
    p2_2: 1, // Occasional Clicking on Stairs (3 pts)
    p2_3: 2, // Clean Medical & Orthopedic Record (5 pts) -> 11/17

    // Pillar 3: Gym Floor Habits & Technique
    p3_1: 0, // Total Guesswork / Lost on Floor (0 pts)
    p3_2: 0, // Never Track (Repeat Same Weights) (0 pts)
    p3_3: 1, // 5 Mins Treadmill Only (2 pts) -> 2/17

    // Pillar 4: Daily Nutrition & Fuel Quality
    p4_1: 1, // Only 1 Meal Has Some Protein (3 pts)
    p4_2: 0, // 3-4+ Cups Sweet Chai / Soda Daily (0 pts)
    p4_3: 0, // Heavy Weekend Blowout (0 pts) -> 3/17

    // Pillar 5: Sleep, Stress & Daily Energy
    p5_1: 1, // 6 to 7 Hours Inconsistent (3 pts)
    p5_2: 0, // Severe 3 PM Crash & Brain Fog (0 pts)
    p5_3: 0, // High Stress & Late Night Munching (0 pts) -> 3/16

    // Pillar 6: Past Gym History & Commitment
    p6_1: 0, // Quit Within 2-4 Weeks Solo (0 pts)
    p6_2: 0, // Workout Habit Collapses Completely (0 pts)
    p6_3: 0, // Yes, Need an Appointment with a Coach (2 pts) -> 2/16
  },
  sectionScores: [
    { id: "posture", name: "Body Posture & Biomechanics Screen", shortName: "Posture & Mechanics", icon: "Activity", score: 2, maxScore: 17, percentage: 12 },
    { id: "pain_joints", name: "Pain & Joint Safety Screen", shortName: "Pain & Joint Safety", icon: "ShieldAlert", score: 11, maxScore: 17, percentage: 65 },
    { id: "gym_habits", name: "Gym Floor Habits & Technique", shortName: "Gym Technique", icon: "Dumbbell", score: 2, maxScore: 17, percentage: 12 },
    { id: "nutrition_fuel", name: "Daily Nutrition & Fuel Quality", shortName: "Nutrition & Fuel", icon: "Utensils", score: 3, maxScore: 17, percentage: 18 },
    { id: "recovery_sleep", name: "Sleep, Stress & Daily Energy", shortName: "Recovery & Sleep", icon: "Moon", score: 3, maxScore: 16, percentage: 19 },
    { id: "history_commitment", name: "Past Gym History & Commitment", shortName: "History & Consistency", icon: "Target", score: 2, maxScore: 16, percentage: 13 },
  ],
  totalScore: 23,
  maxScore: 100,
  percentage: 23,
  band: getScoreBand(23),
  findings: [],
  diagnosis: {
    headline: "Body Posture & Gym Floor Habits & Past Gym History",
    laggingPillars: [
      "Body Posture & Biomechanics Screen",
      "Gym Floor Habits & Technique",
      "Past Gym History & Commitment",
    ],
    diagnosisText:
      "Your intake indicates significant biomechanical friction, unlogged training, or nutritional leaks. Supervised 1-on-1 coaching will eliminate injury risk and guarantee 12-week body transformation.",
  },
};
