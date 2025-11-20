import styled from 'styled-components'

const Svg = styled.svg`
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
`

export default function IconCheck(props) {
  return (
    <Svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M20 6L9 17l-5-5" />
    </Svg>
  )
}