import { For, type ComponentProps } from "solid-js"
import { wordmarkLetters } from "../typography/wordmark/letters"
import seal from "../assets/branding/dod-seal.png"

export const Mark = (props: { class?: string }) => (
  <svg
    data-component="logo-mark"
    class={props.class}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <image href={seal} width="100" height="100" />
  </svg>
)

export const Splash = (props: Pick<ComponentProps<"svg">, "ref" | "class">) => (
  <svg
    ref={props.ref}
    data-component="logo-splash"
    class={props.class}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <image href={seal} width="100" height="100" />
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
