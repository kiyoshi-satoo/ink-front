// @ts-nocheck
import { ZodSchema, ZodError } from "zod";
import { debounce } from "../utils/global";
import { getCSRFToken } from "../utils/helpers";

/**
 * Интерфейс для опций обработчика форм.
 */
interface FormHandlerOptions<T> {
  url?: string; // URL для отправки данных на сервер
  onSuccess?: (data: T, form: HTMLFormElement) => Promise<void> | void; // Колбек при успешной валидации и отправке данных
  onComplete?: (result: any, form: HTMLFormElement) => void; // Колбек при завершении обработки данных
  onError?: (error: any, form: HTMLFormElement) => void; // Колбек при возникновении ошибки
  validateOnInput?: boolean; // Опция для включения живой валидации
}

/**
 * Класс BuildFormHandler для управления валидацией и отправкой данных форм.
 * Использует паттерн "Strategy" https://refactoring.guru/design-patterns/strategy
 * @template T Тип данных формы.
 */
export class BuildFormHandler<T> {
  private formId: string;
  private form: HTMLFormElement;
  private schema: ZodSchema<T>;
  private options: FormHandlerOptions<T>;
  private errors: Record<string, string> = {};
  private formData: Partial<T> = {};
  private validateInputDebounced: (input: HTMLInputElement) => void;
  private isFormResetting: boolean = false; // Флаг для отслеживания сброса формы

  constructor(formId: string, schema: ZodSchema<T>, options: FormHandlerOptions<T> = {}) {
    this.formId = formId;
    this.schema = schema;
    this.options = options;
    this.form = document.getElementById(this.formId) as HTMLFormElement;

    if (this.form) {
      // Настраиваем дебаунс для validateInput
      // TODO: Временное решение. Нужно продумать логику состояния сброса.
      // TODO: Сейчас при быстрой отправки, некоторые инпуты не успевают сбросить ошибки
      this.validateInputDebounced = debounce((input: HTMLInputElement) => {
        if (!this.isFormResetting) {
          // Выполняем валидацию, только если форма не сбрасывается
          this.validateInput(input);
        }
      }, 750);
      this.init();
    }
  }

  private init(): void {
    this.form.addEventListener("submit", (event) => {
      event.preventDefault();
      this.handleSubmit();
    });
    this.form.addEventListener("reset", () => {
      this.isFormResetting = true; // Устанавливаем флаг, что форма сбрасывается
      this.clearErrors(); // Очищаем ошибки
      setTimeout(() => {
        this.isFormResetting = false; // Сбрасываем флаг через небольшую задержку
      }, 100); // Даем время для завершения сброса формы
    });
    const inputs = this.form.querySelectorAll<HTMLInputElement>("input, select, textarea");
    inputs.forEach((input) => {
      input.addEventListener("input", () => {
        if (this.options.validateOnInput) {
          this.validateInputDebounced(input);
        }
      });
    });
  }

  /**
   * Обработка отправки формы.
   * Валидация данных и отправка на сервер, если валидация успешна.
   */
  private async handleSubmit(): Promise<void> {
    this.formData = this.getFormData();

    if (!this.validate()) {
      this.displayErrors();
      return;
    }

    this.errors = {};
    this.displayErrors();

    if (this.options.onSuccess) {
      await this.options.onSuccess(this.formData as T, this.form);
    }

    if (this.options.url) {
      await this.sendData();
    }
  }

  /**
   * Сбор данных из формы.
   * @returns Объект с данными формы
   */
  private getFormData(): Partial<T> {
    const data: Partial<T> = {};
    const inputs = this.form.querySelectorAll<HTMLInputElement>("input, select, textarea");
    inputs.forEach((input) => {
      if (input.type === "checkbox") {
        data[input.name as keyof T] = input.checked as any;
      } else {
        data[input.name as keyof T] = input.value as any;
      }
    });
    return data;
  }

  /**
   * Валидация данных формы.
   * @returns true, если валидация успешна; иначе false.
   */
  private validate(): boolean {
    try {
      this.schema.parse(this.formData);
      this.errors = {};
      return true;
    } catch (e) {
      if (e instanceof ZodError) {
        this.errors = e.errors.reduce((acc: Record<string, string>, err) => {
          acc[err.path[0] as string] = err.message;
          return acc;
        }, {});
      }
      return false;
    }
  }

  /**
   * Валидация отдельного поля формы.
   * @param input HTMLInputElement
   */
  private validateInput(input: HTMLInputElement): void {
    const name = input.name as keyof T;
    const value = input.type === "checkbox" ? input.checked : input.value;

    try {
      this.schema.pick({ [name]: true }).parse({ [name]: value });
      delete this.errors[name]; // Убираем ошибки для данного поля
    } catch (e) {
      if (e instanceof ZodError) {
        // this.errors[name] = e.errors[0].message;
      }
    }

    this.displayErrors();
  }

  /**
   * Отображение ошибок в разметке.
   */
  private displayErrors(): void {
    const inputs = this.form.querySelectorAll<HTMLInputElement>("input, select, textarea");

    inputs.forEach((input) => {
      const isCheckbox = input.type === "checkbox";
      const parentDiv = isCheckbox ? input.closest(".btn-checkbox") : input.closest(".main-input");

      if (parentDiv) {
        const fieldName = input.name as keyof T;

        if (this.errors[fieldName]) {
          parentDiv.classList.add("has-error");

          if (!isCheckbox) {
            const errorElement = parentDiv.querySelector(".main-input__error");

            if (errorElement) {
              (errorElement.querySelector("p") as HTMLElement).innerText = this.errors[fieldName];
            } else {
              const newErrorElement = document.createElement("span");
              newErrorElement.className = "main-input__error";
              newErrorElement.innerHTML = `<p>${this.errors[fieldName]}</p>`;
              parentDiv.appendChild(newErrorElement);
            }
          }
        } else {
          parentDiv.classList.remove("has-error");

          if (!isCheckbox) {
            const errorElement = parentDiv.querySelector(".main-input__error");
            if (errorElement) {
              errorElement.remove();
            }
          }
        }
      }
    });
  }

  /**
   * Отправка данных на сервер.
   * TODO: Продумать логику отправки данных разных форматов
   */
  private async sendData(): Promise<void> {
    try {
      const response = await fetch(this.options.url!, {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCSRFToken(),
        },
        body: JSON.stringify(this.formData),
      });
      if (response.status !== 200) {
        throw new Error("Network response was not ok");
      }

      const result = await response.json();
      if (this.options.onComplete) {
        this.options.onComplete(result, this.form);
      }
    } catch (error) {
      if (this.options.onError) {
        this.options.onError(error, this.form);
      }
    }
  }

  public clearErrors(): void {
    this.errors = {};
    this.displayErrors();
  }
}
