# Fraude_UNICO_Banda_Ancha

🚨 **Sitio Web para Denunciar Fraudes en el Despliegue de Fibra Óptica en España**

Este repositorio nace para documentar y visibilizar los casos de fraude y malas prácticas en el despliegue de fibra óptica en España, especialmente aquellos en los que los operadores (p. ej., Telefónica/Movistar) han declarado cobertura inexistente, o han incumplido compromisos de despliegue.

## 🌐 Funcionalidades del Sitio Web

### 📋 Formulario de Denuncia Interactivo
- **Formulario completo en español** para reportar casos de fraude
- **Dos secciones principales de evidencia**:
  1. Prueba de que Telefónica declaró cobertura en la referencia catastral específica
  2. Prueba de que los operadores no proporcionan el servicio
- **Enlaces directos** a recursos útiles para obtener información faltante
- **Subida de archivos** para evidencia (PDFs, imágenes, documentos)
- **Validación en tiempo real** de formularios

### 📊 Dashboard de Análisis
- **Estadísticas en tiempo real** de denuncias registradas
- **Gráficos interactivos** por operador y tendencias mensuales
- **Filtrado avanzado** por operador, fechas, etc.
- **Exportación de datos** en formato JSON
- **Tabla detallada** de casos recientes

### 🗄️ Base de Datos Local
- **Almacenamiento local** utilizando IndexedDB
- **Organización automática** de datos de denuncias
- **Gestión de archivos** adjuntos con metadatos
- **Funciones de exportación** para respaldo de datos

## 🚀 Cómo Usar

### Instalación
1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/lmanubens/Fraude_UNICO_Banda_Ancha.git
   cd Fraude_UNICO_Banda_Ancha
   ```

2. **Servir los archivos** (requerido para funcionalidad completa):
   ```bash
   # Opción 1: Usar Python
   python -m http.server 8000
   
   # Opción 2: Usar Node.js
   npx serve .
   
   # Opción 3: Usar cualquier servidor web local
   ```

3. **Abrir en navegador**:
   - Ir a `http://localhost:8000`
   - Acceder a `index.html` para el formulario principal
   - Acceder a `dashboard.html` para ver estadísticas

### Uso del Formulario

1. **Información de contacto**: Llenar datos personales y de ubicación
2. **Referencia catastral**: Usar el enlace proporcionado para consultar la referencia
3. **Sección 1 - Cobertura declarada**:
   - Consultar los enlaces a portales oficiales
   - Subir capturas de pantalla/documentos que demuestren la cobertura declarada
4. **Sección 2 - Falta de servicio**:
   - Usar los enlaces para consultar disponibilidad real
   - Documentar las respuestas negativas de los operadores
   - Subir evidencia de la falta de servicio

## 📁 Estructura del Proyecto

```
Fraude_UNICO_Banda_Ancha/
├── index.html          # Formulario principal de denuncia
├── dashboard.html      # Dashboard de análisis de datos
├── styles.css          # Estilos CSS responsivos
├── script.js           # Lógica JavaScript y gestión de base de datos
└── README.md           # Este archivo
```

## 🔗 Enlaces Útiles Integrados

### Para Obtener Pruebas de Cobertura:
- Portal de Cobertura de Banda Ancha (Ministerio)
- Mapa de Cobertura Movistar
- CNMC - Información de Banda Ancha
- Consulta oficial de cobertura ITI
- Consulta de referencia catastral

### Para Comprobar Disponibilidad Real:
- Consultas de disponibilidad de todos los operadores principales
- Telefónica/Movistar, Orange, Vodafone, MásMóvil

## 💾 Gestión de Datos

### Almacenamiento Local
- Los datos se almacenan localmente en el navegador usando IndexedDB
- No se envían datos a servidores externos
- Control total sobre la información personal

### Exportación de Datos
- **JSON completo**: Todos los datos de denuncias
- **Estadísticas**: Resumen y análisis
- **Filtros**: Exportación de datos específicos

### Seguridad y Privacidad
- Datos almacenados únicamente en el dispositivo local
- Opción de consentimiento para uso anónimo de datos
- No se requiere registro ni login

## 🎯 Casos de Uso

1. **Ciudadanos afectados**: Documentar casos de fraude con evidencia
2. **Organizaciones de consumidores**: Recopilar casos para acciones legales
3. **Investigadores**: Analizar patrones de fraude geográfico
4. **Autoridades regulatorias**: Acceso a datos organizados de denuncias

## 🛠️ Tecnologías Utilizadas

- **HTML5**: Estructura del sitio web
- **CSS3**: Diseño responsivo y moderno
- **JavaScript (ES6+)**: Lógica de aplicación
- **IndexedDB**: Base de datos local del navegador
- **Chart.js**: Gráficos interactivos en el dashboard
- **Progressive Web App**: Funcionalidad offline

## 📱 Compatibilidad

- ✅ **Navegadores modernos**: Chrome, Firefox, Safari, Edge
- ✅ **Dispositivos móviles**: Diseño responsivo completo
- ✅ **Funcionalidad offline**: Una vez cargado, funciona sin internet
- ✅ **Accesibilidad**: Cumple estándares WCAG

## 🤝 Contribuir

Las contribuciones son bienvenidas:

1. Fork el proyecto
2. Crear rama para nueva funcionalidad
3. Commit de cambios
4. Push a la rama
5. Abrir Pull Request

## 📞 Soporte

Para reportar problemas o sugerir mejoras:
- Abrir un **Issue** en GitHub
- Incluir detalles del navegador y pasos para reproducir

## ⚖️ Aspectos Legales

- Esta herramienta es para **documentación** de casos
- Para reclamaciones oficiales, contactar organismos competentes (CNMC, etc.)
- Los datos recopilados pueden usarse de forma anónima para estudios

---

**🔴 ¡Ayuda a combatir el fraude en el despliegue de banda ancha en España!**
