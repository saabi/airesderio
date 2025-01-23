<script lang="ts">
    import type { Snippet } from 'svelte';
  
    let { slides } = $props<{ slides: Snippet[] }>();
    let currentIndex = $state<number>(0);
    
    function next(): void {
      currentIndex = (currentIndex + 1) % slides.length;
    }
  
    function previous(): void {
      currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    }
  
    function goTo(index: number): void {
      if (index >= 0 && index < slides.length) currentIndex = index;
    }
  </script>
  
  <div class="carousel-container">
    <div class="slider-track">
      <div 
        class="slider"
        style="transform: translateX(-{currentIndex * 100}%)"
      >
        {#each slides as slide, i (i)}
          <div class="slide">
            {@render slide()}
          </div>
        {/each}
      </div>
    </div>
  
    <button class="nav-button prev" on:click={previous}>&#10094;</button>
    <button class="nav-button next" on:click={next}>&#10095;</button>
  
    <div class="dots-container">
      {#each slides as _, i (i)}
        <button
          class="dot"
          class:active={currentIndex === i}
          on:click={() => goTo(i)}
        />
      {/each}
    </div>
  </div>
  
  <style>
    .carousel-container {
      position: relative;
      overflow: hidden;
      width: 100%;
      display: grid;
      align-items: center;
    }
  
    .slider-track {
      width: 100%;
      overflow: hidden;
      grid-area: 1 / 1;
    }
  
    .slider {
      display: flex;
      transition: transform 0.5s ease-in-out;
      height: min-content;
    }
  
    .slide {
      flex: 0 0 100%;
      width: 100%;
      min-height: min-content;
      display: grid;
      place-items: center;
      padding: 1rem;
      box-sizing: border-box;
    }
  
    .nav-button {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(0, 0, 0, 0.3);
      color: white;
      border: none;
      padding: 15px;
      cursor: pointer;
      font-size: 24px;
      border-radius: 3px;
      transition: background 0.3s ease;
      z-index: 1;
    }
  
    .nav-button:hover {
      background: rgba(0, 0, 0, 0.6);
    }
  
    .prev { left: 10px; }
    .next { right: 10px; }
  
    .dots-container {
      position: absolute;
      bottom: 15px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 8px;
      z-index: 1;
    }
  
    .dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: none;
      background: rgba(255, 255, 255, 0.5);
      cursor: pointer;
      padding: 0;
      transition: all 0.3s ease;
    }
  
    .dot.active, .dot:hover {
      background: rgba(255, 255, 255, 0.9);
      transform: scale(1.2);
    }
</style>