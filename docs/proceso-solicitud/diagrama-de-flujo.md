# Diagrama de flujo: registrar solicitud

## Propósito

Visualizar el recorrido operativo y los puntos de decisión del proceso de registro.

```mermaid
flowchart TD
    A[Inicio] --> B[Mostrar formulario]
    B --> C[Capturar datos del usuario]
    C --> D[Enviar solicitud]
    D --> E{¿Datos válidos?}
    E -- No --> F[Mostrar errores de validación]
    F --> B
    E -- Sí --> G[Persistir solicitud]
    G --> H{¿Guardado exitoso?}
    H -- No --> I[Notificar error técnico controlado]
    H -- Sí --> J[Notificar confirmación]
    I --> K[Fin]
    J --> K[Fin]
```

## Observaciones

- El bucle de validación evita persistir información inválida.
- Se separa explícitamente la falla funcional (validación) de la falla técnica (persistencia).
