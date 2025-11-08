import styled from 'styled-components'
import Input from '../atoms/Input'
import Button from '../atoms/Button'

const Wrapper = styled.form`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: ${({ theme }) => theme.spacing(3)};
  margin: ${({ theme }) => theme.spacing(4)} 0;
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`

export function SearchBar({ onSearch }) {
  function handleSubmit(e) {
    e.preventDefault()
    const q = new FormData(e.currentTarget).get('q') || ''
    onSearch?.(q)
  }
  return (
    <Wrapper onSubmit={handleSubmit}>
      <Input name="q" placeholder="Buscar servicios..." />
      <Button type="submit">Buscar</Button>
    </Wrapper>
  )
}

export default SearchBar