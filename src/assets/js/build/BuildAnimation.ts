import Core from "../Core";
import { formatNumber, zeroPad } from "../utils/helpers";

/**
 * Опции для инициализации анимации.
 */
interface AnimationOptions {
  moduleNames?: string[]; // Названия модулей для импорта
  onInit?: () => void; // Callback для инициализации
  onResize?: () => void; // Callback для обработки изменения размера окна
}

/**
 * Базовый класс для создания анимаций с поддержкой модульной загрузки.
 * Этот класс использует паттерн **Template Method** https://refactoring.guru/design-patterns/template-method.
 * Определяет общий процесс инициализации и управления модулями,
 * а специфические детали реализуются в подклассах.
 */
export class BuildAnimation {
  private options: AnimationOptions = {};
  public core: Core;

  /**
   * Конструктор базового класса анимации.
   * @param {AnimationOptions} options - Опции для анимации.
   */
  constructor(options: AnimationOptions = {}) {
    this.options = options;
    this.core = Core.getInstance();
  }

  /**
   * Инициализация анимации. Загружает модули и запускает callback.
   */
  public init() {
    try {
      // Загружаем все модули через Promise.all
      const modulePromises = this.options.moduleNames.map((mn) => this.core.moduleManager.loadModule(mn));
      const loadedModules = Promise.all(modulePromises);

      // Инициализация после загрузки модулей
      loadedModules.then(() => {
        this.initCallback();
      });
    } catch (error) {
      console.error("Ошибка при инициализации модулей:", error);
    }
  }

  /**
   * Callback после инициализации и загрузки модулей.
   */
  protected initCallback() {
    window.addEventListener("resize", this.handleResize.bind(this));

    // Вызов пользовательского callback после инициализации
    if (this.options.onInit) {
      this.options.onInit();
    }
  }

  /**
   * Обрабатывает событие изменения размера окна.
   */
  private handleResize(): void {
    if (this.options.onResize) {
      this.options.onResize();
    }
  }

  /**
   * Отключает анимацию и удаляет события.
   */
  public destroy() {
    window.removeEventListener("resize", this.handleResize.bind(this));
  }
}

export class BuildHeroAnimation extends BuildAnimation {
  private hero: HTMLElement | null;

  constructor(options: AnimationOptions = {}) {
    super(options);
    options.moduleNames = ["gsap", "ScrollTrigger"];
    this.hero = document.querySelector(".hero");
  }

  protected initCallback() {
    super.initCallback(); // Вызываем базовую логику из родительского класса

    // Добавляем логику для анимации героя
    if (this.hero) {
      this.animateHero();
    }
  }

  private animateHero() {
    const gsap = this.core.moduleManager.getModule("gsap");
    if (!this.hero || !this.core.moduleManager.getModule("gsap")) return;

    const tl = gsap.timeline({ defaults: { duration: 1, ease: "power3.out" } });
    tl.fromTo(this.hero.querySelector("h1"), { opacity: 0, y: 30 }, { opacity: 1, y: 0 });
    tl.fromTo(this.hero.querySelector("p"), { opacity: 0, y: 30 }, { opacity: 1, y: 0 }, "-=0.5");
    tl.fromTo(this.hero.querySelector("a"), { opacity: 0, y: 30 }, { opacity: 1, y: 0 }, "-=0.7");
    tl.fromTo(
      this.hero.querySelector(".hero__line"),
      { "--line-color": "rgba(255, 255, 255, 0.05", "--line-width": "0vw" },
      { "--line-color": "rgba(255, 255, 255, 0.2", "--line-width": "100vw", duration: 1.4 },
      "-=0.9"
    );
  }
}

export class BuildProgressWidgetAnimation extends BuildAnimation {
  private elements: NodeListOf<HTMLElement>;

  constructor(options: AnimationOptions = {}) {
    super(options);
    options.moduleNames = ["gsap", "ScrollTrigger"];
    this.elements = document.querySelectorAll("[data-progress-animation]");
  }

  protected initCallback() {
    super.initCallback();
    this.animate();
  }

  private animate() {
    if (!this.elements.length) return;
    const gsap = this.core.moduleManager.getModule("gsap");
    const ScrollTrigger = this.core.moduleManager.getModule("ScrollTrigger");

    this.elements.forEach((widget) => {
      ScrollTrigger.create({
        trigger: widget,
        start: "top bottom",
        end: "top bottom",
        markers: false,
        onEnter: () => {
          const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 2 } });
          tl.fromTo(widget.querySelector("div"), { maxWidth: 0 }, { maxWidth: "100%" });
          tl.fromTo(widget.querySelector("div"), { opacity: 0 }, { opacity: 1 }, "-=1.5");
          tl.fromTo(
            widget,
            {
              "--progress-percentage": "0%",
            },
            { "--progress-percentage": "100%" },
            "loader-=1.7"
          );
          tl.fromTo(
            widget.querySelector("p"),
            {
              innerText: 0,
            },
            {
              innerText: 100,
              modifiers: {
                innerText: function (num) {
                  num = Math.round(num);
                  return zeroPad(num, 2);
                },
              },
            },
            "loader-=1.7"
          );
        },
      });
    });
  }
}

export class BuildAppearAnimation extends BuildAnimation {
  private elements: NodeListOf<HTMLElement> | null;

  constructor(options: AnimationOptions = {}) {
    options.moduleNames = ["gsap", "ScrollTrigger"];
    super(options);

    this.elements = document.querySelectorAll("[data-appear-animation]");
  }

  protected initCallback() {
    super.initCallback();

    if (this.elements) {
      this.animate();
    }
  }

  /**
   * Определяет целевой элемент для анимации (по строке селектора или по переданному HTMLElement).
   *
   * @param {HTMLElement} el - Элемент, от которого начинается поиск целевого элемента.
   * @returns {HTMLElement | null} - Найденный целевой элемент или null.
   */
  private resolveTarget(el: HTMLElement): HTMLElement | null {
    const targetAttr = el.getAttribute("data-appear-trigger") || "self"; // Получаем значение атрибута или "self" по умолчанию
    return this.resolveTargetFromString(el, targetAttr);
  }

  /**
   * Определяет целевой элемент относительно текущего элемента (например, родитель, следующий, предыдущий).
   *
   * @param {HTMLElement} el - Элемент, от которого начинается поиск.
   * @param {string} target - Строка, указывающая, как искать целевой элемент (например, "parent", "nextEl", или выражение вида closest(selector)).
   * @returns {HTMLElement | null} - Найденный целевой элемент или null.
   */
  private resolveTargetFromString(el: HTMLElement, target: string): HTMLElement | null {
    let currentElement: HTMLElement | null = el;
    const actions = target.split("."); // Разбиваем строку на действия (например, parent или closest(section))

    for (const action of actions) {
      if (action === "nextEl") {
        currentElement = currentElement?.nextElementSibling as HTMLElement;
      } else if (action === "prevEl") {
        currentElement = currentElement?.previousElementSibling as HTMLElement;
      } else if (action === "parent") {
        currentElement = currentElement?.parentElement as HTMLElement;
      } else if (action.startsWith("closest(")) {
        const selector = action.match(/\(([^)]+)\)/)?.[1]; // Извлекаем селектор из выражения closest(selector)
        if (selector) {
          currentElement = currentElement?.closest(selector) as HTMLElement; // Находим ближайший элемент по селектору
        }
      } else {
        // Если не "parent", "nextEl", "prevEl" или "closest()", считаем это селектором
        currentElement = document.querySelector(action) as HTMLElement | null;
      }

      if (!currentElement) {
        break; // Если элемент не найден, прерываем цикл
      }
    }

    return currentElement || el; // Возвращаем найденный элемент или сам элемент
  }

  /**
   * Метод для запуска анимаций на элементах с атрибутом data-appear-animation.
   */
  private animate() {
    if (!this.elements) return;
    const gsap = this.core.moduleManager.getModule("gsap");

    this.elements.forEach((element) => {
      element.style.transition = "unset";
      const delay = this.getAttributeValue(element, "data-appear-delay", 0);
      const duration = this.getAttributeValue(element, "data-appear-duration", 1);
      const easing = this.getAttributeValue(element, "data-appear-easing", "power2.out");
      const direction = this.getAttributeValue(element, "data-appear-direction", "up");
      const fadeOut = element.hasAttribute("data-appear-fade-out");

      // Определяем элемент-триггер
      const triggerElement = this.resolveTarget(element);
      if (!triggerElement) return;

      // Получаем начальные и конечные значения для анимации
      const animationVars = this.getAnimationVars(direction);

      // Создаём GSAP timeline для анимации
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerElement,
          start: "top 80%",
          markers: false,
          toggleActions: fadeOut ? "play reverse play reverse" : "play none none none",
        },
        onComplete: () => {
          element.style.removeProperty("transition");
        },
      });
      tl.fromTo(element, animationVars.from, { ...animationVars.to, ease: easing, duration, delay });
    });
  }

  /**
   * Получает атрибут элемента или значение по умолчанию.
   */
  private getAttributeValue<T>(element: HTMLElement, attr: string, defaultValue: T): T {
    const value = element.getAttribute(attr);
    return value !== null ? (isNaN(Number(value)) ? (value as T) : (Number(value) as T)) : defaultValue;
  }

  /**
   * Определяет начальные и конечные значения анимации в зависимости от направления.
   */
  private getAnimationVars(direction: string) {
    const directions: Record<string, { from: any; to: any }> = {
      up: { from: { opacity: 0, y: 50 }, to: { opacity: 1, y: 0 } },
      down: { from: { opacity: 0, y: -50 }, to: { opacity: 1, y: 0 } },
      left: { from: { opacity: 0, x: 50 }, to: { opacity: 1, x: 0 } },
      right: { from: { opacity: 0, x: -50 }, to: { opacity: 1, x: 0 } },
    };
    return directions[direction] || directions.up; // По умолчанию "up"
  }
}

export class BuildStackingAnimation extends BuildAnimation {
  private elements: NodeListOf<HTMLElement> | null;

  constructor(options: AnimationOptions = {}) {
    options.moduleNames = ["gsap", "ScrollTrigger"];
    super(options);

    // Ищем элементы с атрибутом data-appear-animation
    this.elements = document.querySelectorAll(".case-screen");
  }

  protected initCallback() {
    super.initCallback();

    this.animate();
  }

  /**
   * Метод для запуска анимаций на элементах с атрибутом data-appear-animation.
   */
  private animate() {
    if (!this.elements) return;
    const ScrollTrigger = this.core.moduleManager.getModule("ScrollTrigger");

    this.elements.forEach((element: HTMLElement, index) => {
      element.style.zIndex = index.toString();
      if (index !== this.elements.length - 1) {
        ScrollTrigger.create({
          trigger: element,
          start: "top top",
          end: "bottom top", // Продолжительность анимации до следующей секции
          // end: "+=100%", // Продолжительность анимации до следующей секции
          pin: true, // Закрепляем секцию
          pinSpacing: false, // Отключаем добавление пустого места
          snap: 1 / (this.elements.length - 2), // Включаем snapping
          markers: false,
        });
      } else {
        element.style.zIndex = index.toString();
      }
    });
  }
}

export class BuildLineAppearAnimation extends BuildAnimation {
  private elements: NodeListOf<HTMLElement> | null;

  constructor(options: AnimationOptions = {}) {
    options.moduleNames = ["gsap", "ScrollTrigger"];
    super(options);

    // Ищем элементы с атрибутом data-appear-animation
    this.elements = document.querySelectorAll("[data-line-animation]");
  }

  protected initCallback() {
    super.initCallback();

    if (this.elements) {
      this.animate();
    }
  }

  /**
   * Метод для запуска анимаций на элементах с атрибутом data-appear-animation.
   */
  private animate() {
    if (!this.elements) return;
    const gsap = this.core.moduleManager.getModule("gsap");

    this.elements.forEach((element) => {
      // Создаём GSAP timeline для анимации
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: element,
          start: "top 92%",
          markers: false,
        },
        defaults: {
          ease: "power4.out",
        },
      });
      tl.fromTo(element, { "--line-progress": 0 }, { "--line-progress": 1, duration: 1.6 });
    });
  }
}

export class BuildRevealWidgetAnimation extends BuildAnimation {
  private elements: NodeListOf<HTMLElement>;

  constructor(options: AnimationOptions = {}) {
    super(options);
    options.moduleNames = ["gsap", "ScrollTrigger"];
    this.elements = document.querySelectorAll(".reveal-widget");
  }

  protected initCallback() {
    super.initCallback(); // Вызываем базовую логику из родительского класса

    this.animate();
  }

  private animate() {
    if (!this.elements.length) return;
    const ScrollTrigger = this.core.moduleManager.getModule("ScrollTrigger");
    const gsap = this.core.moduleManager.getModule("gsap");

    this.elements.forEach((widget) => {
      widget.style.maxHeight = widget.offsetHeight + "px";
      ScrollTrigger.create({
        trigger: widget,
        start: "top bottom",
        end: "top bottom",
        markers: false,
        onEnter: () => {
          const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 2 } });
          tl.fromTo(widget.querySelector("div"), { maxWidth: 0 }, { maxWidth: "100%" });
          tl.fromTo(widget.querySelector("div"), { opacity: 0 }, { opacity: 1 }, "-=1.5");
          tl.fromTo(
            widget,
            {
              "--progress-percentage": "0%",
            },
            { "--progress-percentage": "100%" }
          );
        },
      });
    });
  }
}

export class BuildCounterWidgetAnimation extends BuildAnimation {
  private elements: NodeListOf<HTMLElement>;
  private readonly duration: number = 2;
  constructor(options: AnimationOptions = {}) {
    super(options);
    options.moduleNames = ["gsap", "ScrollTrigger"];
    this.elements = document.querySelectorAll("[data-counter-animation]");
  }

  protected initCallback() {
    super.initCallback();

    this.animate();
  }

  private animate() {
    if (!this.elements.length) return;
    const gsap = this.core.moduleManager.getModule("gsap");

    this.elements.forEach((widget) => {
      // Получаем значение атрибута data-counter-animation
      const counterRange = widget.getAttribute("data-counter-animation");

      // Преобразуем строку "[0,100]" в массив [0, 100]
      const [startValue, endValue] = JSON.parse(counterRange || "[0, 100]");

      const tl = gsap.timeline({
        scrollTrigger: { trigger: widget, markers: false, start: "top 90%", end: "bottom top" },
        defaults: { ease: "slow(0.7,0.7,false)", duration: this.duration },
      });

      tl.fromTo(
        widget,
        { innerText: startValue },
        {
          innerText: endValue,
          modifiers: {
            innerText: function (num) {
              num = Math.round(num);
              return formatNumber(num, " ");
            },
          },
        }
      );
    });
  }
}

export class BuildCursorAnimation extends BuildAnimation {
  private cursorPosition = { left: 0, top: 0 };

  constructor(options: AnimationOptions = ({} = {})) {
    super(options);

    options.moduleNames = ["gsap"];
  }

  protected initCallback() {
    super.initCallback();
    this.animate();
  }

  private animate() {
    const gsap = this.core.moduleManager.getModule("gsap");

    // Инициализируем позиции и начальные масштабы для курсоров
    gsap.set(".cursor-dot", { scale: 0.1 });
    gsap.set(".cursor-outline", { scale: 0.5 });

    let isVisible = false;

    const updateCursor = () => {
      // Получаем элементы курсоров
      const cursorDot = document.querySelector(".cursor-dot") as HTMLElement;
      const cursorOutline = document.querySelector(".cursor-outline") as HTMLElement;

      if (!cursorDot || !cursorOutline) return;

      // Получаем размеры курсоров
      const cursorDotWidth = cursorDot.offsetWidth;
      const cursorDotHeight = cursorDot.offsetHeight;
      const cursorOutlineWidth = cursorOutline.offsetWidth;
      const cursorOutlineHeight = cursorOutline.offsetHeight;

      // Обновляем позиции курсоров относительно окна просмотра
      // # TODO не учитывается скролл, что не особо приятно глазу
      const cursorPositionDot = {
        left: this.cursorPosition.left - cursorDotWidth / 2,
        top: this.cursorPosition.top - cursorDotHeight / 2,
      };

      const cursorPositionOutline = {
        left: this.cursorPosition.left - cursorOutlineWidth / 2,
        top: this.cursorPosition.top - cursorOutlineHeight / 2,
      };

      if (!isVisible) {
        gsap.to(".cursor-outline, .cursor-dot", { opacity: 1, duration: 0.2 });
        isVisible = true;
      }

      gsap.to(".cursor-outline", {
        left: cursorPositionOutline.left,
        top: cursorPositionOutline.top,
        duration: 0.9,
        ease: "power2.out",
      });

      gsap.to(".cursor-dot", {
        left: cursorPositionDot.left,
        top: cursorPositionDot.top,
        duration: 0.4,
        ease: "power2.out",
      });
    };

    const mouseMove = (e) => {
      // Обновляем позицию курсора на основе координат мыши относительно окна просмотра
      // # TODO не учитывается скролл, что не особо приятно глазу
      this.cursorPosition = { left: e.clientX, top: e.clientY };
      updateCursor();
    };

    document.addEventListener("mousemove", mouseMove);
  }
}
