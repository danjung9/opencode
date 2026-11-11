import { For, type ComponentProps } from "solid-js"
import { wordmarkLetters } from "../typography/wordmark/letters"

export const Mark = (props: { class?: string }) => (
  <svg
    data-component="logo-mark"
    class={props.class}
    viewBox="0 0 16 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M1.5 4L4.6 15.5L8 6L11.4 15.5L14.5 4"
      stroke="var(--icon-strong-base)"
      stroke-width="2.8"
      stroke-linejoin="round"
      stroke-linecap="round"
    />
  </svg>
)

export const Splash = (props: Pick<ComponentProps<"svg">, "ref" | "class">) => (
  <svg
    ref={props.ref}
    data-component="logo-splash"
    class={props.class}
    viewBox="0 0 80 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M7.5 20L23 77.5L40 30L57 77.5L72.5 20"
      stroke="var(--icon-strong-base)"
      stroke-width="14"
      stroke-linejoin="round"
      stroke-linecap="round"
    />
  </svg>
)

export const Logo = (props: { class?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 234 42"
    fill="var(--icon-strong-base)"
    class={props.class}
    role="img"
    aria-label="Warcode"
  >
    <For each={wordmarkLetters}>{(letter) => <path d={letter.stem} />}</For>
  </svg>
)
