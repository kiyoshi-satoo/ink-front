/**
 * Настройки для создания оглавления (TOC).
 * Примечание разработчикам. Данный сниппет работает только с уже предопределнными элементами h1, h2 (и классы .h1, .h2 и т.д) и т.д
 * для работа с другими элементами необходимо видоизменить код
 */
interface TOCOptions {
  /**
   * CSS-селектор для заголовков, которые будут добавлены в оглавление.
   * Например, "h1, h2, h3". По умолчанию — "h1, h2, h3, h4, h5, h6".
   */
  selector?: string;

  /**
   * Элемент, в который будет вставлено сгенерированное оглавление.
   * По умолчанию — `document.body`.
   */
  rootElement?: HTMLElement;

  /**
   * Элемент, из которого будут взяты заголовки для оглавления.
   * По умолчанию — `document.body`.
   */
  targetElement?: HTMLElement;
}

/**
 * Представляет элемент оглавления (TOC), включая текст заголовка, его уровень и дочерние элементы.
 */
class TocItem {
  text: string; // Текст заголовка
  level: number; // Уровень заголовка, например, 1 для h1
  id: string | null; // ID заголовка (для ссылок в TOC)
  parent: TocItem | null; // Родительский элемент (если есть)
  children: TocItem[]; // Дочерние элементы, если есть

  /**
   * Создает элемент TOC с текстом заголовка, уровнем и опциональным родительским элементом.
   */
  constructor(text: string, level: number, parent: TocItem | null = null) {
    this.text = text;
    this.level = level;
    this.id = null;
    this.parent = parent;
    this.children = [];
  }
}

/**
 * Генерирует оглавление (TOC) на основе заголовков HTML на странице.
 */
export class BuildToc {
  selector: string;
  rootElement: HTMLElement;
  targetElement: HTMLElement;

  /**
   * Создает экземпляр `BuildToc` с переданными параметрами.
   * @param options - Опции для конфигурации TOC (оглавления).
   */
  constructor(options: TOCOptions = {}) {
    this.selector = options.selector || "h1, h2, h3, h4, h5, h6";
    this.rootElement = options.rootElement || document.body;
    this.targetElement = options.targetElement || document.body;
    this.generateTOC();
    this.observeHeadings(); // Запускает наблюдение за заголовками для подсветки активного элемента
  }

  /**
   * Создает оглавление: находит заголовки, формирует структуру TOC и вставляет её в DOM.
   */
  generateTOC(): void {
    const headings = this.targetElement.querySelectorAll(this.selector) as NodeListOf<HTMLElement>;
    const tocData = this.parse(headings);
    const tocHTMLContent = this.build(tocData);
    const tocFragment = document.createRange().createContextualFragment(`${tocHTMLContent}`);
    this.rootElement.appendChild(tocFragment);
  }

  /**
   * Преобразует заголовки на странице в иерархическую структуру (TOC).
   * @param headingSet - Заголовки, которые будут добавлены в TOC.
   * @returns Список элементов TOC.
   */
  private parse(headingSet: NodeListOf<HTMLElement>): TocItem[] {
    const tocData: TocItem[] = [];
    const stack: TocItem[] = [];

    headingSet.forEach((heading) => {
      const level = heading.tagName.startsWith("H") ? parseInt(heading.tagName[1]) : this.getLevelFromClass(heading);
      const titleText = heading.innerText;

      if (!heading.id) {
        heading.id = titleText.replace(/\s+/g, "-").toLowerCase();
      }

      const currentItem = new TocItem(titleText, level);
      currentItem.id = heading.id;

      while (stack.length > 0 && stack[stack.length - 1].level >= level) {
        stack.pop();
      }

      if (stack.length === 0) {
        tocData.push(currentItem);
      } else {
        const parent = stack[stack.length - 1];
        parent.children.push(currentItem);
        currentItem.parent = parent;
      }

      stack.push(currentItem);
    });

    return tocData;
  }

  /**
   * Определяет уровень заголовка на основе его CSS-класса (например, "h1" для заголовка уровня 1).
   * @param element - Элемент заголовка.
   * @returns Уровень заголовка.
   */
  private getLevelFromClass(element: HTMLElement): number {
    const classList = Array.from(element.classList);
    for (const className of classList) {
      if (className.match(/^h[1-6]$/)) {
        return parseInt(className[1]);
      }
    }
    return 1; // Если класс не содержит информации о уровне, возвращаем 1
  }

  /**
   * Строит HTML-разметку для TOC на основе иерархической структуры заголовков.
   * @param tocData - Массив элементов TOC.
   * @returns HTML-разметка TOC в виде строки.
   */
  private build(tocData: TocItem[]): string {
    return `<ul>${tocData
      .map((item) => {
        const children = item.children.length ? this.build(item.children) : "";
        return `<li><a href="#${item.id}">${item.text}</a>${children}</li>`;
      })
      .join("")}</ul>`;
  }

  /**
   * Активирует текущий элемент TOC при пересечении заголовков в области видимости.
   */
  private observeHeadings(): void {
    const options = {
      root: null,
      rootMargin: "0px 0px -50% 0px",
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const tocLink = this.rootElement.querySelector(`a[href="#${entry.target.id}"]`);
        if (entry.isIntersecting && tocLink) {
          this.clearActiveClasses();
          tocLink.classList.add("is-active");
        }
      });
    }, options);

    const headings = this.targetElement.querySelectorAll(this.selector);
    headings.forEach((heading) => observer.observe(heading));
  }

  /**
   * Очищает активные классы у всех элементов TOC перед добавлением нового.
   */
  private clearActiveClasses(): void {
    const links = this.rootElement.querySelectorAll("a.is-active");
    links.forEach((link) => link.classList.remove("is-active"));
  }
}
