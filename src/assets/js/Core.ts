declare global {
  interface Window {
    lenis: any;
    ResizeObserver: any;
  }
}

class ModuleManager {
  private static instance: ModuleManager;
  private modules: { [key: string]: any } = {};

  private constructor() {}

  public static getInstance(): ModuleManager {
    if (!this.instance) {
      this.instance = new ModuleManager();
    }
    return this.instance;
  }

  // Динамическая загрузка модулей с явными путями
  public async loadModule(moduleName: string): Promise<any> {
    if (!this.modules[moduleName]) {
      try {
        switch (moduleName) {
          case "gsap":
            const gsap = (await import("gsap")).gsap;
            this.modules[moduleName] = gsap;
            break;
          case "lenis":
            this.modules[moduleName] = (await import("lenis")).default;
            break;
          case "ScrollTrigger":
            // Проверяем, загружен ли gsap
            let gsapInstance = this.modules["gsap"];
            if (!gsapInstance) {
              gsapInstance = (await import("gsap")).gsap;
              this.modules["gsap"] = gsapInstance;
            }
            const { ScrollTrigger } = await import("gsap/ScrollTrigger");
            gsapInstance.registerPlugin(ScrollTrigger);
            this.modules[moduleName] = ScrollTrigger;
            break;
          // case "simplebar":
          //   this.modules[moduleName] = await import("simplebar");
          //   await import("simplebar/dist/simplebar.css");
          //   break;
          case "slugify":
            this.modules[moduleName] = (await import("slugify")).default;
            break;
          case "vanilla-cookieconsent":
            this.modules[moduleName] = await import("vanilla-cookieconsent");
            break;
          case "intl-tel-input":
            this.modules[moduleName] = (await import("intl-tel-input")).default;
            break;
          default:
            throw new Error(`Unknown module: ${moduleName}`);
        }
      } catch (error) {
        console.error(`Error loading module "${moduleName}":`, error);
        throw error;
      }
    }
    return this.modules[moduleName];
  }

  // Получение ранее загруженного модуля
  public getModule(moduleName: string): any {
    const module = this.modules[moduleName];
    if (!module) {
      throw new Error(`Module "${moduleName}" is not loaded yet.`);
    }
    return module;
  }

  // Проверка, загружен ли модуль
  public isModuleLoaded(moduleName: string): boolean {
    return !!this.modules[moduleName];
  }

  // Удаление загруженного модуля из кэша
  public unloadModule(moduleName: string): void {
    if (this.modules[moduleName]) {
      delete this.modules[moduleName];
      console.log(`Module "${moduleName}" has been unloaded.`);
    } else {
      console.warn(`Module "${moduleName}" was not loaded.`);
    }
  }
}
class ScrollController {
  public lenis: any;
  private lastDirection: number;

  constructor() {
    this.lastDirection = 1;
  }

  public async initialize(): Promise<void> {
    const moduleNames = ["lenis", "gsap", "ScrollTrigger"];
    const moduleManager = ModuleManager.getInstance();

    // Ожидаем загрузки всех модулей перед продолжением
    await Promise.all(moduleNames.map((mn) => moduleManager.loadModule(mn)));

    const gsap = moduleManager.getModule("gsap");
    const Lenis = moduleManager.getModule("lenis");
    const ScrollTrigger = moduleManager.getModule("ScrollTrigger");

    // Инициализация Lenis и привязка событий
    this.lenis = new Lenis({
      syncTouch: true,
      syncTouchLerp: 0.1,
      touchInertiaMultiplier: 12,
      smoothWheel: true,
    });

    this.lenis.on("scroll", this.handleScroll.bind(this));
    this.lenis.on("scroll", ScrollTrigger.update);

    // Привязываем lenis к gsap
    gsap.ticker.add((time) => {
      this.lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
    this.lastDirection = window.scrollY;

    // Инициализация якорей
    this.initAnchors();
  }
  private initAnchors() {
    const hash = window.location.hash;
    document.querySelectorAll("[data-scroll-top]").forEach((button) => {
      button.addEventListener("click", () => {
        this.lenis.scrollTo(0, {
          easing: function (t) {
            return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
          },
          duration: 2,
        });
      });
    });
    document.querySelectorAll('a[href^="#"], a[href^="/#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        e.preventDefault();
        const burger = document.querySelector(".header__burger") as HTMLElement;
        burger.toggleInstance.toggleToClass("is-menu-close");
        document.body.classList.remove("locked");

        const target = anchor.getAttribute("href").replace(/^\//, ""); // Убираем слеш, если есть
        this.lenis.scrollTo(target);
      });
    });

    if (hash) {
      const target = document.querySelector(hash);
      if (target) {
        setTimeout(() => {
          this.lenis.scrollTo(target);
        }, 300);
      }
    }
  }
  private handleScroll(): void {
    const currentScrollY = window.scrollY;
    const direction = currentScrollY > this.lastDirection ? 1 : currentScrollY < this.lastDirection ? -1 : 0;

    if (direction !== 0 && direction !== this.lastDirection) {
      document.body.classList.toggle("scrolling-down", direction > 0);
      document.body.classList.toggle("scrolling-up", direction < 0);
      this.lastDirection = currentScrollY;
    }

    if (currentScrollY === 0) {
      document.body.classList.remove("scrolling-up", "scrolling-down");
    }
  }
}
class ViewportController {
  private header: HTMLElement;
  private footer: HTMLElement;
  constructor() {
    this.header = document.querySelector("header");
    this.footer = document.querySelector("footer");
    this.updateViewportSize();
    this.updateHeaderFooterHeights();

    window.addEventListener("resize", () => {
      this.updateViewportSize();
      this.updateHeaderFooterHeights();
    });
  }

  private updateViewportSize(): void {
    const vh = window.innerHeight * 0.01;
    const vw = document.body.clientWidth * 0.01;
    document.documentElement.style.setProperty("--doc-height", `${vh}px`);
    document.documentElement.style.setProperty("--doc-width", `${vw}px`);
  }

  private updateHeaderFooterHeights(): void {
    document.documentElement.style.setProperty("--header-height", `${this.header.offsetHeight}px`);
    document.documentElement.style.setProperty("--footer-height", `${this.footer.offsetHeight}px`);
  }
}
class MetaViewportController {
  constructor() {
    this.updateMetaViewport();
    window.addEventListener("resize", this.updateMetaViewport);
  }

  private updateMetaViewport(): void {
    const metaViewport = document.querySelector('meta[name="viewport"]') as HTMLMetaElement | null;
    if (window.screen.width < 393) {
      metaViewport.content = `width=${window.screen.width}, initial-scale=1`;
    } else {
      metaViewport.content = "width=device-width, initial-scale=1";
    }
  }
}

class Core {
  private static instance: Core;
  public moduleManager: ModuleManager;
  public scrollController: ScrollController;
  private viewportController: ViewportController;
  private metaViewportController: MetaViewportController;

  private constructor() {
    this.moduleManager = ModuleManager.getInstance();
    this.scrollController = new ScrollController();
    this.viewportController = new ViewportController();
    this.metaViewportController = new MetaViewportController();
  }
  public static getInstance(): Core {
    if (!this.instance) {
      this.instance = new Core();
    }
    return this.instance;
  }
  public async init(): Promise<void> {
    await this.scrollController.initialize();
    // await this.initializeSimpleBar();
  }
  // private async initializeSimpleBar(): Promise<void> {
  //   const moduleManager = ModuleManager.getInstance();
  //   const SimpleBar = await moduleManager.loadModule("simplebar");

  //   const elements = [...document.querySelectorAll(".menu .menu"), ...document.querySelectorAll(".sidebar-menu-wrapper")];
  //   elements.forEach((el) => new SimpleBar(el, { autoHide: false }));
  // }
}

export default Core;
