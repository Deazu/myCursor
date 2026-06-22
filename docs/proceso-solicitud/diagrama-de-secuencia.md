# Diagrama de secuencia: registrar solicitud

## Propósito

Describir el intercambio de mensajes entre actores y componentes durante la operación.

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    participant S as Sistema
    participant DB as Base de datos

    U->>S: Iniciar registro
    S-->>U: Mostrar formulario
    U->>S: Enviar datos
    S->>S: Validar datos

    alt Datos válidos
        S->>DB: Insertar solicitud
        DB-->>S: Confirmar inserción (id_solicitud)
        S-->>U: Confirmación de registro
    else Datos inválidos
        S-->>U: Errores de validación por campo
    end

    opt Error técnico de persistencia
        S->>DB: Insertar solicitud
        DB-->>S: Error de transacción
        S-->>U: Mensaje de error técnico controlado
    end
```

## Observaciones

- Se modela tanto el camino funcional (validación) como el camino técnico (transacción fallida).
- El sistema mantiene mensajes controlados hacia el usuario final.
