export class BuildVideoWidget {
  private elements: NodeListOf<HTMLElement>;

  /** Время задержки перед загрузкой видео в мс */
  private readonly loadingDelay: number = 1500;

  constructor() {
    this.elements = document.querySelectorAll(".video-widget") as NodeListOf<HTMLElement>;
    this.init();
  }

  private init(): void {
    if (!this.elements.length) return;

    this.elements.forEach((element) => {
      this.setupVideoWidget(element);
    });
  }

  /**
   * @param element - HTML-элемент виджета, в котором есть кнопка и контейнер для видео.
   */
  private setupVideoWidget(element: HTMLElement): void {
    const playButton = element.querySelector("button") as HTMLButtonElement | null;
    const frameContainer = element.querySelector(".video-widget__frame") as HTMLElement | null;
    const videoUrl = element.getAttribute("data-url") || "";

    if (!playButton || !frameContainer || !videoUrl) return;

    playButton.addEventListener("click", () => {
      this.handlePlayButtonClick(playButton, frameContainer, videoUrl, element);
    });
  }

  /**
   * @param playButton - Кнопка воспроизведения, которая блокируется после нажатия.
   * @param frameContainer - Контейнер, в который будет добавлено видео.
   * @param videoUrl - URL видео, загружаемого в iframe.
   * @param widgetElement - Виджет, к которому добавляются классы загрузки и завершения загрузки.
   */
  private handlePlayButtonClick(playButton: HTMLButtonElement, frameContainer: HTMLElement, videoUrl: string, widgetElement: HTMLElement): void {
    playButton.disabled = true;
    widgetElement.classList.add("is-loading");

    const iframe = this.createIframe(videoUrl);

    setTimeout(() => {
      frameContainer.append(iframe);
      widgetElement.classList.remove("is-loading");
      widgetElement.classList.add("is-loaded");
    }, this.loadingDelay);
  }

  /**
   * @param url - URL видео для загрузки в iframe.
   * @returns iframe элемент с видео.
   */
  private createIframe(url: string): HTMLIFrameElement {
    const iframe = document.createElement("iframe");
    iframe.src = `${url}&autoplay=1`;
    iframe.allowFullscreen = true;
    iframe.allow = "autoplay";
    iframe.frameBorder = "0";

    return iframe;
  }
}
