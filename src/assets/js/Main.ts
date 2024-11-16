// @ts-ignore
import Core from "./Core";
import { z } from "zod";
import {
  BuildToc,
  BuildCookies,
  BuildToggle,
  BuildTruncater,
  BuildFormHandler,
  BuildHeroAnimation,
  BuildProgressWidgetAnimation,
  BuildAppearAnimation,
  BuildStackingAnimation,
  BuildLineAppearAnimation,
  BuildRevealWidgetAnimation,
  BuildCounterWidgetAnimation,
  BuildVideoWidget,
  BuildQuiz,
  BuildInput,
  BuildVideoSource,
  BuildCursorAnimation,
} from "./build/index";

const initAnimations = () => {
  const animations = [
    new BuildCursorAnimation(),
    new BuildHeroAnimation(),
    new BuildProgressWidgetAnimation(),
    new BuildAppearAnimation(),
    new BuildStackingAnimation(),
    new BuildLineAppearAnimation(),
    new BuildRevealWidgetAnimation(),
    new BuildCounterWidgetAnimation(),
  ];
  animations.forEach((animation) => animation.init());
};

const initFormAndQuiz = () => {
  // Form
  const formSchema = z.object({
    name: z.string().min(2, { message: "Минимум 2 символа" }).max(32, { message: "Максимум 24 символа" }),
    phone: z.string().min(5, { message: "Минимум 5 символов" }).max(16, { message: "Максимум 16 символов" }),
    policy: z.boolean().refine((val) => val === true, { message: "Необходимо согласие с политикой" }),
  });
  new BuildFormHandler("myForm", formSchema, {
    url: window.origin + "/api/contact/",
    validateOnInput: true,
    onSuccess: (data, form) => {
      document.querySelector(".main-msg").classList.add("is-active");
      form.reset();
    },
    onComplete: (result) => console.log("Server response:", result),
    onError: (error) => console.log("An error occurred: " + error),
  });
  const quizSchema = z.object({
    interest: z.string().min(2, "Укажите интересы").max(48, "Максимум 48 символа"),
    location: z.string().min(2, "Укажите город").max(48, "Максимум 48 символа"),
    yard: z.string().min(1, "Укажите площадь"),
    name: z.string().min(2, "Минимум 2 символа").max(24, "Максимум 24 символа"),
    phone: z.string().min(5, "Минимум 5 символов").max(16, "Максимум 16 символов"),
    policy: z.preprocess(
      (val) => val === "on",
      z.boolean().refine((val) => val === true, {
        message: "Вы должны согласиться с политикой конфиденциальности",
      })
    ),
  });

  // Quiz
  const quizValidationKeys = {
    0: { interest: true },
    1: { location: true },
    2: { yard: true },
    3: { username: true, phone: true, policy: true },
  };
  new BuildQuiz(quizSchema, quizValidationKeys, ".quiz-widget");
  new BuildFormHandler("quizForm", quizSchema, {
    url: window.origin + "/api/quiz/",
    validateOnInput: true,
    onSuccess: (data, form) => {
      document.querySelector(".main-msg").classList.add("is-active");
      form.reset();
    },
    onComplete: (result) => console.log("Server response:", result),
    onError: (error) => console.log("An error occurred: " + error.message),
  });
};

const initApp = async () => {
  await Core.getInstance().init();

  // Toggles
  new BuildToggle({
    trigger: ".header__burger",
    target: ".header",
    toggleClasses: ["is-menu-active", "is-menu-close"],
    visibleClasses: ["is-menu-active"],
    events: {
      onChange: () => {
        if (document.querySelector(".header").classList.contains("is-menu-active")) {
          document.body.classList.add("locked");
        } else {
          document.body.classList.remove("locked");
        }
      },
    },
  });
  new BuildToggle({
    trigger: ".main-msg button",
    target: ".main-msg",
    toggleClasses: ["is-active", "is-close"],
    visibleClasses: ["is-active"],
    events: {},
  });
  new BuildToggle({
    trigger: ".toc__title",
    target: "nextEl",
    toggleClasses: ["is-active", "is-close"],
    visibleClasses: ["is-active"],
    events: {},
  });
  // Other
  new BuildToc({
    selector: ".h2",
    rootElement: document.querySelector("#policyToc .accordion-wrapper"),
    targetElement: document.getElementById("policyContent"),
  });

  new BuildInput();
  new BuildTruncater();
  new BuildVideoWidget();
  new BuildVideoSource();
  new BuildCookies();
  initAnimations();
  initFormAndQuiz();
};

document.addEventListener("DOMContentLoaded", initApp);
