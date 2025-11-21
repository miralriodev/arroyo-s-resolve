import { ArrowRightIcon } from '@radix-ui/react-icons'
import styled from 'styled-components'
import Input from '../atoms/Input'
import { FieldLabel, FieldPill } from './PillFields'

const Wrapper = styled.form`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: ${({ theme }) => theme.spacing(3)};
  margin: ${({ theme }) => theme.spacing(4)} 0;
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`

const ActionCircle = styled.button`
  width: 48px;
  height: 48px;
  border-radius: 9999px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: #fff;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: none;
  cursor: pointer;
  &:hover { background: ${({ theme }) => theme.colors.surfaceAlt}; }
  &:focus { outline: none; box-shadow: 0 0 0 3px rgba(0,0,0,0.06); }
`

export function SearchBar({ onSearch }) {
  function handleSubmit(e) {
    e.preventDefault()
    const q = new FormData(e.currentTarget).get('q') || ''
    onSearch?.(q)
  }
  return (
    <Wrapper onSubmit={handleSubmit}>
      <FieldPill>
        <FieldLabel>Buscar</FieldLabel>
        <Input $bare name="q" placeholder="Servicios, categorías..." />
      </FieldPill>
      <ActionCircle type="submit" aria-label="Buscar">
        <ArrowRightIcon />
      </ActionCircle>
    </Wrapper>
  )
}

export default SearchBar