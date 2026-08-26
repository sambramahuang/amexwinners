import './CornerBrackets.css'

/** Four small crosshair marks pinned to the corners of a relatively-positioned parent. */
export default function CornerBrackets() {
  return (
    <>
      <span className="corner corner-tl" aria-hidden="true" />
      <span className="corner corner-tr" aria-hidden="true" />
      <span className="corner corner-bl" aria-hidden="true" />
      <span className="corner corner-br" aria-hidden="true" />
    </>
  )
}
