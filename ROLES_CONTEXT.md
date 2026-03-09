# Contexto y Lógica de Roles y Permisos en BALAMYA

Este documento sirve como base de conocimiento para recordar cómo funciona el sistema de roles y permisos en la aplicación (basado en `AuthContext.js`). **Siempre que se trabaje con permisos, navegación o vistas condicionales, debe tenerse en cuenta esta estructura.**

## 1. Tipos de Usuarios Principales
Los usuarios tienen las siguientes propiedades principales en la estructura de sesión de BALAMYA:
- `role`: Define el nivel de acceso (ej. `admin`, `veterinarian`, `assistant`, o categorías específicas como `aves`, `reptiles`). En el código actual, a veces el "rol" cumple también la función de "categoría".
- `specialty`: Refuerza a qué colección animal tienen acceso (ej. `all`, `aves`, `mamiferos`, `reptiles`, `anfibios`).

## 2. Reglas de Acceso (`hasAccessToCategory`)
El archivo principal que gestiona la sesión es `src/context/AuthContext.js`.
Existe un método clave llamado `hasAccessToCategory(category)`:
1. **Admin (`user.role === 'admin'`)**: Tiene acceso absoluto y global a TODAS las categorías y vistas dentro de la aplicación.
2. **Veterinarios por Especialidad (`user.role === category`)**: Solo pueden acceder a elementos (pacientes, gráficas, listados) que correspondan directamente a su categoría. Por ejemplo:
   - Un usuario con `role: 'aves'` solo verá aves.
   - Un usuario con `role: 'reptiles'` solo verá reptiles.
3. **Casos Especiales Heredados**:
   - Existen ajustes de compatibilidad (legacy) donde temporalmente si `data.role === 'mamiferos'` se le llegó a asignar acceso `all`. **No obviar** revisar el condicional de login si se detectan permisos que cruzan áreas.
   - `assistant` (Asistente general) típicamente tiene un set de permisos de solo lectura o acceso base, aunque en el MVP o en ciertas vistas no recibe categoría médica asignada.

## 3. Consideraciones de Desarrollo
- **Navbar/Menú Lateral:** Si se agregan botones exclusivos para administración, siempre deben validarse con `if (user?.role === 'admin')`.
- **Backend/Peticiones:** Las vistas frontend delegan el filtrado a la UI llamando a `hasAccessToCategory()`, pero idealmente en listados mockeados o futuros consumos a base de datos, siempre pasar el ID o rol para traer solo lo que les toca.
- **Rutas Prohibidas:** Actualmente las rutas están abiertas (`/patients`, `/treatments`, etc.) pero el contenido interno se filtra en base al usuario. 
- **Estructura del Mockup:** Los usuarios mock de ejemplo viven en `AuthContext` como `MOCK_USERS` con correos de prueba como `aves@balamya.org` (pw: `aves`), `admin@balamya.org` (pw: `admin`). Usarlos para navegar.

---
**Instrucción a la Inteligencia Artificial:**
Cuando se te pida realizar una tarea que involucre "Permisos", "Menús Restringidos", "Filtros de Especialidad", "Login" o "Ajustar qué puede ver "X" Doctor", debes referirte a estas reglas y asegurarte de aplicar las validaciones correspondientes llamando a `useAuth()` y a `hasAccessToCategory()`.
