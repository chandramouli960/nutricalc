const MACRO_KCAL_PER_GRAM = {
  carb: 4,
  protein: 4,
  fat: 9,
  alcohol: 7,
};

const FOOD_MACROS = {
  /* Indian staples */
  rice_cup_cooked: {
    label: "Rice (cooked) – 1 katori / 1 cup",
    carbs: 45,
    protein: 4,
    fat: 0.4,
  },
  roti_one: {
    label: "Roti / Chapati – 1 medium (35 g)",
    carbs: 18,
    protein: 3,
    fat: 2,
  },
  dal_cup_cooked: {
    label: "Dal (cooked) – 1 katori / 1 cup",
    carbs: 18,
    protein: 8,
    fat: 1,
  },
  idli_one: {
    label: "Idli – 1 piece (50 g)",
    carbs: 12,
    protein: 2,
    fat: 0.5,
  },
  dosa_one: {
    label: "Dosa – 1 medium",
    carbs: 28,
    protein: 4,
    fat: 4,
  },
  curd_100g: {
    label: "Curd / Dahi – 100 g",
    carbs: 4,
    protein: 4,
    fat: 4,
  },
  ghee_tbsp: {
    label: "Ghee – 1 tbsp (~14 g)",
    carbs: 0,
    protein: 0,
    fat: 14,
  },
  paneer_100g: {
    label: "Paneer – 100 g",
    carbs: 4,
    protein: 18,
    fat: 22,
  },
  /* Oils & common */
  mustard_oil_tbsp: {
    label: "Mustard oil – 1 tbsp",
    carbs: 0,
    protein: 0,
    fat: 14,
  },
  olive_oil_tbsp: {
    label: "Olive oil – 1 tbsp",
    carbs: 0,
    protein: 0,
    fat: 13.5,
  },
  butter_tbsp: {
    label: "Butter – 1 tbsp",
    carbs: 0,
    protein: 0.1,
    fat: 11.5,
  },
  chicken_100g_cooked: {
    label: "Chicken – 100 g cooked",
    carbs: 0,
    protein: 31,
    fat: 3.6,
  },
  almonds_28g: {
    label: "Almonds / Badam – 28 g",
    carbs: 6,
    protein: 6,
    fat: 14,
  },
};

const roundTo = (value, digits = 1) => {
  const factor = 10 ** digits;
  return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
};

const safeNumber = (value) => {
  const num = typeof value === "number" ? value : parseFloat(String(value));
  return Number.isFinite(num) ? num : 0;
};

const BmiModule = (() => {
  const systemEl = document.querySelector("#bmi-system");
  const weightKgEl = document.querySelector("#bmi-weight-kg");
  const heightCmEl = document.querySelector("#bmi-height-cm");
  const weightLbEl = document.querySelector("#bmi-weight-lb");
  const heightFtEl = document.querySelector("#bmi-height-ft");
  const heightInEl = document.querySelector("#bmi-height-in");
  const formEl = document.querySelector("#bmi-form");
  const bmiValueEl = document.querySelector("#bmi-value");
  const bmiCategoryEl = document.querySelector("#bmi-category");
  const ibwEl = document.querySelector("#bmi-ibw");
  const activityEl = document.querySelector("#energy-activity");
  const calValueEl = document.querySelector("#bmi-cal-value");
  const recCarbKcalEl = document.querySelector("#rec-carb-kcal");
  const recCarbGEl = document.querySelector("#rec-carb-g");
  const recProteinKcalEl = document.querySelector("#rec-protein-kcal");
  const recProteinGEl = document.querySelector("#rec-protein-g");
  const recFatKcalEl = document.querySelector("#rec-fat-kcal");
  const recFatGEl = document.querySelector("#rec-fat-g");

  const IBW_MULTIPLIER = { sedentary: 25, moderate: 30, heavy: 35 };
  const MACRO_SPLIT = { carbs: 0.6, protein: 0.2, fat: 0.2 };
  const KCAL_PER_G = { carbs: 4, protein: 4, fat: 9 };

  const systemSections = {
    metric: document.querySelectorAll("[data-metric-only]"),
    imperial: document.querySelectorAll("[data-imperial-only]"),
  };

  /** Indian/Asian BMI cutoffs: Normal 18.5–22.9, Overweight 23–24.9, Obese ≥25 */
  const getBmiCategory = (bmi) => {
    if (!Number.isFinite(bmi) || bmi <= 0) {
      return { label: "Category: –", className: "" };
    }
    if (bmi < 18.5) {
      return { label: "Category: Underweight", className: "bmi-category-under" };
    }
    if (bmi < 23) {
      return { label: "Category: Normal", className: "bmi-category-normal" };
    }
    if (bmi < 25) {
      return { label: "Category: Overweight", className: "bmi-category-over" };
    }
    return { label: "Category: Obese", className: "bmi-category-obese" };
  };

  const updateVisibility = () => {
    const mode = systemEl.value === "imperial" ? "imperial" : "metric";

    systemSections.metric.forEach((el) => {
      el.style.display = mode === "metric" ? "" : "none";
    });
    systemSections.imperial.forEach((el) => {
      el.style.display = mode === "imperial" ? "" : "none";
    });
  };

  const calculateBmi = () => {
    const mode = systemEl.value === "imperial" ? "imperial" : "metric";
    let weightKg;
    let heightM;

    if (mode === "metric") {
      const kg = safeNumber(weightKgEl.value);
      const cm = safeNumber(heightCmEl.value);
      weightKg = kg;
      heightM = cm / 100;
    } else {
      const lb = safeNumber(weightLbEl.value);
      const ft = safeNumber(heightFtEl.value);
      const inch = safeNumber(heightInEl.value);
      weightKg = lb * 0.45359237;
      const totalInches = ft * 12 + inch;
      heightM = totalInches * 0.0254;
    }

    if (!weightKg || !heightM) {
      return NaN;
    }
    return weightKg / (heightM * heightM);
  };

  /** Get height in metres from current form (metric or imperial). Returns NaN if invalid. */
  const getHeightM = () => {
    const mode = systemEl.value === "imperial" ? "imperial" : "metric";
    if (mode === "metric") {
      const cm = safeNumber(heightCmEl.value);
      return cm > 0 ? cm / 100 : NaN;
    }
    const ft = safeNumber(heightFtEl.value);
    const inch = safeNumber(heightInEl.value);
    const totalInches = ft * 12 + inch;
    return totalInches > 0 ? totalInches * 0.0254 : NaN;
  };

  /** IBW = height (m)² × 22 */
  const ibwKg = (heightM) => {
    if (!Number.isFinite(heightM) || heightM <= 0) return NaN;
    return heightM * heightM * 22;
  };

  const render = () => {
    const heightM = getHeightM();
    const hasHeight = Number.isFinite(heightM) && heightM > 0;
    const ibw = hasHeight ? ibwKg(heightM) : NaN;

    if (hasHeight) {
      ibwEl.textContent = roundTo(ibw, 1).toString();
      const activity = (activityEl && activityEl.value) || "sedentary";
      const mult = IBW_MULTIPLIER[activity] ?? 25;
      const recKcal = Math.round(ibw * mult);
      if (calValueEl) calValueEl.textContent = recKcal.toString();

      const carbKcal = Math.round(recKcal * MACRO_SPLIT.carbs);
      const proteinKcal = Math.round(recKcal * MACRO_SPLIT.protein);
      const fatKcal = Math.round(recKcal * MACRO_SPLIT.fat);
      const carbG = roundTo(carbKcal / KCAL_PER_G.carbs, 0);
      const proteinG = roundTo(proteinKcal / KCAL_PER_G.protein, 0);
      const fatG = roundTo(fatKcal / KCAL_PER_G.fat, 0);
      if (recCarbKcalEl) recCarbKcalEl.textContent = carbKcal.toString();
      if (recCarbGEl) recCarbGEl.textContent = carbG + " g";
      if (recProteinKcalEl) recProteinKcalEl.textContent = proteinKcal.toString();
      if (recProteinGEl) recProteinGEl.textContent = proteinG + " g";
      if (recFatKcalEl) recFatKcalEl.textContent = fatKcal.toString();
      if (recFatGEl) recFatGEl.textContent = fatG + " g";
    } else {
      ibwEl.textContent = "–";
      if (calValueEl) calValueEl.textContent = "–";
      if (recCarbKcalEl) recCarbKcalEl.textContent = "–";
      if (recCarbGEl) recCarbGEl.textContent = "– g";
      if (recProteinKcalEl) recProteinKcalEl.textContent = "–";
      if (recProteinGEl) recProteinGEl.textContent = "– g";
      if (recFatKcalEl) recFatKcalEl.textContent = "–";
      if (recFatGEl) recFatGEl.textContent = "– g";
    }

    const bmi = calculateBmi();
    if (!Number.isFinite(bmi) || bmi <= 0) {
      bmiValueEl.textContent = "–";
      bmiCategoryEl.textContent = "Category: –";
      bmiCategoryEl.className = "chip";
      return;
    }
    const rounded = roundTo(bmi, 1);
    bmiValueEl.textContent = rounded.toString();

    const category = getBmiCategory(rounded);
    bmiCategoryEl.textContent = category.label;
    bmiCategoryEl.className = `chip ${category.className}`;
  };

  const init = () => {
    if (!formEl) return;

    updateVisibility();

    systemEl.addEventListener("change", () => {
      updateVisibility();
      render();
    });

    if (activityEl) {
      activityEl.addEventListener("change", () => {
        render();
        EnergyModule.render();
      });
    }

    formEl.addEventListener("submit", (event) => {
      event.preventDefault();
      render();
      EnergyModule.render();
    });
  };

  return { init };
})();

const EnergyModule = (() => {
  const systemEl = document.querySelector("#bmi-system");
  const weightKgEl = document.querySelector("#bmi-weight-kg");
  const heightCmEl = document.querySelector("#bmi-height-cm");
  const weightLbEl = document.querySelector("#bmi-weight-lb");
  const heightFtEl = document.querySelector("#bmi-height-ft");
  const heightInEl = document.querySelector("#bmi-height-in");
  const sexEl = document.querySelector("#energy-sex");
  const ageEl = document.querySelector("#energy-age");
  const activityEl = document.querySelector("#energy-activity");
  const bmrValueEl = document.querySelector("#bmr-value");
  const tdeeValueEl = document.querySelector("#tdee-value");

  /** Get weight (kg) and height (cm) from the unified form (metric or imperial). */
  const getWeightKgAndHeightCm = () => {
    const mode = systemEl && systemEl.value === "imperial" ? "imperial" : "metric";
    if (mode === "metric") {
      return {
        weightKg: safeNumber(weightKgEl && weightKgEl.value),
        heightCm: safeNumber(heightCmEl && heightCmEl.value),
      };
    }
    const lb = safeNumber(weightLbEl && weightLbEl.value);
    const ft = safeNumber(heightFtEl && heightFtEl.value);
    const inch = safeNumber(heightInEl && heightInEl.value);
    const totalInches = ft * 12 + inch;
    return {
      weightKg: lb * 0.45359237,
      heightCm: totalInches * 2.54,
    };
  };

  const calculateBmr = ({ sex, age, weightKg, heightCm }) => {
    const s = sex === "male" ? 5 : -161;
    return 10 * weightKg + 6.25 * heightCm - 5 * age + s;
  };

  const ACTIVITY_FACTOR = { sedentary: 1.2, moderate: 1.55, heavy: 1.9 };

  const render = () => {
    const sex = sexEl && sexEl.value === "female" ? "female" : "male";
    const age = safeNumber(ageEl && ageEl.value);
    const activityKey = (activityEl && activityEl.value) || "sedentary";
    const activityFactor = ACTIVITY_FACTOR[activityKey] ?? 1.2;
    const { weightKg, heightCm } = getWeightKgAndHeightCm();

    if (!age || !weightKg || !heightCm) {
      if (bmrValueEl) bmrValueEl.textContent = "–";
      if (tdeeValueEl) tdeeValueEl.textContent = "–";
      return;
    }

    const bmr = calculateBmr({ sex, age, weightKg, heightCm });
    const tdee = bmr * activityFactor;

    if (bmrValueEl) bmrValueEl.textContent = Math.round(bmr).toString();
    if (tdeeValueEl) tdeeValueEl.textContent = Math.round(tdee).toString();
  };

  const init = () => {
    // No form of its own; render is called from BmiModule on unified form submit
  };

  return { init, render };
})();

const MacroModule = (() => {
  const formEl = document.querySelector("#macro-form");
  const carbEl = document.querySelector("#macro-carb");
  const proteinEl = document.querySelector("#macro-protein");
  const fatEl = document.querySelector("#macro-fat");
  const alcoholEl = document.querySelector("#macro-alcohol");

  const totalEl = document.querySelector("#macro-total");
  const carbKcalEl = document.querySelector("#macro-carb-kcal");
  const proteinKcalEl = document.querySelector("#macro-protein-kcal");
  const fatKcalEl = document.querySelector("#macro-fat-kcal");
  const alcoholKcalEl = document.querySelector("#macro-alcohol-kcal");

  const calculateMacroKcal = ({ carbs, protein, fat, alcohol }) => {
    const carbKcal = carbs * MACRO_KCAL_PER_GRAM.carb;
    const proteinKcal = protein * MACRO_KCAL_PER_GRAM.protein;
    const fatKcal = fat * MACRO_KCAL_PER_GRAM.fat;
    const alcoholKcal = alcohol * MACRO_KCAL_PER_GRAM.alcohol;
    const total = carbKcal + proteinKcal + fatKcal + alcoholKcal;

    return {
      carbKcal,
      proteinKcal,
      fatKcal,
      alcoholKcal,
      total,
    };
  };

  const render = () => {
    const carbs = safeNumber(carbEl.value);
    const protein = safeNumber(proteinEl.value);
    const fat = safeNumber(fatEl.value);
    const alcohol = safeNumber(alcoholEl.value);

    if (!carbs && !protein && !fat && !alcohol) {
      totalEl.textContent = "–";
      carbKcalEl.textContent = "–";
      proteinKcalEl.textContent = "–";
      fatKcalEl.textContent = "–";
      alcoholKcalEl.textContent = "–";
      return;
    }

    const { carbKcal, proteinKcal, fatKcal, alcoholKcal, total } =
      calculateMacroKcal({ carbs, protein, fat, alcohol });

    carbKcalEl.textContent = Math.round(carbKcal).toString();
    proteinKcalEl.textContent = Math.round(proteinKcal).toString();
    fatKcalEl.textContent = Math.round(fatKcal).toString();
    alcoholKcalEl.textContent = Math.round(alcoholKcal).toString();
    totalEl.textContent = Math.round(total).toString();
  };

  const init = () => {
    if (!formEl) return;
    formEl.addEventListener("submit", (event) => {
      event.preventDefault();
      render();
    });
  };

  return { init };
})();

const FoodModule = (() => {
  const formEl = document.querySelector("#food-form");
  const itemEl = document.querySelector("#food-item");
  const servingsEl = document.querySelector("#food-servings");

  const totalEl = document.querySelector("#food-total");
  const carbKcalEl = document.querySelector("#food-carb-kcal");
  const proteinKcalEl = document.querySelector("#food-protein-kcal");
  const fatKcalEl = document.querySelector("#food-fat-kcal");

  const getFoodForKey = (key) => {
    return FOOD_MACROS[key] || null;
  };

  const render = () => {
    const key = itemEl.value;
    const servings = safeNumber(servingsEl.value) || 0;
    const food = getFoodForKey(key);

    if (!food || servings <= 0) {
      totalEl.textContent = "–";
      carbKcalEl.textContent = "–";
      proteinKcalEl.textContent = "–";
      fatKcalEl.textContent = "–";
      return;
    }

    const carbs = food.carbs * servings;
    const protein = food.protein * servings;
    const fat = food.fat * servings;

    const carbKcal = carbs * MACRO_KCAL_PER_GRAM.carb;
    const proteinKcal = protein * MACRO_KCAL_PER_GRAM.protein;
    const fatKcal = fat * MACRO_KCAL_PER_GRAM.fat;
    const total = carbKcal + proteinKcal + fatKcal;

    carbKcalEl.textContent = Math.round(carbKcal).toString();
    proteinKcalEl.textContent = Math.round(proteinKcal).toString();
    fatKcalEl.textContent = Math.round(fatKcal).toString();
    totalEl.textContent = Math.round(total).toString();
  };

  const init = () => {
    if (!formEl) return;
    formEl.addEventListener("submit", (event) => {
      event.preventDefault();
      render();
    });
  };

  return { init };
})();

const TabsModule = (() => {
  const init = () => {
    const tabButtons = Array.from(document.querySelectorAll(".tab"));
    const panels = Array.from(document.querySelectorAll(".tab-panel"));
    if (!tabButtons.length || !panels.length) return;

    const setActive = (target) => {
      tabButtons.forEach((btn) => {
        const isActive = btn.dataset.tabTarget === target;
        btn.classList.toggle("tab-active", isActive);
        btn.setAttribute("aria-selected", isActive ? "true" : "false");
        btn.setAttribute("tabindex", isActive ? "0" : "-1");
      });

      panels.forEach((panel) => {
        const isActive = panel.dataset.tabPanel === target;
        panel.classList.toggle("tab-panel-active", isActive);
        panel.hidden = !isActive;
      });
    };

    tabButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.tabTarget;
        if (!target) return;
        setActive(target);
      });
    });

    const initiallyActive =
      tabButtons.find((btn) => btn.classList.contains("tab-active"))
        ?.dataset.tabTarget || panels[0].dataset.tabPanel;
    setActive(initiallyActive);
  };

  return { init };
})();

const App = (() => {
  const init = () => {
    TabsModule.init();
    BmiModule.init();
    EnergyModule.init();
    MacroModule.init();
    FoodModule.init();
  };

  return { init };
})();

document.addEventListener("DOMContentLoaded", () => {
  App.init();
});

