import type { CookieConsentConfig } from "vanilla-cookieconsent";
import Core from "../Core";
const config: CookieConsentConfig = {
  cookie: {
    name: "cc_cookie",
  },

  onFirstConsent: ({ cookie }) => {
    console.log("onFirstConsent fired", cookie);
    localStorage.setItem("cookieConsentStatus", "given");
  },

  onConsent: ({ cookie }) => {
    console.log("onConsent fired!", cookie);
  },

  onChange: ({ changedCategories, changedServices }) => {
    console.log("onChange fired!", changedCategories, changedServices);
  },

  onModalReady: ({ modalName }) => {
    console.log("ready:", modalName);
  },

  onModalShow: ({ modalName }) => {
    if (modalName === "preferencesModal") {
      const pm = document.querySelector(".pm");
      if (!pm.classList.contains("initd")) {
        const closeButton = pm.querySelector(".pm__close-btn");
        const acceptAllButton = pm.querySelector('[data-role="all"]');
        const declineAllButton = pm.querySelector('[data-role="necessary"]');
        const saveButton = pm.querySelector('[data-role="save"]');

        const declineParent = declineAllButton.parentNode;
        const saveParent = saveButton.parentNode;

        const tempDecline = document.createElement("div");
        const tempSave = document.createElement("div");

        declineParent.replaceChild(tempDecline, declineAllButton);
        saveParent.replaceChild(tempSave, saveButton);

        // Перемещаем кнопки на новые места
        declineParent.replaceChild(saveButton, tempDecline);
        saveParent.replaceChild(declineAllButton, tempSave);

        pm.setAttribute("data-lenis-prevent", "");
        declineAllButton.classList.add("link", "link--2");
        acceptAllButton.classList.add("btn", "btn--outline", "btn--tm");
        saveButton.classList.add("btn", "btn--white", "btn--tm");
        closeButton.innerHTML = `<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M27 9L9 27M9 9L27 27" stroke="white" stroke-linecap="square" stroke-linejoin="round"/></svg>`;

        pm.classList.add("initd");
      }
      document.body.classList.add("locked");
    } else if (modalName === "consentModal") {
      const cm = document.querySelector(".cm");
      if (!cm.classList.contains("initd")) {
        const acceptAllButton = cm.querySelector('[data-role="all"]');
        const declineAllButton = cm.querySelector('[data-role="necessary"]');
        const showButton = cm.querySelector('[data-role="show"]');

        declineAllButton.classList.add("btn", "btn--outline");
        acceptAllButton.classList.add("btn", "btn--white");
        showButton.classList.add("link", "link--2");
        cm.classList.add("initd");
      }
    }
  },

  onModalHide: ({ modalName }) => {
    document.body.classList.remove("locked");
  },

  categories: {
    necessary: {
      enabled: true,
      readOnly: true,
    },
    analytics: {
      autoClear: {
        cookies: [
          {
            name: /^_ga/,
          },
          {
            name: /^_gid/,
          },
          {
            name: /^gat/,
          },
        ],
      },
      services: {
        ga: {
          label: "Google Analytics",
          onAccept: () => {
            console.log("Google Analytics onAccept");
          },
          onReject: () => {
            console.log("Google Analytics onReject");
          },
        },
      },
    },
    functionality: {},
    performance_and_analytics: {},
  },

  language: {
    default: "ru",
    translations: {
      ru: {
        consentModal: {
          title: "этот сайт использует cookies",
          description: 'продолжая использовать сайт, вы соглашаетесь с <a class="link link--2" href="/privacy-policy">политикой конфиденциальности</a>',
          acceptAllBtn: "принять все",
          acceptNecessaryBtn: "отклонить",
          showPreferencesBtn: "настроить",
        },
        preferencesModal: {
          title: "управление согласием <br/> <span class='text-tonal-white-30'> на использование файлов cookie </span",
          acceptAllBtn: "принять все",
          savePreferencesBtn: "принять выбранные",
          acceptNecessaryBtn: "отклонить",
          closeIconLabel: "Close modal",
          serviceCounterLabel: "Service|Services",
          sections: [
            {
              title: "необходимые файлы cookie",
              description: "эти элементы необходимы для обеспечения базовой функциональности веб-сайта",
              linkedCategory: "necessary",
            },
            {
              title: "функциональность",
              description: "эти файлы cookie нужны для улучшения производительности  сайта, но не являются необходимыми для его использования",
              linkedCategory: "functionality",
            },
            {
              title: "аналитика и персонализация",
              description: "эти файлы cookie собирают информацию об использовании сайта и помогают измерять эффективность маркетинговых кампаний",
              linkedCategory: "performance_and_analytics",
            },
          ],
        },
      },
    },
  },
};

export class BuildCookies {
  private core: Core;
  constructor() {
    this.core = Core.getInstance();
    this.init();
  }
  public init() {
    try {
      const modulePromises = [this.core.moduleManager.loadModule("vanilla-cookieconsent")];
      const loadedModules = Promise.all(modulePromises);

      loadedModules.then(() => {
        this.initCallback();
      });
    } catch (error) {
      console.error("Ошибка при инициализации модулей:", error);
    }
  }
  protected initCallback() {
    const cookieConsent = this.core.moduleManager.getModule("vanilla-cookieconsent");

    const consentStatus = localStorage.getItem("cookieConsentStatus");

    if (!consentStatus) {
      cookieConsent.run(config);
      setTimeout(() => {
        cookieConsent.show(true);
      }, 3000);
    }
  }
}
