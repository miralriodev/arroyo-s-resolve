import styled from 'styled-components'

const Svg = styled.svg`
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
`

export default function IconX(props) {
  return (
    <Svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M18 6L6 18M6 6l12 12" />
    </Svg>
  )
}