# Caso de uso: registrar solicitud

## Objetivo

Permitir que un usuario registre una solicitud de forma validada, trazable y con confirmación explícita del resultado.

## Actores

- **Principal:** Usuario
- **Secundarios:** Sistema, Base de datos

## Disparador

El usuario decide iniciar una nueva solicitud.

## Precondiciones

1. El sistema está disponible.
2. El usuario puede acceder al formulario.
3. La base de datos está operativa.

## Postcondiciones

### Éxito

- La solicitud queda registrada con identificador único.
- El usuario recibe confirmación de registro.

### Falla controlada

- No se registra información inválida.
- El usuario recibe mensajes de validación accionables.

## Flujo principal

1. El usuario inicia el proceso.
2. El sistema muestra el formulario.
3. El usuario completa y envía los datos.
4. El sistema valida formato, obligatoriedad y consistencia.
5. El sistema registra la solicitud.
6. El sistema devuelve confirmación al usuario.

## Flujos alternos

### A1. Datos inválidos o incompletos

1. En la validación, el sistema detecta errores.
2. El sistema no persiste datos.
3. El sistema muestra errores por campo.
4. El usuario corrige y reenvía.

### A2. Error de persistencia

1. La validación es exitosa.
2. Ocurre una falla al guardar en base de datos.
3. El sistema informa error técnico controlado.
4. La operación queda en estado no registrada.

## Reglas de negocio

- RB-01: Todo campo obligatorio debe estar presente antes de persistir.
- RB-02: No se permite guardar solicitudes duplicadas según criterio de unicidad definido por negocio.
- RB-03: Cada solicitud registrada debe generar un identificador trazable.

## Criterios de aceptación

- CA-01: Si los datos son válidos, se guarda una única solicitud y se confirma al usuario.
- CA-02: Si los datos son inválidos, se muestran errores específicos y no se guarda nada.
- CA-03: Si ocurre error técnico de persistencia, se informa al usuario sin exponer detalles sensibles.
