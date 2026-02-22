/// <reference types="react-scripts" />

declare module 'sockjs-client' {
  const SockJS: {
    new (url: string): unknown;
  };
  export default SockJS;
}
