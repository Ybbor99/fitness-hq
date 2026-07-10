const {
  useState,
  useEffect,
  useRef
} = React;

// ---------- palette ----------
const C = {
  bg: "#0F1013",
  surface: "#17191E",
  surface2: "#1E2127",
  line: "#262A31",
  text: "#F2F3F5",
  muted: "#9BA1AB",
  faint: "#5C626C",
  blue: "#3D7BFF",
  green: "#2FBF71",
  orange: "#FF8A3D",
  purple: "#A06BFF",
  yellow: "#F5C144",
  gray: "#4A4F58",
  red: "#FF5D5D"
};
const STORAGE_KEY = "fitness-hq-v1";
const START_DATE = "2026-07-06"; // week 1 begins

// ---------- helpers ----------
const toKey = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const fromKey = k => {
  const [y, m, dd] = k.split("-").map(Number);
  return new Date(y, m - 1, dd);
};
const weekNum = d => {
  const start = fromKey(START_DATE);
  const diff = Math.floor((d - start) / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.floor(diff / 7) + 1);
};
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// cardio progression by program week
const cardioLevel = wk => {
  if (wk <= 2) return {
    incline: 6,
    mins: 20
  };
  if (wk <= 4) return {
    incline: 8,
    mins: 25
  };
  if (wk <= 6) return {
    incline: 10,
    mins: 30
  };
  return {
    incline: 12,
    mins: 30
  };
};
const rollerReps = wk => Math.min(5 + (wk - 1), 10);

// ---------- workout definitions ----------
const buildWorkouts = wk => {
  const cl = cardioLevel(wk);
  const rr = rollerReps(wk);
  return {
    push: {
      name: "Push Day",
      tag: "Chest focus",
      color: C.blue,
      time: "~35 min",
      exercises: [{
        g: "warmup",
        n: "Warm-up walk",
        d: "Treadmill · 5 min · flat, easy pace"
      }, {
        g: "pushup",
        n: "Push-up board — chest slots",
        d: "3 × 6–10 · knees down is the right start · rest 90s"
      }, {
        g: "pushup",
        n: "Slow-negative push-ups",
        d: "1 × 5 · lower for 3 full seconds · chest builder"
      }, {
        g: "pushup",
        n: "Push-up board — shoulder slots",
        d: "2 × 6–8 · rest 90s"
      }, {
        g: "press",
        n: "Dumbbell overhead press",
        d: "3 × 8 · 10–15 lbs per hand"
      }, {
        g: "squeeze",
        n: "Arm trainer squeeze",
        d: "3 × 10 · slow 2s in, 2s out · your pec machine"
      }, {
        g: "treadmill",
        n: "Finish: incline walk",
        d: `10 min · incline ${Math.min(cl.incline, 8)} · 3.0 mph`
      }]
    },
    legs: {
      name: "Legs + Pull",
      tag: "Lower body",
      color: C.green,
      time: "~35 min",
      exercises: [{
        g: "warmup",
        n: "Warm-up walk",
        d: "Treadmill · 5 min · flat, easy pace"
      }, {
        g: "squat",
        n: "Goblet squat",
        d: "3 × 10 · one dumbbell at chest · 15–20 lbs"
      }, {
        g: "lunge",
        n: "Reverse lunge",
        d: "2 × 8 per leg · bodyweight first"
      }, {
        g: "row",
        n: "One-arm dumbbell row",
        d: "3 × 10 per arm · 20–25 lbs · hand on chair"
      }, {
        g: "curl",
        n: "Dumbbell curls",
        d: "2 × 10 · 10–15 lbs · elbows pinned"
      }, {
        g: "treadmill",
        n: "Finish: easy walk",
        d: "10 min · flat · comfortable"
      }]
    },
    cardio: {
      name: "Cardio + Abs",
      tag: "Fat burner",
      color: C.orange,
      time: "~30 min",
      exercises: [{
        g: "treadmill",
        n: "Incline walk",
        d: `Incline ${cl.incline} · 3.0 mph · ${cl.mins} min · week ${wk} level`
      }, {
        g: "roller",
        n: "Ab roller (knees)",
        d: `2 × ${rr} · roll only while your back stays flat`
      }, {
        g: "stretch",
        n: "Stretch",
        d: "5 min · hamstrings + hip flexors"
      }]
    },
    full: {
      name: "Full Body",
      tag: "Biggest day",
      color: C.purple,
      time: "~40 min",
      exercises: [{
        g: "warmup",
        n: "Warm-up walk",
        d: "Treadmill · 5 min · easy"
      }, {
        g: "squat",
        n: "Goblet squat",
        d: "3 × 8 · a bit heavier than Thursday"
      }, {
        g: "pushup",
        n: "Push-up board circuit",
        d: "3 rounds · 3 slot colors · stop 2 shy of failure"
      }, {
        g: "row",
        n: "One-arm dumbbell row",
        d: "3 × 10 per arm"
      }, {
        g: "press",
        n: "Dumbbell overhead press",
        d: "2 × 8"
      }, {
        g: "roller",
        n: "Ab roller (knees)",
        d: `2 × ${rr}`
      }]
    },
    flex: {
      name: "Flex Day",
      tag: "Walk or recover",
      color: C.yellow,
      time: "~30 min",
      exercises: [{
        g: "treadmill",
        n: "Incline walk — or real rest",
        d: "Incline 6+ · 3.0 mph · 25–30 min. Rest counts too — tap done either way."
      }]
    },
    rest: {
      name: "Rest Day",
      tag: "Recovery",
      color: C.gray,
      time: "",
      exercises: []
    }
  };
};
const dayType = d => ["flex", "push", "rest", "rest", "legs", "cardio", "full"][d.getDay()];

// ---------- guides content ----------
const GUIDES = [{
  id: "chest",
  color: C.blue,
  title: "The chest game plan",
  body: ["Straight talk: nobody can burn fat off one spot — chest fat drops when overall body fat drops. Your treadmill sessions and food choices do that part.", "What training does: builds the pec muscle underneath, so as the fat comes off, the chest looks tighter and flatter instead of deflated.", "Your three chest builders: push-up board chest slots, slow-negative push-ups, and the arm trainer (that hydraulic squeeze is basically a pec fly machine).", "The real accelerator is consistency on Cardio + Abs days plus the incline finishers. Miss those and no amount of push-ups will show."]
}, {
  id: "pushup",
  g: "pushup",
  color: C.blue,
  title: "Push-ups on the board",
  body: ["Set the handles in the colored slots for the day (blue = chest).", "Hands under shoulders, body one straight line from head to knees or heels.", "Lower until elbows hit about 90°, press back up. Exhale on the way up.", "Knees-down is the correct novice version at your size — not a shortcut. Move to toes when 3×10 on knees feels easy.", "Slow negatives: take a full 3 seconds to lower, then knees down to press back up. Brutal for the chest in a good way.", "Mistake to avoid: sagging hips. Squeeze your butt to keep the line."]
}, {
  id: "squeeze",
  g: "squeeze",
  color: C.blue,
  title: "Arm trainer squeeze",
  body: ["Set the dial so rep 10 is genuinely hard (start around 3–4).", "Grip both handles at chest height, elbows slightly bent.", "Squeeze the handles together over 2 full seconds, then release over 2 seconds. No fast pumping.", "You should feel it in the chest, not the hands. If only your forearms burn, slow down and lighten the dial."]
}, {
  id: "squat",
  g: "squat",
  color: C.green,
  title: "Goblet squat",
  body: ["Hold one dumbbell vertically against your chest with both hands, like a heavy goblet.", "Feet shoulder-width, toes slightly out.", "Sit down and back like reaching for a chair. Go as deep as comfortable, chest up the whole way.", "Push through your whole foot to stand, squeeze at the top.", "Mistake to avoid: heels lifting. If they do, don't go as deep yet."]
}, {
  id: "lunge",
  g: "lunge",
  color: C.green,
  title: "Reverse lunge",
  body: ["Stand tall, step one foot straight back.", "Lower the back knee toward the floor until both knees are near 90°.", "Push through the front heel to stand back up.", "Holding a wall or chair for balance is completely fine while you learn.", "Add 10 lb dumbbells only when bodyweight 2×8 feels easy."]
}, {
  id: "row",
  g: "row",
  color: C.green,
  title: "One-arm dumbbell row",
  body: ["Put your free hand and same-side knee on a chair or bench. Back flat like a tabletop.", "Let the dumbbell hang, then pull it up to your hip — not your armpit.", "Lower slowly. All the work should feel in your upper back, not your arm.", "This balances all your pushing — skipping rows is how shoulders get cranky."]
}, {
  id: "press",
  g: "press",
  color: C.blue,
  title: "Overhead press",
  body: ["Dumbbells at shoulder height, palms facing forward or slightly in.", "Press straight up until arms are fully extended overhead.", "Lower with control back to shoulders.", "Mistake to avoid: arching the lower back. Squeeze your glutes and ribs down."]
}, {
  id: "curl",
  g: "curl",
  color: C.green,
  title: "Dumbbell curl",
  body: ["Elbows pinned to your sides — imagine they're glued there.", "Curl the weight up, squeeze, lower slowly.", "Mistake to avoid: swinging your body. If you have to swing, go lighter."]
}, {
  id: "roller",
  g: "roller",
  color: C.orange,
  title: "Ab roller",
  body: ["Kneel on the pad, wheels under your shoulders, arms straight.", "Roll forward slowly — only as far as you can keep your back flat. For most beginners that's 12–18 inches. That's plenty.", "Pull back using your abs, exhaling hard.", "If your lower back arches or aches, you rolled too far. Shorten it.", "Standing rollouts are months away. Ignore them completely."]
}, {
  id: "treadmill",
  g: "treadmill",
  color: C.orange,
  title: "The incline walk (your fat burner)",
  body: ["The target is the famous 12-3-30: incline 12, 3.0 mph, 30 minutes. You build to it — the app bumps your level every 2 weeks automatically.", "Pace check: breathing hard, but able to say a short sentence.", "Don't hold the rails — that erases half the work. Lower the incline instead if you need to.", "This burns more than most people's jogging, with zero knee pounding. It's the single fastest tool you own."]
}];

// ---------- pictograms ----------
const Picto = ({
  g,
  color
}) => {
  const s = {
    stroke: color,
    strokeWidth: 2.2,
    strokeLinecap: "round",
    fill: "none"
  };
  const head = (cx, cy) => /*#__PURE__*/React.createElement("circle", {
    cx: cx,
    cy: cy,
    r: 3.4,
    style: {
      ...s,
      fill: color
    }
  });
  let art = null;
  switch (g) {
    case "pushup":
      art = /*#__PURE__*/React.createElement(React.Fragment, null, head(10, 22), /*#__PURE__*/React.createElement("path", {
        d: "M14 24 L34 20 L44 22",
        style: s
      }), /*#__PURE__*/React.createElement("path", {
        d: "M18 24 L16 32 M30 21 L30 31",
        style: s
      }), /*#__PURE__*/React.createElement("path", {
        d: "M6 34 L46 34",
        style: {
          ...s,
          stroke: C.line
        }
      }));
      break;
    case "squat":
      art = /*#__PURE__*/React.createElement(React.Fragment, null, head(26, 8), /*#__PURE__*/React.createElement("path", {
        d: "M26 12 L26 24 M26 16 L21 21 L26 24",
        style: s
      }), /*#__PURE__*/React.createElement("path", {
        d: "M26 24 L19 30 L21 38 M26 24 L31 31 L29 38",
        style: s
      }), /*#__PURE__*/React.createElement("rect", {
        x: "20",
        y: "18",
        width: "6",
        height: "7",
        rx: "1.5",
        style: {
          ...s,
          strokeWidth: 1.8
        }
      }));
      break;
    case "lunge":
      art = /*#__PURE__*/React.createElement(React.Fragment, null, head(24, 8), /*#__PURE__*/React.createElement("path", {
        d: "M24 12 L24 24",
        style: s
      }), /*#__PURE__*/React.createElement("path", {
        d: "M24 24 L15 30 L15 38 M24 24 L33 30 L38 34",
        style: s
      }));
      break;
    case "row":
      art = /*#__PURE__*/React.createElement(React.Fragment, null, head(14, 14), /*#__PURE__*/React.createElement("path", {
        d: "M18 16 L34 20 L44 26",
        style: s
      }), /*#__PURE__*/React.createElement("path", {
        d: "M26 18 L26 28",
        style: s
      }), /*#__PURE__*/React.createElement("circle", {
        cx: "26",
        cy: "31",
        r: "3",
        style: {
          ...s,
          strokeWidth: 1.8
        }
      }), /*#__PURE__*/React.createElement("path", {
        d: "M34 20 L36 34 M42 26 L42 36",
        style: s
      }));
      break;
    case "press":
      art = /*#__PURE__*/React.createElement(React.Fragment, null, head(26, 14), /*#__PURE__*/React.createElement("path", {
        d: "M26 18 L26 32 M26 32 L20 40 M26 32 L32 40",
        style: s
      }), /*#__PURE__*/React.createElement("path", {
        d: "M26 20 L18 14 L18 7 M26 20 L34 14 L34 7",
        style: s
      }), /*#__PURE__*/React.createElement("path", {
        d: "M14 7 L22 7 M30 7 L38 7",
        style: {
          ...s,
          strokeWidth: 3
        }
      }));
      break;
    case "curl":
      art = /*#__PURE__*/React.createElement(React.Fragment, null, head(24, 9), /*#__PURE__*/React.createElement("path", {
        d: "M24 13 L24 30 M24 30 L19 40 M24 30 L29 40",
        style: s
      }), /*#__PURE__*/React.createElement("path", {
        d: "M24 16 L31 20 L31 12",
        style: s
      }), /*#__PURE__*/React.createElement("path", {
        d: "M27 12 L35 12",
        style: {
          ...s,
          strokeWidth: 3
        }
      }));
      break;
    case "roller":
      art = /*#__PURE__*/React.createElement(React.Fragment, null, head(13, 15), /*#__PURE__*/React.createElement("path", {
        d: "M16 18 L28 26 L38 28",
        style: s
      }), /*#__PURE__*/React.createElement("path", {
        d: "M20 21 L18 32 L24 34",
        style: s
      }), /*#__PURE__*/React.createElement("circle", {
        cx: "40",
        cy: "32",
        r: "4.5",
        style: {
          ...s,
          strokeWidth: 2
        }
      }));
      break;
    case "treadmill":
      art = /*#__PURE__*/React.createElement(React.Fragment, null, head(24, 8), /*#__PURE__*/React.createElement("path", {
        d: "M24 12 L26 22 M26 22 L20 30 M26 22 L32 28 L34 34",
        style: s
      }), /*#__PURE__*/React.createElement("path", {
        d: "M8 36 L44 22",
        style: {
          ...s,
          stroke: C.line,
          strokeWidth: 3
        }
      }));
      break;
    case "stretch":
      art = /*#__PURE__*/React.createElement(React.Fragment, null, head(20, 10), /*#__PURE__*/React.createElement("path", {
        d: "M20 14 L24 26 L14 34 M24 26 L36 30",
        style: s
      }), /*#__PURE__*/React.createElement("path", {
        d: "M20 14 L10 20",
        style: s
      }));
      break;
    default:
      // warmup
      art = /*#__PURE__*/React.createElement(React.Fragment, null, head(26, 9), /*#__PURE__*/React.createElement("path", {
        d: "M26 13 L26 25 M26 25 L20 36 M26 25 L32 36 M26 16 L19 22 M26 16 L33 20",
        style: s
      }));
  }
  return /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 52 44",
    width: "44",
    height: "38",
    "aria-hidden": "true"
  }, art);
};

// ---------- storage (localStorage - lives on this device) ----------
const loadData = async () => {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v) return {
      data: JSON.parse(v),
      found: true,
      ok: true
    };
    localStorage.setItem(STORAGE_KEY + ':probe', 'ok');
    return {
      data: {
        completions: {},
        weighins: []
      },
      found: false,
      ok: true
    };
  } catch (e) {
    return {
      data: {
        completions: {},
        weighins: []
      },
      found: false,
      ok: false
    };
  }
};
const saveData = async data => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    return false;
  }
};

// ---------- streak ----------
const calcStreak = completions => {
  let streak = 0;
  const d = new Date();
  // today counts if done; otherwise start from yesterday without breaking
  if (!(completions[toKey(d)] && completions[toKey(d)].done)) d.setDate(d.getDate() - 1);
  for (let i = 0; i < 400; i++) {
    const t = dayType(d);
    const k = toKey(d);
    if (t === "rest") {
      d.setDate(d.getDate() - 1);
      continue; // Tue/Wed never break a streak
    }
    if (completions[k] && completions[k].done) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else break;
  }
  return streak;
};

// ---------- small ui bits ----------
const Chip = ({
  children,
  color
}) => /*#__PURE__*/React.createElement("span", {
  className: "text-xs font-semibold px-2.5 py-1 rounded-full",
  style: {
    background: color + "22",
    color
  }
}, children);
const Ring = ({
  pct,
  color
}) => {
  const r = 17;
  const c = 2 * Math.PI * r;
  return /*#__PURE__*/React.createElement("svg", {
    width: "44",
    height: "44",
    viewBox: "0 0 44 44"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "22",
    cy: "22",
    r: r,
    stroke: C.line,
    strokeWidth: "4",
    fill: "none"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "22",
    cy: "22",
    r: r,
    stroke: color,
    strokeWidth: "4",
    fill: "none",
    strokeDasharray: c,
    strokeDashoffset: c * (1 - pct),
    strokeLinecap: "round",
    transform: "rotate(-90 22 22)",
    style: {
      transition: "stroke-dashoffset .35s ease"
    }
  }), /*#__PURE__*/React.createElement("text", {
    x: "22",
    y: "26",
    textAnchor: "middle",
    fontSize: "11",
    fontWeight: "700",
    fill: C.text
  }, Math.round(pct * 100)));
};

// ---------- rest timer ----------
const RestTimer = ({
  color
}) => {
  const [left, setLeft] = useState(0);
  const ref = useRef(null);
  useEffect(() => () => clearInterval(ref.current), []);
  const start = () => {
    clearInterval(ref.current);
    setLeft(90);
    ref.current = setInterval(() => {
      setLeft(p => {
        if (p <= 1) {
          clearInterval(ref.current);
          return 0;
        }
        return p - 1;
      });
    }, 1000);
  };
  return /*#__PURE__*/React.createElement("button", {
    onClick: start,
    className: "flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-bold",
    style: {
      background: left > 0 ? color : C.surface2,
      color: left > 0 ? "#0F1013" : C.muted,
      border: `1px solid ${left > 0 ? color : C.line}`,
      minWidth: 96,
      justifyContent: "center",
      transition: "all .2s"
    }
  }, left > 0 ? `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}` : "Rest 90s");
};

// ================= APP =================
function App() {
  const [tab, setTab] = useState("today");
  const [data, setData] = useState(null);
  const [wInput, setWInput] = useState("");
  const [openGuide, setOpenGuide] = useState("chest");
  const [justFinished, setJustFinished] = useState(false);
  const [openHelp, setOpenHelp] = useState(null);
  const [saveState, setSaveState] = useState("idle");
  const [storageInfo, setStorageInfo] = useState(null);
  useEffect(() => {
    loadData().then(({
      data,
      found,
      ok
    }) => {
      setData(data);
      setStorageInfo({
        found,
        ok
      });
    });
  }, []);
  if (!data) return /*#__PURE__*/React.createElement("div", {
    className: "min-h-screen flex items-center justify-center",
    style: {
      background: C.bg,
      color: C.muted
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-sm font-semibold tracking-widest uppercase"
  }, "Loading your gym\u2026"));
  const persist = next => {
    const stamped = {
      ...next,
      _saved: new Date().toISOString()
    };
    setData(stamped);
    setSaveState("saving");
    saveData(stamped).then(ok => setSaveState(ok ? "saved" : "error"));
  };
  const today = new Date();
  const tKey = toKey(today);
  const wk = weekNum(today);
  const W = buildWorkouts(wk);
  const type = dayType(today);
  const workout = W[type];
  const comp = data.completions[tKey] || {
    items: {},
    done: false,
    feel: null
  };
  const checkedCount = workout.exercises.filter((_, i) => comp.items[i]).length;
  const pct = workout.exercises.length ? checkedCount / workout.exercises.length : 0;
  const streak = calcStreak(data.completions);
  const toggleItem = i => {
    const items = {
      ...comp.items,
      [i]: !comp.items[i]
    };
    persist({
      ...data,
      completions: {
        ...data.completions,
        [tKey]: {
          ...comp,
          items
        }
      }
    });
  };
  const finish = feel => {
    persist({
      ...data,
      completions: {
        ...data.completions,
        [tKey]: {
          ...comp,
          done: true,
          feel
        }
      }
    });
    setJustFinished(true);
    setTimeout(() => setJustFinished(false), 2400);
  };
  const unfinish = () => {
    persist({
      ...data,
      completions: {
        ...data.completions,
        [tKey]: {
          ...comp,
          done: false,
          feel: null
        }
      }
    });
  };
  const addWeighIn = () => {
    const v = parseFloat(wInput);
    if (!v || v < 60 || v > 700) return;
    const list = data.weighins.filter(w => w.d !== tKey);
    list.push({
      d: tKey,
      w: v
    });
    list.sort((a, b) => a.d < b.d ? -1 : 1);
    persist({
      ...data,
      weighins: list
    });
    setWInput("");
  };
  const deleteWeighIn = d => persist({
    ...data,
    weighins: data.weighins.filter(w => w.d !== d)
  });

  // ------- screens -------
  const TodayScreen = () => /*#__PURE__*/React.createElement("div", {
    className: "px-4 pb-28 pt-5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-start justify-between mb-5"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "text-xs font-bold tracking-widest uppercase",
    style: {
      color: C.faint
    }
  }, DAY_NAMES[today.getDay()], " \xB7 ", MONTHS[today.getMonth()], " ", today.getDate(), " \xB7 week ", wk, " \xB7 v2.0"), /*#__PURE__*/React.createElement("h1", {
    className: "text-3xl font-extrabold mt-1",
    style: {
      color: C.text,
      fontFamily: "ui-rounded, -apple-system, system-ui, sans-serif"
    }
  }, workout.name), /*#__PURE__*/React.createElement("div", {
    className: "mt-2 flex gap-2 items-center"
  }, /*#__PURE__*/React.createElement(Chip, {
    color: workout.color
  }, workout.tag), workout.time && /*#__PURE__*/React.createElement("span", {
    className: "text-xs font-semibold",
    style: {
      color: C.muted
    }
  }, workout.time))), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col items-center gap-1"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-14 h-14 rounded-2xl flex flex-col items-center justify-center",
    style: {
      background: streak > 0 ? "linear-gradient(140deg,#FF8A3D,#FF5D5D)" : C.surface,
      border: `1px solid ${streak > 0 ? "transparent" : C.line}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-xl font-extrabold",
    style: {
      color: streak > 0 ? "#0F1013" : C.faint
    }
  }, streak)), /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] font-bold tracking-widest uppercase",
    style: {
      color: C.faint
    }
  }, "streak"))), type === "rest" ? /*#__PURE__*/React.createElement("div", {
    className: "rounded-3xl p-6 text-center",
    style: {
      background: C.surface,
      border: `1px solid ${C.line}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-4xl mb-3"
  }, "\uD83D\uDE34"), /*#__PURE__*/React.createElement("div", {
    className: "text-lg font-bold",
    style: {
      color: C.text
    }
  }, "Scheduled rest \u2014 travel days"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm mt-2 leading-relaxed",
    style: {
      color: C.muted
    }
  }, "Muscle is built on the days you don't train. Walking on the road still counts as a bonus, but nothing is required today. Your streak is safe.")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between rounded-2xl px-4 py-3 mb-3",
    style: {
      background: C.surface,
      border: `1px solid ${C.line}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3"
  }, /*#__PURE__*/React.createElement(Ring, {
    pct: pct,
    color: workout.color
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "text-sm font-bold",
    style: {
      color: C.text
    }
  }, checkedCount, " of ", workout.exercises.length, " done"), /*#__PURE__*/React.createElement("div", {
    className: "text-xs",
    style: {
      color: C.muted
    }
  }, "tap each exercise as you finish it"))), /*#__PURE__*/React.createElement(RestTimer, {
    color: workout.color
  })), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col gap-2.5"
  }, workout.exercises.map((ex, i) => {
    const on = !!comp.items[i];
    const guide = GUIDES.find(x => x.g === ex.g);
    const helpOpen = openHelp === i;
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      className: "rounded-2xl overflow-hidden",
      style: {
        background: on ? workout.color + "16" : C.surface,
        border: `1px solid ${helpOpen ? workout.color : on ? workout.color + "66" : C.line}`,
        transition: "all .18s"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-3 px-3.5 py-3"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => toggleItem(i),
      className: "flex items-center gap-3 flex-1 min-w-0 text-left"
    }, /*#__PURE__*/React.createElement("div", {
      className: "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0",
      style: {
        background: on ? workout.color : "transparent",
        border: `2px solid ${on ? workout.color : C.faint}`,
        transition: "all .18s"
      }
    }, on && /*#__PURE__*/React.createElement("svg", {
      width: "14",
      height: "14",
      viewBox: "0 0 14 14"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M2.5 7.5 L5.8 10.5 L11.5 3.5",
      stroke: "#0F1013",
      strokeWidth: "2.4",
      fill: "none",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }))), /*#__PURE__*/React.createElement("div", {
      className: "flex-1 min-w-0"
    }, /*#__PURE__*/React.createElement("div", {
      className: "font-bold text-[15px]",
      style: {
        color: on ? C.muted : C.text,
        textDecoration: on ? "line-through" : "none"
      }
    }, ex.n), /*#__PURE__*/React.createElement("div", {
      className: "text-xs mt-0.5",
      style: {
        color: C.faint
      }
    }, ex.d))), /*#__PURE__*/React.createElement("button", {
      onClick: () => setOpenHelp(helpOpen ? null : i),
      "aria-label": "How to do this exercise",
      className: "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-extrabold text-sm",
      style: {
        background: helpOpen ? workout.color : C.surface2,
        color: helpOpen ? "#0F1013" : C.muted,
        border: `1px solid ${helpOpen ? workout.color : C.line}`,
        transition: "all .18s"
      }
    }, "?")), helpOpen && /*#__PURE__*/React.createElement("div", {
      className: "px-4 pb-4",
      style: {
        borderTop: `1px solid ${C.line}`
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-3 py-2.5"
    }, /*#__PURE__*/React.createElement(Picto, {
      g: ex.g,
      color: workout.color
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "text-[11px] font-bold tracking-widest uppercase",
      style: {
        color: C.faint
      }
    }, "your target"), /*#__PURE__*/React.createElement("div", {
      className: "text-sm font-extrabold",
      style: {
        color: workout.color
      }
    }, ex.d))), (guide ? guide.body : ["Nice and easy — this one is just about moving. Nothing to overthink."]).map((line, j) => /*#__PURE__*/React.createElement("div", {
      key: j,
      className: "flex gap-2.5 mb-2"
    }, /*#__PURE__*/React.createElement("div", {
      className: "mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0",
      style: {
        background: workout.color
      }
    }), /*#__PURE__*/React.createElement("p", {
      className: "text-sm leading-relaxed",
      style: {
        color: C.muted
      }
    }, line)))));
  })), /*#__PURE__*/React.createElement("div", {
    className: "mt-5"
  }, comp.done ? /*#__PURE__*/React.createElement("div", {
    className: "rounded-2xl p-4 text-center",
    style: {
      background: workout.color + "1A",
      border: `1px solid ${workout.color}66`
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-lg font-extrabold",
    style: {
      color: workout.color
    }
  }, justFinished ? "🔥 Workout logged!" : `Done for today ${comp.feel || "💪"}`), /*#__PURE__*/React.createElement("div", {
    className: "text-xs mt-1",
    style: {
      color: C.muted
    }
  }, streak, " day streak \xB7 see it on the Plan tab"), /*#__PURE__*/React.createElement("button", {
    onClick: unfinish,
    className: "text-xs mt-2 font-semibold underline",
    style: {
      color: C.faint
    }
  }, "undo")) : /*#__PURE__*/React.createElement("div", {
    className: "rounded-2xl p-4",
    style: {
      background: C.surface,
      border: `1px solid ${C.line}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-sm font-bold mb-3 text-center",
    style: {
      color: C.text
    }
  }, "Finish workout \u2014 how'd it feel?"), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-2"
  }, [["😩", "Rough"], ["😐", "OK"], ["💪", "Strong"]].map(([e, label]) => /*#__PURE__*/React.createElement("button", {
    key: label,
    onClick: () => finish(e),
    className: "flex-1 rounded-xl py-3 font-bold text-sm",
    style: {
      background: C.surface2,
      border: `1px solid ${C.line}`,
      color: C.text
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-xl"
  }, e), label))), /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] text-center mt-2.5",
    style: {
      color: C.faint
    }
  }, "Half a workout still counts. Zero is the only failure.")))));
  const PlanScreen = () => {
    // build last 5 weeks grid (Mon-first)
    const rows = [];
    const cursor = new Date();
    cursor.setDate(cursor.getDate() - (cursor.getDay() + 6) % 7); // this week's Monday
    cursor.setDate(cursor.getDate() - 28);
    for (let r = 0; r < 5; r++) {
      const row = [];
      for (let c = 0; c < 7; c++) {
        row.push(new Date(cursor));
        cursor.setDate(cursor.getDate() + 1);
      }
      rows.push(row);
    }
    const pattern = [["Mon", "push", "Push Day · chest focus"], ["Tue", "rest", "Rest / travel"], ["Wed", "rest", "Rest / travel"], ["Thu", "legs", "Legs + Pull"], ["Fri", "cardio", "Cardio + Abs · weigh-in AM"], ["Sat", "full", "Full Body"], ["Sun", "flex", "Flex — walk or recover"]];
    return /*#__PURE__*/React.createElement("div", {
      className: "px-4 pb-28 pt-5"
    }, /*#__PURE__*/React.createElement("h1", {
      className: "text-3xl font-extrabold mb-1",
      style: {
        color: C.text,
        fontFamily: "ui-rounded, -apple-system, system-ui, sans-serif"
      }
    }, "The Plan"), /*#__PURE__*/React.createElement("div", {
      className: "text-xs font-bold tracking-widest uppercase mb-4",
      style: {
        color: C.faint
      }
    }, "program week ", wk, " \xB7 levels rise every 2 weeks"), /*#__PURE__*/React.createElement("div", {
      className: "rounded-3xl p-4 mb-4",
      style: {
        background: C.surface,
        border: `1px solid ${C.line}`
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-sm font-bold mb-3",
      style: {
        color: C.text
      }
    }, "Your board \u2014 every workout fills a slot"), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-7 gap-1 mb-2"
    }, ["M", "T", "W", "T", "F", "S", "S"].map((d, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      className: "text-center text-[10px] font-bold",
      style: {
        color: C.faint
      }
    }, d))), rows.map((row, ri) => /*#__PURE__*/React.createElement("div", {
      key: ri,
      className: "grid grid-cols-7 gap-1 mb-1"
    }, row.map((d, ci) => {
      const k = toKey(d);
      const t = dayType(d);
      const done = data.completions[k] && data.completions[k].done;
      const isToday = k === tKey;
      const future = d > today && !isToday;
      const col = W[t].color;
      return /*#__PURE__*/React.createElement("div", {
        key: ci,
        className: "flex items-center justify-center",
        style: {
          height: 34
        }
      }, /*#__PURE__*/React.createElement("div", {
        className: "rounded-full flex items-center justify-center text-[10px] font-bold",
        style: {
          width: 28,
          height: 28,
          background: done ? col : "transparent",
          border: `2px solid ${isToday ? C.text : done ? col : t === "rest" ? C.line : future ? C.line : col + "55"}`,
          color: done ? "#0F1013" : C.faint,
          opacity: t === "rest" && !done ? 0.4 : 1
        }
      }, d.getDate()));
    }))), /*#__PURE__*/React.createElement("div", {
      className: "text-[11px] mt-2",
      style: {
        color: C.faint
      }
    }, "Filled = workout done \xB7 outlined = scheduled \xB7 faint = rest day")), /*#__PURE__*/React.createElement("div", {
      className: "rounded-3xl p-4",
      style: {
        background: C.surface,
        border: `1px solid ${C.line}`
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-sm font-bold mb-3",
      style: {
        color: C.text
      }
    }, "Every week, same rhythm"), /*#__PURE__*/React.createElement("div", {
      className: "flex flex-col gap-2"
    }, pattern.map(([d, t, label]) => /*#__PURE__*/React.createElement("div", {
      key: d,
      className: "flex items-center gap-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: "w-10 text-xs font-extrabold",
      style: {
        color: t === "rest" ? C.faint : W[t].color
      }
    }, d), /*#__PURE__*/React.createElement("div", {
      className: "w-2.5 h-2.5 rounded-full",
      style: {
        background: t === "rest" ? C.line : W[t].color
      }
    }), /*#__PURE__*/React.createElement("div", {
      className: "text-sm font-medium",
      style: {
        color: t === "rest" ? C.faint : C.text
      }
    }, label)))), /*#__PURE__*/React.createElement("div", {
      className: "text-[11px] mt-3 leading-relaxed",
      style: {
        color: C.faint
      }
    }, "Progression is automatic: cardio incline and ab-roller reps step up every 2 weeks. When the top of a rep range feels easy twice in a row, add 5 lbs.")));
  };
  const GuidesScreen = () => /*#__PURE__*/React.createElement("div", {
    className: "px-4 pb-28 pt-5"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "text-3xl font-extrabold mb-1",
    style: {
      color: C.text,
      fontFamily: "ui-rounded, -apple-system, system-ui, sans-serif"
    }
  }, "How-To Guides"), /*#__PURE__*/React.createElement("div", {
    className: "text-xs font-bold tracking-widest uppercase mb-4",
    style: {
      color: C.faint
    }
  }, "every move, step by step"), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col gap-2.5"
  }, GUIDES.map(g => {
    const open = openGuide === g.id;
    return /*#__PURE__*/React.createElement("div", {
      key: g.id,
      className: "rounded-2xl overflow-hidden",
      style: {
        background: C.surface,
        border: `1px solid ${open ? g.color + "66" : C.line}`
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setOpenGuide(open ? null : g.id),
      className: "w-full flex items-center gap-3 px-4 py-3.5 text-left"
    }, g.g ? /*#__PURE__*/React.createElement(Picto, {
      g: g.g,
      color: g.color
    }) : /*#__PURE__*/React.createElement("div", {
      className: "text-2xl",
      style: {
        width: 44,
        textAlign: "center"
      }
    }, "\uD83C\uDFAF"), /*#__PURE__*/React.createElement("div", {
      className: "flex-1 font-bold text-[15px]",
      style: {
        color: C.text
      }
    }, g.title), /*#__PURE__*/React.createElement("div", {
      className: "text-lg font-bold",
      style: {
        color: C.faint,
        transform: open ? "rotate(45deg)" : "none",
        transition: "transform .2s"
      }
    }, "+")), open && /*#__PURE__*/React.createElement("div", {
      className: "px-4 pb-4"
    }, g.body.map((line, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      className: "flex gap-2.5 mb-2"
    }, /*#__PURE__*/React.createElement("div", {
      className: "mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0",
      style: {
        background: g.color
      }
    }), /*#__PURE__*/React.createElement("p", {
      className: "text-sm leading-relaxed",
      style: {
        color: C.muted
      }
    }, line)))));
  })));
  const WeightScreen = () => {
    const ws = data.weighins;
    const cur = ws.length ? ws[ws.length - 1].w : null;
    const first = ws.length ? ws[0].w : null;
    const delta = ws.length > 1 ? cur - first : 0;
    // chart
    const cw = 320,
      ch = 150,
      pad = 26;
    let path = "",
      pts = [];
    if (ws.length >= 2) {
      const min = Math.min(...ws.map(w => w.w)) - 2;
      const max = Math.max(...ws.map(w => w.w)) + 2;
      pts = ws.map((w, i) => ({
        x: pad + i / (ws.length - 1) * (cw - pad * 2),
        y: ch - pad - (w.w - min) / (max - min) * (ch - pad * 2),
        w: w.w
      }));
      path = pts.map((p, i) => `${i ? "L" : "M"}${p.x},${p.y}`).join(" ");
    }
    return /*#__PURE__*/React.createElement("div", {
      className: "px-4 pb-28 pt-5"
    }, /*#__PURE__*/React.createElement("h1", {
      className: "text-3xl font-extrabold mb-1",
      style: {
        color: C.text,
        fontFamily: "ui-rounded, -apple-system, system-ui, sans-serif"
      }
    }, "Weight"), /*#__PURE__*/React.createElement("div", {
      className: "text-xs font-bold tracking-widest uppercase mb-4",
      style: {
        color: C.faint
      }
    }, "friday mornings \xB7 judge the month, not the day"), /*#__PURE__*/React.createElement("div", {
      className: "flex gap-2 mb-4"
    }, /*#__PURE__*/React.createElement("input", {
      type: "number",
      inputMode: "decimal",
      placeholder: "Today's weight (lbs)",
      value: wInput,
      onChange: e => setWInput(e.target.value),
      className: "flex-1 rounded-2xl px-4 py-3.5 text-base font-semibold outline-none",
      style: {
        background: C.surface,
        border: `1px solid ${C.line}`,
        color: C.text
      }
    }), /*#__PURE__*/React.createElement("button", {
      onClick: addWeighIn,
      className: "rounded-2xl px-5 font-extrabold text-sm",
      style: {
        background: C.orange,
        color: "#0F1013"
      }
    }, "Log it")), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-3 gap-2 mb-4"
    }, [["Start", first ? `${first}` : "—"], ["Now", cur ? `${cur}` : "—"], ["Change", ws.length > 1 ? `${delta > 0 ? "+" : ""}${delta.toFixed(1)}` : "—"]].map(([label, val], i) => /*#__PURE__*/React.createElement("div", {
      key: label,
      className: "rounded-2xl p-3 text-center",
      style: {
        background: C.surface,
        border: `1px solid ${C.line}`
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-xl font-extrabold",
      style: {
        color: i === 2 && ws.length > 1 ? delta <= 0 ? C.green : C.orange : C.text
      }
    }, val), /*#__PURE__*/React.createElement("div", {
      className: "text-[10px] font-bold tracking-widest uppercase mt-0.5",
      style: {
        color: C.faint
      }
    }, label)))), /*#__PURE__*/React.createElement("div", {
      className: "rounded-3xl p-4 mb-4",
      style: {
        background: C.surface,
        border: `1px solid ${C.line}`
      }
    }, ws.length < 2 ? /*#__PURE__*/React.createElement("div", {
      className: "text-center py-8"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-3xl mb-2"
    }, "\uD83D\uDCC9"), /*#__PURE__*/React.createElement("div", {
      className: "text-sm font-bold",
      style: {
        color: C.text
      }
    }, "Your trend line starts at 2 weigh-ins"), /*#__PURE__*/React.createElement("div", {
      className: "text-xs mt-1",
      style: {
        color: C.faint
      }
    }, "Log Fridays and watch this fill in. Boring for 2 weeks, addicting by week 6.")) : /*#__PURE__*/React.createElement("svg", {
      viewBox: `0 0 ${cw} ${ch}`,
      className: "w-full"
    }, /*#__PURE__*/React.createElement("path", {
      d: path,
      stroke: C.orange,
      strokeWidth: "2.5",
      fill: "none",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }), pts.map((p, i) => /*#__PURE__*/React.createElement("g", {
      key: i
    }, /*#__PURE__*/React.createElement("circle", {
      cx: p.x,
      cy: p.y,
      r: "4",
      fill: C.orange
    }), (i === 0 || i === pts.length - 1) && /*#__PURE__*/React.createElement("text", {
      x: p.x,
      y: p.y - 9,
      textAnchor: "middle",
      fontSize: "11",
      fontWeight: "700",
      fill: C.text
    }, p.w))))), ws.length > 0 && /*#__PURE__*/React.createElement("div", {
      className: "rounded-3xl overflow-hidden",
      style: {
        background: C.surface,
        border: `1px solid ${C.line}`
      }
    }, [...ws].reverse().map(w => {
      const d = fromKey(w.d);
      return /*#__PURE__*/React.createElement("div", {
        key: w.d,
        className: "flex items-center justify-between px-4 py-3",
        style: {
          borderBottom: `1px solid ${C.line}`
        }
      }, /*#__PURE__*/React.createElement("div", {
        className: "text-sm font-semibold",
        style: {
          color: C.muted
        }
      }, DAY_NAMES[d.getDay()].slice(0, 3), ", ", MONTHS[d.getMonth()], " ", d.getDate()), /*#__PURE__*/React.createElement("div", {
        className: "flex items-center gap-3"
      }, /*#__PURE__*/React.createElement("div", {
        className: "text-sm font-extrabold",
        style: {
          color: C.text
        }
      }, w.w, " lbs"), /*#__PURE__*/React.createElement("button", {
        onClick: () => deleteWeighIn(w.d),
        className: "text-xs font-bold",
        style: {
          color: C.faint
        }
      }, "\u2715")));
    })), /*#__PURE__*/React.createElement("div", {
      className: "text-[11px] mt-4 text-center",
      style: {
        color: C.faint
      }
    }, "Storage ", storageInfo && storageInfo.ok === false ? "⚠️ unavailable" : "working", " \xB7 this launch:", " ", storageInfo && storageInfo.found ? `restored save${data._saved ? " from " + new Date(data._saved).toLocaleString() : ""}` : "no previous save found"));
  };
  const tabs = [["today", "Today", "🏋️"], ["plan", "Plan", "🗓️"], ["guides", "Guides", "📖"], ["weight", "Weight", "⚖️"]];
  return /*#__PURE__*/React.createElement("div", {
    className: "min-h-screen",
    style: {
      background: C.bg,
      fontFamily: "-apple-system, system-ui, 'Segoe UI', sans-serif"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "mx-auto",
    style: {
      maxWidth: 440
    }
  }, tab === "today" && TodayScreen(), tab === "plan" && PlanScreen(), tab === "guides" && GuidesScreen(), tab === "weight" && WeightScreen()), storageInfo && !storageInfo.ok && /*#__PURE__*/React.createElement("div", {
    className: "fixed left-0 right-0 px-4",
    style: {
      bottom: 76,
      zIndex: 21
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "mx-auto rounded-2xl px-4 py-3 text-sm font-bold text-center",
    style: {
      maxWidth: 440,
      background: C.red,
      color: "#0F1013"
    }
  }, "\u26A0\uFE0F Storage unavailable in this view \u2014 nothing will save. Tell Claude you see this.")), saveState === "error" && /*#__PURE__*/React.createElement("div", {
    className: "fixed left-0 right-0 px-4",
    style: {
      bottom: 76,
      zIndex: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "mx-auto rounded-2xl px-4 py-3 text-sm font-bold text-center",
    style: {
      maxWidth: 440,
      background: C.red,
      color: "#0F1013"
    }
  }, "\u26A0\uFE0F Couldn't save. You may be in an old copy \u2014 open the newest app card in the chat.")), saveState === "saved" && /*#__PURE__*/React.createElement("div", {
    className: "fixed right-4 pointer-events-none",
    style: {
      bottom: 82,
      zIndex: 20
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-[11px] font-bold px-2.5 py-1 rounded-full",
    style: {
      background: C.green + "22",
      color: C.green
    }
  }, "Saved \u2713")), /*#__PURE__*/React.createElement("div", {
    className: "fixed bottom-0 left-0 right-0",
    style: {
      background: "rgba(15,16,19,.92)",
      backdropFilter: "blur(14px)",
      borderTop: `1px solid ${C.line}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "mx-auto flex",
    style: {
      maxWidth: 440
    }
  }, tabs.map(([id, label, icon]) => /*#__PURE__*/React.createElement("button", {
    key: id,
    onClick: () => setTab(id),
    className: "flex-1 flex flex-col items-center gap-0.5 py-2.5 pb-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-xl",
    style: {
      filter: tab === id ? "none" : "grayscale(1) opacity(.45)"
    }
  }, icon), /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] font-bold tracking-wide",
    style: {
      color: tab === id ? C.text : C.faint
    }
  }, label))))));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App, null));