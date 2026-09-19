// Transition `homeToProject` (source `zo`, theme.js 16982-17005).
import { store } from "../../core/store";
import { Transition, removeView, type TransitionInArgs, type TransitionOutArgs } from "./base";

export class HomeToProjectTransition extends Transition {
  in({ done }: TransitionInArgs) {
    (store.AssetLoader!.loaded as Promise<void>).then(() => {
      store.PageLoader.hide().then(() => {
        done();
      });
    });
  }

  out({ from, done }: TransitionOutArgs) {
    store.Highway.cached = store.Highway.cache.has(store.Highway.location.href);
    store.PageLoader.show().then(() => {
      if (store.Audio!.isPlaying("audio.backing"))
        store.Audio!.filterTo({
          key: "audio.backing",
          duration: 1800,
          type: "lowpass",
          from: { frequency: 14e3 },
          to: { frequency: 160 },
        });
      removeView(from);
      done();
    });
  }
}

export default HomeToProjectTransition;
