import styled from 'styled-components'

const Wrapper = styled.form`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: ${({ theme }) => theme.spacing(3)};
  margin: ${({ theme }) => theme.spacing(4)} 0;
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`

const Input = styled.input`
  padding: ${({ theme }) => theme.spacing(3)};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.sm};
`

const Button = styled.button`
  padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(5)};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.sm};
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    width: 100%;
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