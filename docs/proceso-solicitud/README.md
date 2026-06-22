# Documentación funcional: proceso de solicitud

Esta sección consolida los artefactos funcionales del proceso principal de **gestión de solicitudes**.

## Estructura

- [Caso de uso](./caso-de-uso.md)
- [Diagrama de flujo](./diagrama-de-flujo.md)
- [Diagrama de secuencia](./diagrama-de-secuencia.md)
- [Diagrama de estados](./diagrama-de-estados.md)

## Alcance

El alcance cubre el flujo base desde que el usuario inicia una solicitud hasta que el sistema confirma el resultado.  
Se modelan escenarios exitosos y escenarios de validación fallida.

## Convenciones

- Los diagramas están escritos en **Mermaid** para render nativo en GitHub.
- Se mantiene una nomenclatura consistente de actores:
  - **Usuario**: actor externo que inicia la operación.
  - **Sistema**: aplicación que valida y orquesta.
  - **Base de datos**: persistencia transaccional.
