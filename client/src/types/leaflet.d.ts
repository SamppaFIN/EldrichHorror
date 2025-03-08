declare module 'leaflet' {
  export function map(element: HTMLElement | string, options?: any): any;
  export function tileLayer(url: string, options?: any): any;
  export function marker(latLng: [number, number], options?: any): any;
  export function circle(latLng: [number, number], options?: any): any;
  export function divIcon(options?: any): any;
  export class LatLng {
    constructor(lat: number, lng: number);
    lat: number;
    lng: number;
  }
  export class Map {
    setView(latLng: [number, number], zoom: number): this;
    addLayer(layer: any): this;
    removeLayer(layer: any): this;
    panTo(latLng: [number, number]): this;
    on(eventName: string, callback: Function): this;
    remove(): void;
  }
  export class Layer {
    addTo(map: Map): this;
    remove(): this;
    bindPopup(content: string): this;
    setLatLng(latLng: [number, number]): this;
  }
  export class Icon {
    constructor(options: any);
  }
}