import styled from 'styled-components'

const Wrapper = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
  flex-wrap: wrap;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: column;
  }
`

const Select = styled.select`
  padding: ${({ theme }) => theme.spacing(3)};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.sm};
  background: #fff;
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    width: 100%;
  }
`

export function Filters({ onChange }) {
  function handleChange(e) {
    const form = e.currentTarget.closest('form')
    const data = new FormData(form || undefined)
    const filters = Object.fromEntries(data.entries())
    onChange?.(filters)
  }
  return (
    <Wrapper>
      <Select name="categoria" onChange={handleChange} defaultValue="">
        <option value="">Categoría</option>
        <option value="alojamiento">Alojamiento</option>
        <option value="experiencia">Experiencia</option>
      </Select>
      <Select name="precio" onChange={handleChange} defaultValue="">
        <option value="">Precio</option>
        <option value="asc">Menor precio</option>
        <option value="desc">Mayor precio</option>
      </Select>
      <Select name="ubicacion" onChange={handleChange} defaultValue="">
        <option value="">Ubicación</option>
        <option value="centro">Centro</option>
        <option value="periferia">Periferia</option>
      </Select>
    </Wrapper>
  )
}

export default Filters