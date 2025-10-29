import styled from 'styled-components'
import { Link } from 'react-router-dom'

const Card = styled.article`
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  box-shadow: ${({ theme }) => theme.shadow.sm};
  overflow: hidden;
  transition: transform 120ms ease;
  &:hover { transform: translateY(-2px); }
`

const Image = styled.img`
  width: 100%;
  height: 160px;
  object-fit: cover;
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    height: 140px;
  }
`

const Content = styled.div`
  padding: ${({ theme }) => theme.spacing(4)};
  display: grid;
  gap: ${({ theme }) => theme.spacing(2)};
`

const Title = styled.h3`
  margin: 0;
  font-size: 1.1rem;
`

const Meta = styled.div`
  display: flex;
  justify-content: space-between;
  color: ${({ theme }) => theme.colors.muted};
`

export function ServiceCard({ image, title, price, rating, to }) {
  const Inner = (
    <Card>
      <Image src={image} alt={title} />
      <Content>
        <Title>{title}</Title>
        <Meta>
          <span>${price}</span>
          <span>★ {rating}</span>
        </Meta>
      </Content>
    </Card>
  )
  return to ? <Link to={to} aria-label={`Ver ${title}`}>{Inner}</Link> : Inner
}

export default ServiceCard