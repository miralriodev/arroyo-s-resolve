import styled from 'styled-components'
import Button from '../atoms/Button'

const List = styled.ul`
  display: grid;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: 0;
  margin: 0;
`

const Item = styled.li`
  list-style: none;
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing(3)};
  border-radius: ${({ theme }) => theme.radius.md};
  background: #fff;
  display: grid;
  gap: ${({ theme }) => theme.spacing(2)};
  box-shadow: ${({ theme }) => theme.shadow.sm};
  transition: transform 120ms ease;
  &:hover { transform: translateY(-1px); }
`

const Row = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  flex-wrap: wrap;
`

export default function AccommodationList({ items, onEdit, onDelete }) {
  return (
    <List>
      {items.map(it => (
        <Item key={it.id}>
          <strong>{it.title}</strong> — ${it.price} — ★ {it.rating}
          <Row>
            <Button onClick={() => onEdit(it)}>Editar</Button>
            <Button onClick={() => onDelete(it.id)}>Eliminar</Button>
          </Row>
        </Item>
      ))}
    </List>
  )
}