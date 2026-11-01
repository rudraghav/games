/** Shared static atlases work in Services, Storybook and the local app. */
export function optimizeCardArt(src: string) {
  return src.replace(/\.png$/, '.webp');
}
