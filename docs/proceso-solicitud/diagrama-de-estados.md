# Diagrama de estados: ciclo de vida de una solicitud

## Propósito

Modelar cómo evoluciona la solicitud desde su creación hasta su estado final inmediato dentro del proceso de registro.

```mermaid
stateDiagram-v2
    [*] --> Borrador: Usuario inicia formulario
    Borrador --> EnValidacion: Usuario envía datos

    EnValidacion --> RechazadaValidacion: Reglas inválidas
    RechazadaValidacion --> Borrador: Usuario corrige datos

    EnValidacion --> EnPersistencia: Reglas válidas
    EnPersistencia --> ErrorTecnico: Falla en base de datos
    EnPersistencia --> Registrada: Guardado exitoso

    ErrorTecnico --> [*]
    Registrada --> [*]
```

## Justificación del diagrama adicional

Este diagrama complementa flujo y secuencia porque:

1. Define estados explícitos para trazabilidad y monitoreo.
2. Facilita diseño de reglas de transición en backend.
3. Ayuda a QA a validar transiciones válidas e inválidas.
