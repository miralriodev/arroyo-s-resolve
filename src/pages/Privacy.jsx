import styled from 'styled-components'
import Heading from '../components/atoms/Heading'
import Paragraph from '../components/atoms/Paragraph'

const Wrapper = styled.main`
  max-width: 840px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing?.(6) || '24px'};
  background: #ffffff;
`

const HeaderRow = styled.header`
  display: grid;
  gap: ${({ theme }) => theme.spacing?.(2) || '12px'};
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
        <div>
          <Heading as="h1" level={1}>Aviso de Privacidad</Heading>
          <Small>Última actualización: {new Date().toLocaleDateString()}</Small>
        </div>
      </HeaderRow>

      <Section>
        <Heading as="h2" level={2}>Identidad y domicilio del Responsable</Heading>
        <Paragraph>
          Arroyo Seco, con domicilio en Querétaro, Qro., México, es responsable del tratamiento de sus datos personales
          conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) y demás normativa aplicable.
        </Paragraph>
        <Paragraph>
          Para cualquier asunto relacionado con privacidad y protección de datos, puede contactarnos a través de los medios señalados en el sitio.
        </Paragraph>
      </Section>

      <Section>
        <Heading as="h2" level={2}>Datos personales sujetos a tratamiento</Heading>
        <Paragraph>
          Podremos tratar, de manera enunciativa, nombre y apellidos, correo electrónico, teléfono, ciudad, idioma, información de perfil como biografía,
          preferencias y datos relacionados con reservas y prestación de servicios.
        </Paragraph>
      </Section>

      <Section>
        <Heading as="h2" level={2}>Finalidades del tratamiento</Heading>
        <Paragraph>
          Finalidades primarias: (i) gestión de cuentas y autenticación, (ii) administración de alojamientos y reservas, (iii) comunicación operativa entre anfitrión y huésped,
          (iv) procesamiento de pagos y facturación, (v) cumplimiento de obligaciones legales.
        </Paragraph>
        <Paragraph>
          Finalidades secundarias: (i) mejora continua del servicio, (ii) métricas y analítica de uso, (iii) comunicaciones informativas sobre funcionalidades.
          En caso de que desee limitar o negar el uso de sus datos para finalidades secundarias, podrá manifestarlo mediante los medios de contacto indicados.
        </Paragraph>
      </Section>

      <Section>
        <Heading as="h2" level={2}>Transferencias y encargados</Heading>
        <Paragraph>
          Sus datos podrán ser compartidos con encargados y proveedores que apoyan en la operación (por ejemplo, servicios de autenticación, almacenamiento y analítica),
          exclusivamente para las finalidades descritas, bajo contratos y medidas de seguridad apropiadas. No se realizarán transferencias que requieran su consentimiento
          sin recabarlo previamente conforme a la LFPDPPP.
        </Paragraph>
      </Section>

      <Section>
        <Heading as="h2" level={2}>Derechos ARCO</Heading>
        <Paragraph>
          Usted puede ejercer los derechos de Acceso, Rectificación, Cancelación y Oposición (ARCO), así como solicitar la revocación del consentimiento y la limitación del uso o divulgación,
          mediante solicitud presentada a través de los canales de contacto indicados en el sitio. La solicitud debe contener al menos: nombre del titular, medio de contacto para responder,
          descripción clara de los datos respecto de los que se pretende ejercer el derecho y, en su caso, documentos que acrediten su identidad.
        </Paragraph>
      </Section>

      <Section>
        <Heading as="h2" level={2}>Conservación y seguridad</Heading>
        <Paragraph>
          Conservamos los datos por el tiempo estrictamente necesario para cumplir las finalidades informadas y las obligaciones legales aplicables.
          Implementamos medidas administrativas, técnicas y físicas razonables para proteger sus datos contra pérdida, acceso, uso o divulgación no autorizados.
        </Paragraph>
      </Section>

      <Section>
        <Heading as="h2" level={2}>Uso de tecnologías de rastreo</Heading>
        <Paragraph>
          Nuestro sitio puede utilizar cookies y tecnologías similares para mejorar la experiencia de uso. Estas tecnologías no identifican por sí mismas al titular,
          y pueden deshabilitarse desde las preferencias del navegador, teniendo en cuenta que ello podría afectar algunas funcionalidades.
        </Paragraph>
      </Section>

      <Section>
        <Heading as="h2" level={2}>Cambios al aviso de privacidad</Heading>
        <Paragraph>
          Este aviso puede actualizarse para reflejar cambios en prácticas o requisitos legales. Las modificaciones serán publicadas en esta página. Le recomendamos consultarlo periódicamente.
        </Paragraph>
      </Section>

      <Section>
        <Heading as="h2" level={2}>Autoridad y jurisdicción</Heading>
        <Paragraph>
          En caso de dudas o inconformidades sobre el tratamiento de sus datos personales, usted puede acudir ante el Instituto Nacional de Transparencia, Acceso a la Información y Protección de Datos Personales (INAI).
          Cualquier disputa relacionada con este aviso se regirá por las leyes aplicables en los Estados Unidos Mexicanos y, de manera específica, por la jurisdicción de Querétaro, Qro.
        </Paragraph>
      </Section>

      <Section>
        <Heading as="h2" level={2}>Términos y Condiciones del Servicio</Heading>
        <Paragraph>
          El uso del sitio y de los servicios de gestión de alojamientos y reservas se rige por estos Términos y Condiciones: (i) el usuario se compromete a proporcionar información veraz y actualizada,
          (ii) las reservas están sujetas a confirmación y capacidad, (iii) el usuario acepta las reglas de la plataforma y de cada alojamiento, (iv) el contenido y funcionalidades pueden cambiar sin previo aviso,
          (v) cualquier uso indebido podrá implicar la suspensión o cancelación de la cuenta, conforme a la normativa aplicable.
        </Paragraph>
      </Section>
    </Wrapper>
  )
}
