/**
 * Возвращает функцию, которая ограничивает частоту вызова функции `func`, вызывая её не чаще, чем раз в указанный промежуток времени `wait`.
 * После окончания ожидания `wait` будет вызвана последняя запланированная функция.
 *
 * @param {Function} func - Функция, частоту вызова которой нужно ограничить.
 * @param {number} [wait=50] - Задержка в миллисекундах перед тем, как можно будет снова вызвать функцию.
 * @param {boolean} [immediate=false] - Если true, вызывает функцию сразу, а затем начинает отсчёт задержки.
 * @returns {Function} - Ограниченная по частоте вызова функция.
 */
export function debounce<T extends (...args: any[]) => void>(func: T, wait = 50, immediate = false): () => void {
  let timeout: any;
  return function (this: any, ...args: any[]): void {
    const context = self;
    const later = () => {
      timeout = null;
      if (!immediate) {
        func.apply(context, args);
      }
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) {
      func.apply(context, args);
    }
  };
}

/**
 * Генерирует случайный идентификатор длиной 8 символов.
 *
 * @returns {string} - Случайная строка из 8 символов, например, "q1w2e3r4".
 */
export function generateID(): string {
  return Math.random().toString(36).substring(2, 10);
}

/**
 * Разбивает массив на более мелкие массивы указанного размера.
 *
 * @param {Array} array - Массив, который нужно разбить.
 * @param {number} size - Размер каждого подмассива.
 * @returns {Array[]} - Массив подмассивов, каждый из которых имеет заданный размер.
 */
export function chunkArray<T>(array: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

/**
 * Проверяет, одинаковы ли два значения, независимо от их типа и структуры.
 *
 * @param {any} a - Первое значение для сравнения.
 * @param {any} b - Второе значение для сравнения.
 * @returns {boolean} - true, если значения идентичны; иначе false.
 */
export function isEqual(a: any, b: any): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Преобразует строку в kebab-case (с маленькими буквами и дефисами вместо пробелов).
 *
 * @param {string} str - Строка для преобразования.
 * @returns {string} - Строка в формате kebab-case, например, "my-string".
 */
export function kebabCase(str: string): string {
  const result = str.replace(/[A-Z\u00C0-\u00D6\u00D8-\u00DE]/g, (match) => "-" + match.toLowerCase());
  return str[0] === str[0].toUpperCase() ? result.substring(1) : result;
}
