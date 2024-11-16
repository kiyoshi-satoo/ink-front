import { z } from "zod";
import Core from "../Core";
import { debounce } from "../utils/global";

export class BuildQuizModel {
  private currentStepData: Record<number, any> = {};
  private schema: z.ZodSchema<any>;
  private validationKeys: Record<number, Record<string, boolean>>;

  constructor(schema: z.ZodSchema<any>, validationKeys: Record<number, Record<string, boolean>>) {
    this.schema = schema;
    this.validationKeys = validationKeys;
  }

  validateStep(stepIndex: number, data: any): boolean {
    try {
      const fieldsToValidate = this.validationKeys[stepIndex];
      // @ts-ignore
      this.schema.pick(fieldsToValidate).parse(data);
      this.currentStepData[stepIndex] = data;

      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        // console.error(error.errors);
      }
      return false;
    }
  }
}
export class BuildQuizView {
  private controller: BuildQuizController;
  public gsap: any;
  public widget: HTMLElement;
  public form: HTMLFormElement;
  public stepsWrappers: NodeListOf<HTMLElement>;
  private progressWidget: HTMLElement;

  constructor(widget: HTMLElement, gsap: any) {
    this.widget = widget;
    this.form = this.widget.querySelector("form");
    this.stepsWrappers = this.widget.querySelectorAll(".quiz-widget__steps");
    this.progressWidget = this.widget.querySelector(".quiz-widget__progress") as HTMLElement;
    this.gsap = gsap;
  }
  public setController(controller: BuildQuizController) {
    this.controller = controller;
    this.init();
  }
  private init() {
    this.setupEventListeners();
    this.setStepVisibility(0);
    this.updateProgress(0, this.controller.stepsCount);
  }

  private setupEventListeners() {
    this.form.addEventListener("change", (e) => {
      if ((e.target as HTMLInputElement).type === "checkbox" || (e.target as HTMLInputElement).type === "radio") {
        this.controller.handleConditionalFields(e);
      }
    });

    this.form.addEventListener(
      "input",
      debounce(() => {
        this.controller.updateButtonStates();
      }, 80)
    );
    const nextButton = this.widget.querySelector(".quiz-widget__next") as HTMLButtonElement;
    const prevButton = this.widget.querySelector(".quiz-widget__prev") as HTMLButtonElement;

    nextButton.addEventListener("click", () => this.controller.handleNext());
    prevButton.addEventListener("click", () => this.controller.handlePrev());
  }

  public setStepVisibility(stepIndex: number) {
    this.stepsWrappers.forEach((stepWrapper) => {
      const stepElements = stepWrapper.querySelectorAll(".quiz-widget__step");
      stepElements.forEach((stepElement, index) => {
        if (index === stepIndex) {
          stepElement.classList.add("is-active");
          this.gsap.to(stepElement, {
            opacity: 1,
            duration: 0.5,
            ease: "customEase",
          });
        } else {
          stepElement.classList.remove("is-active");
          this.gsap.to(stepElement, {
            opacity: 0,
            duration: 0.5,
            ease: "customEase",
          });
        }
      });

      this.gsap.to(stepWrapper, {
        x: `-${stepIndex * 100}%`,
        duration: 0.5,
        ease: "customEase",
      });
    });
  }

  updateProgress(currentStep: number, totalSteps: number) {
    const progressPercentage = ((currentStep + 1) / totalSteps) * 100;
    this.progressWidget.querySelector("div > p:first-child")!.textContent = (currentStep + 1).toString();
    this.progressWidget.querySelector("div > p:last-child")!.textContent = totalSteps.toString();
    this.gsap.to(this.progressWidget.querySelector("span"), { "--progress-percentage": `${progressPercentage}%` });
  }

  toggleNextButton(isEnabled: boolean) {
    const nextButton = this.widget.querySelector(".quiz-widget__next") as HTMLButtonElement;
    nextButton.style.display = isEnabled ? "inline-flex" : "none";
  }

  togglePrevButton(isEnabled: boolean) {
    const prevButton = this.widget.querySelector(".quiz-widget__prev") as HTMLButtonElement;
    prevButton.style.display = isEnabled ? "inline-flex" : "none";
  }

  updateConditionalFieldVisibility(input: HTMLInputElement, isVisible: boolean) {
    input.style.display = isVisible ? "block" : "none";
  }
}
export class BuildQuizController {
  private model: BuildQuizModel;
  private view: BuildQuizView;
  public currentStep: number = 0;
  public stepsCount: number = 0;

  constructor(model: BuildQuizModel, view: BuildQuizView) {
    this.model = model;
    this.view = view;
    this.stepsCount = this.view.stepsWrappers[0].children.length;
    this.handleConditionalFields(null);
    this.updateButtonStates();
  }

  handleNext() {
    const formData = new FormData(this.view.widget.querySelector("form.quiz-widget__steps") as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());

    if (this.model.validateStep(this.currentStep, data)) {
      if (this.currentStep < this.stepsCount) {
        this.currentStep++;
        this.view.setStepVisibility(this.currentStep);
      }
    }
    this.updateButtonStates();
    this.view.updateProgress(this.currentStep, this.stepsCount);
  }

  handlePrev() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.view.setStepVisibility(this.currentStep);
    }
    this.updateButtonStates();
    this.view.updateProgress(this.currentStep, this.stepsCount);
  }

  updateButtonStates() {
    const formData = new FormData(this.view.form);
    const data = Object.fromEntries(Array.from(formData.entries()).map(([key, value]) => [key, value === "undefined" ? "" : value]));

    const isValid = this.model.validateStep(this.currentStep, data);
    const isLastStep = this.currentStep === this.stepsCount - 1;
    const isFirstStep = this.currentStep === 0;

    this.view.toggleNextButton(isValid && !isLastStep);
    this.view.togglePrevButton(!isFirstStep);
  }

  handleConditionalFields(e: Event | null) {
    const conditionalInputs = this.view.form.querySelectorAll("[data-show-if]");

    conditionalInputs.forEach((inputContainer: HTMLInputElement) => {
      const input = inputContainer.querySelector("input");
      const [fieldName, expectedValue] = inputContainer.getAttribute("data-show-if")!.split(",");
      const selectedCheckbox = this.view.form.querySelector(`input[name="${fieldName}"]:checked`) as HTMLInputElement;

      const shouldShow = selectedCheckbox && selectedCheckbox.value === expectedValue;

      if (shouldShow) {
        input.value = "";
      } else {
        input.value = (e?.target as HTMLInputElement)?.value;
      }
      input.dispatchEvent(new Event("input"));

      this.view.updateConditionalFieldVisibility(inputContainer, shouldShow);
    });
  }
}
export class BuildQuiz {
  private core: Core;
  private model: BuildQuizModel;
  private view: BuildQuizView;
  private controller: BuildQuizController;

  constructor(schema: z.ZodSchema<any>, validationKeys: Record<number, Record<string, boolean>>, widgetSelector: string) {
    this.core = Core.getInstance();

    const widget = document.querySelector(widgetSelector) as HTMLElement;
    if (!widget) throw new Error("Widget element not found");

    const modulePromise = this.core.moduleManager.loadModule("gsap");

    modulePromise.then((gsapModule: any) => {
      this.model = new BuildQuizModel(schema, validationKeys);
      this.view = new BuildQuizView(widget, gsapModule);
      this.controller = new BuildQuizController(this.model, this.view);

      this.view.setController(this.controller);
    });
  }
}
