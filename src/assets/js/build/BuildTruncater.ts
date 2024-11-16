/**
 * Класс, отвечающий за сокращение контента контейнеров с классом ".sh-more-container".
 * Сокращает контент, ограничивая количество видимых строк в зависимости от высоты контейнера.
 */
export class BuildTruncater {
  private containers: NodeListOf<HTMLElement>;

  constructor() {
    // Выбираем все контейнеры с классом ".sh-more-container"
    this.containers = document.querySelectorAll(".sh-more-container");
    this.initializeContainers();
  }

  /**
   * Определяет, сколько элементов массива в сумме приблизятся к заданному значению, не превышая его.
   * @param arr - Массив чисел для суммирования.
   * @param target - Целевая сумма.
   * @returns Объект, содержащий количество элементов и их сумму.
   */
  private minElementsToReachSum(arr: number[], target: number): { count: number; sum: number } {
    let sum = 0;
    let count = 0;

    for (const num of arr) {
      sum += num;
      count++;
      if (sum > target) {
        count--;
        sum -= num;
        break;
      }
    }
    return { count, sum };
  }

  /**
   * # TODO багуется на резиновой верстке. Предусмотреть возможность высоты в REM
   * Рассчитывает общую высоту внешних отступов (сверху и снизу) для указанного элемента.
   * @param el - HTML элемент.
   * @returns Общая высота отступов.
   */
  private getMarginHeight(el: HTMLElement): number {
    const style = window.getComputedStyle(el);
    return parseFloat(style.marginTop) + parseFloat(style.marginBottom);
  }

  /**
   * Рассчитывает высоту строки для указанного элемента, создавая временный элемент.
   * @param el - HTML элемент, для которого вычисляется высота строки.
   * @returns Высота строки в пикселях.
   */
  private getLineHeight(el: HTMLElement): number {
    const temp = document.createElement(el.nodeName as keyof HTMLElementTagNameMap);
    temp.setAttribute("style", "margin:0; padding:0; visibility: hidden; position: absolute;");
    temp.innerHTML = "A";

    el.parentNode?.appendChild(temp);
    const lineHeight = temp.clientHeight;
    temp.parentNode?.removeChild(temp);

    return lineHeight;
  }

  /**
   * Считает количество строк в элементе, деля высоту элемента на высоту строки.
   * @param el - HTML элемент.
   * @returns Количество строк в элементе.
   */
  private countLines(el: HTMLElement): number {
    const divHeight = el.offsetHeight;
    const lineHeight = this.getLineHeight(el);
    return Math.ceil(divHeight / lineHeight);
  }

  /**
   * Инициализирует сокращение контента для всех контейнеров.
   */
  private initializeContainers(): void {
    this.containers.forEach((container) => {
      const isMobile = window.innerWidth < 1024;
      const maxHeight = isMobile ? parseInt(container.dataset.maxHeightMobile ?? "0", 10) : parseInt(container.dataset.maxHeightDesktop ?? "0", 10);
      const actualHeight = container.offsetHeight;
      const button = container.nextElementSibling as HTMLElement;

      this.truncate(container, maxHeight);

      // Добавляем функционал для разворачивания/сворачивания контента
      if (maxHeight < actualHeight) {
        button.addEventListener("click", () => {
          if (container.classList.contains("is-expanded")) {
            this.truncate(container, maxHeight);
            container.classList.remove("is-expanded");
          } else {
            container.style.maxHeight = `${actualHeight}px`;
            container.style.removeProperty("-webkit-line-clamp");
            container.classList.add("is-expanded");
          }
        });
        container.classList.add("is-truncatable");
      } else {
        button.style.display = "none";
        container.classList.remove("is-truncatable");
      }
    });
  }

  /**
   * Сокращает контент контейнера так, чтобы он не превышал указанную максимальную высоту.
   * @param container - Контейнер для сокращения.
   * @param maxHeight - Максимальная высота, до которой нужно сократить контент.
   */
  private truncate(container: HTMLElement, maxHeight: number): void {
    const lineHeightsArray: number[] = [];

    // Собираем высоты строк для всех дочерних элементов
    for (const element of Array.from(container.children) as HTMLElement[]) {
      const lineHeightOfElement = this.getLineHeight(element);
      const marginHeight = this.getMarginHeight(element);
      const lines = this.countLines(element);

      for (let line = 0; line < lines; line++) {
        lineHeightsArray.push(lineHeightOfElement + (line === 0 ? marginHeight : 0));
      }
    }

    // Определяем, сколько элементов поместится в пределах maxHeight
    const { sum, count } = this.minElementsToReachSum(lineHeightsArray, maxHeight);

    // Применяем стили для сокращения
    container.style.maxHeight = `${sum}px`;
    this.applyTruncationStyles(container, count);
  }

  /**
   * Применяет необходимые CSS-стили для сокращения контента.
   * @param container - Элемент контейнера.
   * @param lineClampCount - Количество строк для отображения.
   */
  private applyTruncationStyles(container: HTMLElement, lineClampCount: number): void {
    container.style.display = "-webkit-box";
    container.style.webkitBoxOrient = "vertical";
    container.style.overflow = "hidden";
    container.style.webkitLineClamp = lineClampCount.toString();
  }
}
