/**
 * Оборачивает элемент в указанный контейнер.
 *
 * @param {HTMLElement} el - Элемент, который нужно обернуть.
 * @param {HTMLElement} wrapper - Контейнер, в который будет обернут элемент.
 */
export const wrapElement = (el: HTMLElement, wrapper: HTMLElement): void => {
  el.parentNode?.insertBefore(wrapper, el);
  wrapper.appendChild(el);
};

/**
 * Преобразует строку, делая первую букву каждого слова заглавной.
 *
 * @param {string} str - Строка для преобразования.
 * @param {boolean} [lower=false] - Флаг, указывающий, нужно ли преобразовать строку в нижний регистр перед форматированием.
 * @returns {string} - Преобразованная строка с заглавными первыми буквами слов.
 */
export const capitalizeText = (str: string, lower: boolean = false): string => (lower ? str.toLowerCase() : str).replace(/(?:^|\s|["'([{])+\S/g, (match) => match.toUpperCase());

/**
 * Прокручивает контейнер по горизонтали к указанному элементу.
 *
 * @param {HTMLElement} container - Контейнер, в котором будет выполняться прокрутка.
 * @param {HTMLElement} target - Целевой элемент, к которому нужно прокрутить.
 */
export const scrollHorizontalToElement = (container: HTMLElement, target: HTMLElement): void => {
  if (container && target) {
    // Получаем смещение целевого элемента относительно контейнера
    const targetRect = target.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // Вычисляем позицию прокрутки
    const scrollTo = targetRect.left - containerRect.left + container.scrollLeft;

    // Прокручиваем контейнер к целевому элементу
    container.scrollTo({
      left: scrollTo,
      behavior: "smooth", // или 'auto' для мгновенной прокрутки
    });
  } else {
    console.error("Container or target element not found");
  }
};

/**
 * Дополняет число нулями слева до указанного количества символов.
 *
 * @param {number} num - Число для дополнения.
 * @param {number} places - Общее количество символов в результирующей строке.
 * @returns {string} - Строка, представляющая число с добавленными нулями слева.
 */
export const zeroPad = (num: number, places: number): string => String(num).padStart(places, "0");

/**
 * Форматирует число с разделителями каждые три цифры.
 *
 * @param {number} num - Число для форматирования.
 * @param {string} separator - Разделитель, который будет использоваться (например, пробел, запятая или точка).
 * @returns {string} - Форматированное число с разделителями.
 */
export const formatNumber = (num: number, separator: string): string => {
  const parts = num.toString().split(""); // Преобразуем число в массив символов
  let formattedNumber = "";

  // Формируем строку с разделителями каждые три цифры
  for (let i = parts.length - 1, count = 1; i >= 0; i--, count++) {
    formattedNumber = parts[i] + formattedNumber;
    if (count % 3 === 0 && i !== 0) {
      formattedNumber = separator + formattedNumber;
    }
  }

  return formattedNumber;
};

/**
 * Получает CSRF-токен из cookie.
 *
 * @returns {string | null} - Значение CSRF-токена, если он найден, иначе null.
 */
export function getCSRFToken(): string | null {
  const name = "csrftoken";
  const cookies = document.cookie.split(";");
  for (let cookie of cookies) {
    const trimmedCookie = cookie.trim();
    if (trimmedCookie.startsWith(name + "=")) {
      return trimmedCookie.substring(name.length + 1);
    }
  }
  return null;
}
