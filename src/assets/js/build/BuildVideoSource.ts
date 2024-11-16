/**
 * Класс `BuildVideoSource` управляет источниками видео на странице,
 * подбирая подходящий вариант для текущего размера экрана.
 */
export class BuildVideoSource {
  private videos: HTMLVideoElement[];

  /**
   * Инициализирует `BuildVideoSource`, собирая все элементы <video> на странице.
   * При загрузке страницы автоматически устанавливает нужный источник видео и
   * превью, а также обновляет их при изменении размера окна.
   */
  constructor() {
    this.videos = Array.from(document.querySelectorAll("video"));

    if (this.videos.length) {
      this.updateAllVideoSources(); // Устанавливаем нужные видео при загрузке страницы
      window.addEventListener("resize", () => this.updateAllVideoSources()); // Обновляем при изменении размера окна
    }
  }

  /**
   * Обновляет источник и изображение превью (постер) для каждого видео
   * в зависимости от текущей ширины экрана.
   * Переключается между мобильной и десктопной версиями видео и постера.
   */
  private updateAllVideoSources() {
    this.videos.forEach((video) => {
      const videoSource = video.querySelector("source");
      const mobileVideo = video.getAttribute("data-mobile");
      const desktopVideo = video.getAttribute("data-desktop");
      const mobilePoster = video.getAttribute("data-mobile-poster");
      const desktopPoster = video.getAttribute("data-desktop-poster");

      // Проверяем ширину экрана и устанавливаем нужные версии видео и постера
      if (window.innerWidth < 768) {
        if (videoSource && mobileVideo) {
          videoSource.src = mobileVideo;
          video.poster = mobilePoster || "";
        }
      } else {
        if (videoSource && desktopVideo) {
          videoSource.src = desktopVideo;
          video.poster = desktopPoster || "";
        }
      }
      video.load();
    });
  }
}
