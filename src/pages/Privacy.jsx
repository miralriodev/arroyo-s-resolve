import styled from 'styled-components'
import Heading from '../components/atoms/Heading'
import Paragraph from '../components/atoms/Paragraph'
import LogoIcon from '../components/atoms/LogoIcon'

const Wrapper = styled.main`
  max-width: 840px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing?.(6) || '24px'};
  background: #ffffff;
`

const HeaderRow = styled.header`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing?.(4) || '16px'};
  margin-bottom: ${({ theme }) => theme.spacing?.(5) || '20px'};
`

const Section = styled.section`
  display: grid;
  gap: ${({ theme }) => theme.spacing?.(3) || '12px'};
  margin-bottom: ${({ theme }) => theme.spacing?.(5) || '20px'};
`

const Small = styled.small`
  color: ${({ theme }) => theme.colors?.mutedText || '#666'};
`

export default function Privacy() {
  return (
    <Wrapper>
      <HeaderRow>
        <LogoIcon size="64px" />
        <div>
          <Heading as="h1" level={1}>Aviso de Privacidad</Heading>
          <Small>Última actualización: {new Date().toLocaleDateString()}</Small>
        </div>
      </HeaderRow>

      <Section>
        <Heading as="h2" level={2}>Responsable del tratamiento</Heading>
        <Paragraph>
          Arroyo Seco ("nosotros") es responsable del tratamiento de los datos personales
          que usted nos proporciona, conforme a la legislación aplicable.
        </Paragraph>
      </Section>

      <Section>
        <Heading as="h2" level={2}>Datos que recolectamos</Heading>
        <Paragraph>
          Podemos solicitar nombre, correo electrónico, teléfono, preferencias de alojamiento y
          otra información necesaria para gestionar reservas, atención y mejoras del servicio.
        </Paragraph>
      </Section>

      <Section>
        <Heading as="h2" level={2}>Finalidades del tratamiento</Heading>
        <Paragraph>
          Utilizamos sus datos para: gestionar reservas y pagos, comunicarnos respecto a su
          estancia, brindar soporte, cumplir obligaciones legales y realizar mejoras del sitio.
        </Paragraph>
      </Section>

      <Section>
        <Heading as="h2" level={2}>Transferencias y terceros</Heading>
        <Paragraph>
          Podremos compartir datos con proveedores (por ejemplo, pasarela de pago, almacenamiento
          y analítica) estrictamente necesarios para prestar el servicio, bajo acuerdos de
          confidencialidad y seguridad.
        </Paragraph>
      </Section>

      <Section>
        <Heading as="h2" level={2}>Derechos ARCO</Heading>
        <Paragraph>
          Usted puede acceder, rectificar, cancelar u oponerse al tratamiento de sus datos.
          Para ejercer estos derechos, escriba a nuestro canal de contacto indicado en el sitio.
        </Paragraph>
      </Section>

      <Section>
        <Heading as="h2" level={2}>Conservación y seguridad</Heading>
        <Paragraph>
          Conservamos sus datos el tiempo necesario para las finalidades indicadas y aplicamos
          medidas técnicas y organizativas para protegerlos contra accesos no autorizados.
        </Paragraph>
      </Section>

      <Section>
        <Heading as="h2" level={2}>Cambios al aviso de privacidad</Heading>
        <Paragraph>
          Este aviso puede actualizarse. Cualquier cambio será publicado en esta página. Le
          recomendamos consultarlo periódicamente.
        </Paragraph>
      </Section>
    </Wrapper>
  )
}