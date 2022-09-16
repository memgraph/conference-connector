export declare type ImageLoadedCallback = (error?: Error) => void;
export declare class ImageHandler {
    private static _instance;
    private readonly _imageByUrl;
    private constructor();
    static getInstance(): ImageHandler;
    getImage(url: string): HTMLImageElement | undefined;
    loadImage(url: string, callback?: ImageLoadedCallback): HTMLImageElement;
    loadImages(urls: string[], callback?: ImageLoadedCallback): HTMLImageElement[];
}
