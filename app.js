const MACRO_KCAL_PER_GRAM = {
  carb: 4,
  protein: 4,
  fat: 9,
  alcohol: 7,
};

const FOOD_MACROS = {
  olive_oil_tbsp: {
    label: "Olive oil – 1 tbsp",
    carbs: 0,
    protein: 0,
    fat: 13.5,
  },
  canola_oil_tbsp: {
    label: "Canola oil – 1 tbsp",
    carbs: 0,
    protein: 0,
    fat: 13.6,
  },
  butter_tbsp: {
    label: "Butter – 1 tbsp",
    carbs: 0,
    protein: 0.1,
    fat: 11.5,
  },
  rice_cup_cooked: {
    label: "White rice – 1 cup cooked",
    carbs: 45,
    protein: 4,
    fat: 0.4,
  },
  chicken_100g_cooked: {
    label: "Chicken breast – 100 g cooked",
    carbs: 0,
    protein: 31,
    fat: 3.6,
  },
  almonds_28g: {
    label: "Almonds – 28 g",
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

  const systemSections = {
    metric: document.querySelectorAll("[data-metric-only]"),
    imperial: document.querySelectorAll("[data-imperial-only]"),
  };

  const getBmiCategory = (bmi) => {
    if (!Number.isFinite(bmi) || bmi <= 0) {
      return { label: "Category: –", className: "" };
    }
    if (bmi < 18.5) {
      return { label: "Category: Underweight", className: "bmi-category-under" };
    }
    if (bmi < 25) {
      return { label: "Category: Normal weight", className: "bmi-category-normal" };
    }
    if (bmi < 30) {
      return { label: "Category: Overweight", className: "bmi-category-over" };
    }
    return { label: "Category: Obesity", className: "bmi-category-obese" };
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

  const render = () => {
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

    formEl.addEventListener("submit", (event) => {
      event.preventDefault();
      render();
    });
  };

  return { init };
})();

const EnergyModule = (() => {
  const formEl = document.querySelector("#energy-form");
  const sexEl = document.querySelector("#energy-sex");
  const ageEl = document.querySelector("#energy-age");
  const weightEl = document.querySelector("#energy-weight-kg");
  const heightEl = document.querySelector("#energy-height-cm");
  const activityEl = document.querySelector("#energy-activity");
  const bmrValueEl = document.querySelector("#bmr-value");
  const tdeeValueEl = document.querySelector("#tdee-value");

  const calculateBmr = ({ sex, age, weightKg, heightCm }) => {
    const s = sex === "male" ? 5 : -161;
    return 10 * weightKg + 6.25 * heightCm - 5 * age + s;
  };

  const render = () => {
    const sex = sexEl.value === "female" ? "female" : "male";
    const age = safeNumber(ageEl.value);
    const weightKg = safeNumber(weightEl.value);
    const heightCm = safeNumber(heightEl.value);
    const activityFactor = safeNumber(activityEl.value) || 1.2;

    if (!age || !weightKg || !heightCm) {
      bmrValueEl.textContent = "–";
      tdeeValueEl.textContent = "–";
      return;
    }

    const bmr = calculateBmr({ sex, age, weightKg, heightCm });
    const tdee = bmr * activityFactor;

    bmrValueEl.textContent = Math.round(bmr).toString();
    tdeeValueEl.textContent = Math.round(tdee).toString();
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

