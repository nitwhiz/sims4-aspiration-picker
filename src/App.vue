<template>
  <div id="app">
    <h1>The Sims 4 Aspiration Picker</h1>
    <div class="settings">
      <div :class="['switch', cycling ? 'disabled' : 'enabled']">
        <div :class="['option', adult ? 'active' : 'inactive']" @click="setAdult(true)">Adult</div>
        <div :class="['option', adult ? 'inactive' : 'active']" @click="setAdult(false)">Child</div>
      </div>
    </div>
    <div class="picker">
      <div class="window">
        <div class="aspirations-wrapper" ref="aWrapper">
          <div class="aspiration" v-for="a in aspirationWindow" :key="a.slug">
            <div class="image">
              <img :src="getImagePath(a)" alt="">
            </div>
            <div class="label">
              <span>{{ getLabel(a) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="controls">
      <div :class="['start', cycling ? 'disabled' : 'enabled']" @click="startCycle">
        Pick Aspiration
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import aspirations from '@/assets/data/aspirations.json';

interface Aspiration {
  slug: string;
  names: {
    en: string;
  },
  adultOnly: boolean;
}

type Language = 'en';

@Component
export default class App extends Vue {
  private static readonly windowSize = 100;

  private currentIndex = 0;

  private language: Language = 'en';

  private adult = true;

  private aspirationWrapper!: HTMLDivElement;

  private speed = 0;

  private cycling = false;

  public mounted(): void {
    this.aspirationWrapper = this.$refs.aWrapper as HTMLDivElement;
  }

  private startCycle(): void {
    if (this.cycling) {
      return;
    }

    this.speed = 60 + 30 * Math.random();

    this.aspirationWrapper.classList.remove('zero');
    this.aspirationWrapper.style.top = '0px';

    this.cycling = true;

    this.cycle();
  }

  private cycle(): void {
    this.aspirationWrapper.style.top = `${parseInt(this.aspirationWrapper.style.top, 10) - this.speed}px`;

    if (this.aspirationWrapper.offsetTop <= -App.windowSize) {
      this.currentIndex += 1;
      this.currentIndex %= this.filteredAspirations.length;
      this.aspirationWrapper.style.top = `${parseInt(this.aspirationWrapper.style.top, 10) + App.windowSize}px`;
    }

    this.speed /= 1.007;

    if (this.speed <= 1) {
      this.aspirationWrapper.style.top = '0px';
      this.aspirationWrapper.classList.add('zero');

      this.cycling = false;
    } else {
      window.setTimeout(() => {
        this.cycle();
      }, 16);
    }
  }

  private setAdult(adult: boolean): void {
    if (!this.cycling) {
      this.adult = adult;
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private static get shuffledAspirations(): Aspiration[] {
    const r = [...aspirations];

    for (let i = r.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [r[i], r[j]] = [r[j], r[i]];
    }
    return r;
  }

  private get filteredAspirations(): Aspiration[] {
    return App.shuffledAspirations.filter((a) => a.adultOnly === this.adult);
  }

  private get aspirationWindow(): Aspiration[] {
    const maxIndex = this.filteredAspirations.length;
    const result = [];

    for (let i = 0; i < 2; i += 1) {
      let aIndex = (this.currentIndex + i) % maxIndex;

      if (aIndex < 0) {
        aIndex += maxIndex;
      }

      result.push(this.filteredAspirations[aIndex]);
    }

    return result;
  }

  // eslint-disable-next-line class-methods-use-this
  private getImagePath(aspiration: Aspiration): string {
    // eslint-disable-next-line global-require,import/no-dynamic-require
    return require(`@/assets/images/${aspiration.slug}.png`);
  }

  private getLabel(aspiration: Aspiration): string {
    return aspiration.names[this.language] || aspiration.names.en;
  }
}
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700&display=swap');

* {
  box-sizing: border-box;
}

body {
  font-family: 'Nunito', sans-serif;
  font-weight: 400;

  background: #242424;
  color: white;

  display: flex;
  justify-content: center;
  align-items: center;
}

#app {
  width: 100%;
  max-width: 1000px;
}

h1 {
  text-align: center;
  margin-bottom: 40px;
}

.settings {
  margin-bottom: 24px;

  display: flex;

  justify-content: center;

  .switch {
    background: #7ba8e3;

    border-radius: 6px;

    display: flex;

    padding: 4px;

    font-size: 22px;

    .option {
      padding: 4px 8px;
      border-radius: 6px;

      cursor: pointer;

      &.active {
        background: #103461;
      }
    }

    &.disabled {
      cursor: default;
      opacity: .5;

      .option {
        cursor: default;
      }
    }
  }
}

$windowSize: 100px;

.picker {
  box-shadow: 0 0 8px #222;

  background: #1c4d8c;
  border-radius: 12px;

  padding: 12px;

  .window {
    position: relative;

    width: 100%;
    height: $windowSize;

    background: #7ba8e3;
    border-radius: 10px;
    overflow: hidden;

    .aspirations-wrapper {
      &.zero {
        transition-property: top;
        transition-duration: 300ms;
      }

      width: 100%;

      position: absolute;

      top: 0;

      display: flex;
      align-items: center;
      flex-direction: column;

      .aspiration {
        display: flex;

        padding: 0 12px 0 24px;

        align-items: center;

        .image {
          display: flex;
          align-items: center;
          justify-content: center;

          margin-right: 24px;

          border-radius: 8px;
          background: #c2ddff;

          height: 80px;
          width: 80px;

          border: 3px solid #2a5d9a;

          img {
            width: 64px;
            height: auto;

            display: block;
            border: 0;
          }
        }

        .label {
          height: $windowSize;

          display: flex;
          align-items: center;

          font-size: 32px;
          font-weight: 700;
          line-height: 34px;

          color: white;
          text-shadow: 0 0 2px #103461;
        }
      }
    }
  }
}

.controls {
  display: flex;
  justify-content: center;

  margin-top: 24px;

  .start {
    cursor: pointer;

    background: #54a356;
    border-radius: 6px;

    padding: 8px 18px;

    font-size: 24px;
    font-weight: 700;

    &.enabled:hover {
      background: lighten(#54a356, 5%);
    }

    &.disabled {
      cursor: default;
      opacity: .5;
    }
  }
}
</style>
