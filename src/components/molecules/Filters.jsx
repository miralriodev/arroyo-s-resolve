import styled from 'styled-components'
import Select from '../atoms/Select'
import { FieldPill, FieldLabel } from './PillFields'

const Wrapper = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
  flex-wrap: wrap;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: column;
  }
`

const SelectWrap = styled.div`
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
      <SelectWrap>
        <FieldPill>
          <FieldLabel>Categoría</FieldLabel>
          <Select $bare name="categoria" onChange={handleChange} defaultValue="">
            <option value="">Todas</option>
            <option value="alojamiento">Alojamiento</option>
            <option value="experiencia">Experiencia</option>
          </Select>
        </FieldPill>
      </SelectWrap>
      <SelectWrap>
        <FieldPill>
          <FieldLabel>Precio</FieldLabel>
          <Select $bare name="precio" onChange={handleChange} defaultValue="">
            <option value="">Cualquiera</option>
            <option value="asc">Menor precio</option>
            <option value="desc">Mayor precio</option>
          </Select>
        </FieldPill>
      </SelectWrap>
      <SelectWrap>
        <FieldPill>
          <FieldLabel>Ubicación</FieldLabel>
          <Select $bare name="ubicacion" onChange={handleChange} defaultValue="">
            <option value="">Cualquiera</option>
            <option value="centro">Centro</option>
            <option value="periferia">Periferia</option>
          </Select>
        </FieldPill>
      </SelectWrap>
    </Wrapper>
  )
}

export default Filters