import styled from 'styled-components'
import Button from '../atoms/Button'
import Input from '../atoms/Input'
import Textarea from '../atoms/Textarea'

const Card = styled.div`
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  box-shadow: ${({ theme }) => theme.shadow.md};
  padding: ${({ theme }) => theme.spacing(5)};
`

const Form = styled.form`
  display: grid;
  gap: ${({ theme }) => theme.spacing(3)};
`

const Row = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: column;
  }
`

export default function AccommodationForm({ form, onChange, onSubmit, editing, onCancel }) {
  return (
    <Card>
      <Form onSubmit={onSubmit}>
      <Input placeholder="Título" value={form.title} onChange={e => onChange({ ...form, title: e.target.value })} required />
      <Textarea placeholder="Descripción" value={form.description} onChange={e => onChange({ ...form, description: e.target.value })} />
      <Row>
        <Input type="number" placeholder="Precio" value={form.price} onChange={e => onChange({ ...form, price: Number(e.target.value) })} />
        <Input type="number" placeholder="Rating" value={form.rating} onChange={e => onChange({ ...form, rating: Number(e.target.value) })} />
      </Row>
      <Row>
        <Input placeholder="Categoría" value={form.category} onChange={e => onChange({ ...form, category: e.target.value })} />
        <Input placeholder="Ubicación" value={form.location} onChange={e => onChange({ ...form, location: e.target.value })} />
      </Row>
      <Input placeholder="URL de imagen" value={form.image_url} onChange={e => onChange({ ...form, image_url: e.target.value })} />
      <Row>
        <Button type="submit">{editing ? 'Actualizar' : 'Crear'} alojamiento</Button>
        {editing && <Button type="button" onClick={onCancel}>Cancelar edición</Button>}
      </Row>
      </Form>
    </Card>
  )
}