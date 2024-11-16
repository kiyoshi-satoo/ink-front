/**
 * Асинхронно загружает изображение из переданного объекта `imagesPath` по указанному названию файла.
 *
 * @param {Record<string, () => Promise<{ default: ImageMetadata }>>} imagesPath - Объект, где ключи — это пути к изображениям, а значения — функции для асинхронной загрузки метаданных изображения.
 * @param {string} filename - Название файла изображения, которое нужно найти и загрузить.
 * @returns {Promise<ImageMetadata>} - Обещание, которое возвращает метаданные изображения.
 * @throws {Error} - Выбрасывает ошибку, если изображение с указанным именем файла не найдено.
 */
export const getImageGlob = (imagesPath: Record<string, () => Promise<{ default: ImageMetadata }>>, filename: string) => {
  const imageKey = Object.keys(imagesPath).find((key) => key.endsWith(filename));

  if (!imageKey) {
    throw new Error(`"${filename}" does not exist in the provided images glob.`);
  }

  return imagesPath[imageKey]();
};

/**
 * Находит изображение в массиве изображений по его имени.
 *
 * @param {Array} images - Массив изображений, в котором будет происходить поиск.
 * @param {string} name - Название изображения, которое нужно найти.
 * @returns {any | null} - Возвращает изображение (метаданные или путь) или null, если изображение не найдено.
 */
export const getImageByName = (images, name) => {
  const image = images.find((img) => img.file && img.file.includes(name));
  return image ? image.default : null;
};
