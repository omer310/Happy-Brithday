import { useRef } from 'react'

const ASSETS = {
  male: '/male.png',
  female: '/female.png',
  flowerNpc: '/flowers-npc.png',
  bakeryNpc: '/bakery-npc.png',
  giftNpc: '/gifts-npc..png',
  terrain: '/terrain-v7.png',
  fruitTrees: '/fruit-trees.png',
  adobe: '/adobe-2.png',
  interior: '/city_inside.png',
  plants: '/plants.png',
  presents: '/Presents.png',
  nightSky: '/orig.png',
}

// Loads all local LPC sheets once. Keeping a single image registry means
// locations can share scenery and no transition flashes while new files load.
export const useGameImages = () => {
  const ref = useRef(null)
  if (!ref.current) {
    ref.current = Object.fromEntries(
      Object.entries(ASSETS).map(([key, src]) => {
        const image = new Image()
        image.src = src
        return [key, image]
      }),
    )
  }
  return ref.current
}
